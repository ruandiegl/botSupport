import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "gtfbot_super_secret_key_2026";

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string | null;
}

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

let io: SocketIOServer | null = null;
const disconnectDebounceMap = new Map<string, NodeJS.Timeout>();

export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.warn({ socketId: socket.id }, "Socket connection rejected: No token provided");
      return next(new Error("Autenticação necessária"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SocketUser;
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn({ socketId: socket.id, err }, "Socket connection rejected: Invalid token");
      return next(new Error("Token inválido ou expirado"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const user = socket.user;
    if (!user) return;

    logger.info({ socketId: socket.id, userId: user.id, userName: user.name }, "Socket cliente conectado");

    if (disconnectDebounceMap.has(user.id)) {
      clearTimeout(disconnectDebounceMap.get(user.id)!);
      disconnectDebounceMap.delete(user.id);
    }

    socket.join("queue");
    socket.join("agents");
    socket.join(`agent:${user.id}`);

    try {
      await prisma.agent.update({
        where: { id: user.id },
        data: { isOnline: true },
      });
      io?.to("agents").emit("agent:status", {
        agentId: user.id,
        agentName: user.name,
        isOnline: true,
      });
    } catch (err) {
      logger.error({ err, userId: user.id }, "Erro ao marcar atendente como online no socket");
    }

    socket.on("conversation:join", async (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        select: { status: true, departmentId: true, assignedAgentId: true },
      }).catch((error) => {
        logger.error({ error, userId: user.id, conversationId: data.conversationId }, "Falha ao validar acesso à sala da conversa");
        return null;
      });
      const allowed = Boolean(conversation) && (
        user.role === "ADMIN" ||
        user.role === "SUPERVISOR" ||
        conversation?.assignedAgentId === user.id ||
        Boolean(conversation?.status === "OPEN" && user.departmentId && conversation?.departmentId === user.departmentId)
      );
      if (!allowed) {
        logger.warn({ userId: user.id, conversationId: data.conversationId }, "Socket recusou acesso à conversa");
        return;
      }
      const room = `conversation:${data.conversationId}`;
      socket.join(room);
      logger.debug({ userId: user.id, conversationId: data.conversationId }, "Socket entrou na conversa");
    });

    socket.on("conversation:leave", (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      const room = `conversation:${data.conversationId}`;
      socket.leave(room);
      logger.debug({ userId: user.id, conversationId: data.conversationId }, "Socket saiu da conversa");
    });

    socket.on("typing:start", (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      socket.to(`conversation:${data.conversationId}`).emit("typing:update", {
        conversationId: data.conversationId,
        agentId: user.id,
        agentName: user.name,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      socket.to(`conversation:${data.conversationId}`).emit("typing:update", {
        conversationId: data.conversationId,
        agentId: user.id,
        agentName: user.name,
        isTyping: false,
      });
    });

    socket.on("disconnect", (reason) => {
      logger.info({ socketId: socket.id, userId: user.id, reason }, "Socket cliente desconectado");

      const timer = setTimeout(async () => {
        disconnectDebounceMap.delete(user.id);

        const matchingSockets = await io?.in(`agent:${user.id}`).fetchSockets();
        if (!matchingSockets || matchingSockets.length === 0) {
          try {
            await prisma.agent.update({
              where: { id: user.id },
              data: { isOnline: false },
            });
            io?.to("agents").emit("agent:status", {
              agentId: user.id,
              agentName: user.name,
              isOnline: false,
            });
          } catch (err) {
            logger.error({ err, userId: user.id }, "Erro ao marcar atendente como offline no socket");
          }
        }
      }, 5000);

      disconnectDebounceMap.set(user.id, timer);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export const socketEmitter = {
  emitToRoom(room: string, event: string, payload: any) {
    if (io) {
      io.to(room).emit(event, payload);
    }
  },

  emitToQueue(event: string, payload: any) {
    if (io) {
      io.to("queue").emit(event, payload);
    }
  },

  emitToConversation(conversationId: string, event: string, payload: any) {
    if (io) {
      io.to(`conversation:${conversationId}`).emit(event, payload);
    }
  },

  emitToAgent(agentId: string, event: string, payload: any) {
    if (io) {
      io.to(`agent:${agentId}`).emit(event, payload);
    }
  },
};
