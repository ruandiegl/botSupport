import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { API_BASE_URL } from "./api-config";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  startGroupTyping: (groupId: string) => void;
  stopGroupTyping: (groupId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = API_BASE_URL;

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("[Socket.IO] Conectado ao servidor:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("[Socket.IO] Desconectado do servidor:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket.IO] Erro de conexão:", error.message);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("conversation:join", { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("conversation:leave", { conversationId });
    }
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:start", { conversationId });

      if (typingTimerRef.current[conversationId]) {
        clearTimeout(typingTimerRef.current[conversationId]);
      }

      typingTimerRef.current[conversationId] = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("typing:stop", { conversationId });
        }
        delete typingTimerRef.current[conversationId];
      }, 3000);
    }
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      if (typingTimerRef.current[conversationId]) {
        clearTimeout(typingTimerRef.current[conversationId]);
        delete typingTimerRef.current[conversationId];
      }
      socketRef.current.emit("typing:stop", { conversationId });
    }
  }, []);

  const joinGroup = useCallback((groupId: string) => {
    if (socketRef.current?.connected) socketRef.current.emit("group:join", { groupId });
  }, []);

  const leaveGroup = useCallback((groupId: string) => {
    if (socketRef.current?.connected) socketRef.current.emit("group:leave", { groupId });
  }, []);

  const startGroupTyping = useCallback((groupId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("group:typing:start", { groupId });
    const key = `group:${groupId}`;
    if (typingTimerRef.current[key]) clearTimeout(typingTimerRef.current[key]);
    typingTimerRef.current[key] = setTimeout(() => {
      socketRef.current?.emit("group:typing:stop", { groupId });
      delete typingTimerRef.current[key];
    }, 3000);
  }, []);

  const stopGroupTyping = useCallback((groupId: string) => {
    const key = `group:${groupId}`;
    if (typingTimerRef.current[key]) {
      clearTimeout(typingTimerRef.current[key]);
      delete typingTimerRef.current[key];
    }
    socketRef.current?.emit("group:typing:stop", { groupId });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        joinGroup,
        leaveGroup,
        startGroupTyping,
        stopGroupTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket deve ser usado dentro de um SocketProvider");
  }
  return context;
}
