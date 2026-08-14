import { conversationsRepository } from "./conversations.repository.js";
import { zApiService } from "../zapi/zapi.service.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { mediaService } from "../media/media.service.js";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export class ConversationsService {
  private canAccess(conversation: any, user?: AuthenticatedRequest["user"]): boolean {
    if (!user || user.role === "ADMIN" || user.role === "SUPERVISOR") return true;
    if (user.role !== "AGENT") return true;
    if (conversation.assignedAgentId === user.id) return true;
    return Boolean(conversation.status === "QUEUED" && user.departmentId && conversation.departmentId === user.departmentId);
  }

  async formatConversation(id: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    const messages = conversation.messages || [];
    const lastMessage = messages.at(-1)?.content ?? "Nenhuma mensagem ainda";
    const unreadCount = messages.filter((m) => m.direction === "IN" && !m.readAt).length;

    return {
      id: conversation.id,
      contact: {
        name: conversation.contact?.name ?? "Contato sem nome",
        phone: conversation.contact?.phone ?? "",
        initials: getInitials(conversation.contact?.name ?? "CS"),
      },
      status: conversation.status,
      departmentId: conversation.departmentId,
      departmentName: conversation.department?.name ?? null,
      assignedAgentId: conversation.assignedAgentId,
      assignedAgentName: conversation.assignedAgent?.name ?? null,
      unreadCount,
      lastMessage,
      messages: messages.map((m) => ({
        id: m.id,
        direction: m.direction,
        senderType: m.senderType,
        senderName:
          m.senderType === "AGENT"
            ? conversation.assignedAgent?.name ?? "Atendente"
            : m.senderType === "BOT"
            ? "GTF-Bot"
            : conversation.contact?.name ?? "Cliente",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        media: m.media ? mediaService.toPublic(m.media) : null,
      })),
      startedAt: conversation.startedAt.toISOString(),
      queuedAt: conversation.queuedAt?.toISOString() ?? null,
      lastActivityAt: conversation.lastActivityAt.toISOString(),
      closedAt: conversation.closedAt?.toISOString() ?? null,
    };
  }

  async list(filters: {
    status?: string;
    departmentId?: string;
    assignedAgentId?: string;
    openOnly?: boolean;
    unreadOnly?: boolean;
    q?: string;
    dateField?: "lastActivityAt" | "createdAt";
    from?: string;
    to?: string;
    sort?: "operational" | "recent" | "oldest";
    page?: number;
    limit?: number;
  }, user?: AuthenticatedRequest["user"]) {
    const result = await conversationsRepository.findMany(filters);
    const counts = await conversationsRepository.countOperational({
      departmentId: user?.role === "AGENT" ? user.departmentId : undefined,
      agentId: user?.id,
      accessible: user?.role !== "AGENT" || Boolean(user.departmentId),
    });
    const results = await Promise.all(result.items.map((c) => this.formatConversation(c.id)));
    const items = results.filter(Boolean);
    if (!result.isPaged) return items;
    return {
      items,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      counts,
      appliedFilters: {
        status: filters.status ?? "ALL",
        departmentId: filters.departmentId ?? null,
        assignedAgentId: filters.assignedAgentId ?? null,
        openOnly: filters.openOnly ?? false,
        unreadOnly: filters.unreadOnly ?? false,
        q: filters.q ?? null,
        dateField: filters.dateField ?? "lastActivityAt",
        from: filters.from ?? null,
        to: filters.to ?? null,
        sort: filters.sort ?? "operational",
      },
    };
  }

  async getById(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;
    return this.formatConversation(id);
  }

  async markAsRead(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;
    if (!this.canAccess(conversation, user)) return null;

    await conversationsRepository.markIncomingMessagesAsRead(id);
    conversationEvents.emit("conversation_updated", { conversationId: id, unreadCount: 0, eventType: "READ" });

    return this.formatConversation(id);
  }

  async assume(id: string, agentId: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;
    // Agents can only assume a conversation for their own identity. Supervisors
    // and administrators retain the ability to assign another eligible agent.
    if (user?.role === "AGENT" && agentId !== user.id) return null;

    await conversationsRepository.updateStatusAndAgent(id, "IN_PROGRESS", agentId);

    conversationEvents.emit("conversation_updated", { conversationId: id, eventType: "ASSIGNED", assignedAgentId: agentId });

    return this.formatConversation(id);
  }

  async close(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;

    await conversationsRepository.close(id);

    conversationEvents.emit("conversation_updated", { conversationId: id, status: "CLOSED", eventType: "CLOSED" });

    return this.formatConversation(id);
  }

  async sendMessage(id: string, rawContent: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;

    let agent = conversation.assignedAgent;
    if (!agent && conversation.assignedAgentId) {
      agent = await conversationsRepository.findAgentById(conversation.assignedAgentId);
    }
    if (!agent) {
      agent = await conversationsRepository.findFirstAgent();
    }

    const agentName = agent?.name ?? "Atendente";
    const deptName = agent?.department?.name || conversation.department?.name || "Suporte T.I.";
    const cleanContent = rawContent.trim();

    const content = cleanContent.startsWith("*")
      ? cleanContent
      : `*${agentName} - ${deptName}:*\n\n${cleanContent}`;

    const message = await conversationsRepository.addMessage({
      conversationId: id,
      direction: "OUT",
      senderType: "AGENT",
      senderAgentId: agent?.id ?? null,
      content,
    });

    // Disparar via Z-API no WhatsApp real
    if (conversation.contact?.phone) {
      await zApiService.sendText(conversation.contact.phone, content);
    }

    const formattedMsg = {
      id: message.id,
      direction: message.direction,
      senderType: message.senderType,
      senderName: agentName,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };

    socketEmitter.emitToConversation(id, "message:new", {
      conversationId: id,
      message: formattedMsg,
    });

    conversationEvents.emit("conversation_updated", { conversationId: id, eventType: "MESSAGE_SENT", messageId: message.id });

    return formattedMsg;
  }

  async transfer(id: string, departmentId: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;

    const dept = await conversationsRepository.findDepartmentById(departmentId);
    const deptName = dept?.name ?? "Novo Departamento";

    const queued = await conversationsRepository.updateStatusAndAgent(id, "QUEUED", null);
    await conversationsRepository.updateDepartment(id, departmentId);

    const transferText = `Seu atendimento foi transferido para a fila de *${deptName}*. Em breve um atendente deste departamento irá assumir.`;

    await conversationsRepository.addMessage({
      conversationId: id,
      direction: "OUT",
      senderType: "BOT",
      content: transferText,
    });

    if (conversation.contact?.phone) {
      await zApiService.sendText(conversation.contact.phone, transferText);
    }

    conversationEvents.emit("conversation_updated", { conversationId: id, status: "QUEUED", eventType: "NEW_QUEUE", departmentId, assignedAgentId: null, queuedAt: queued.queuedAt });

    return this.formatConversation(id);
  }
}

export const conversationsService = new ConversationsService();
