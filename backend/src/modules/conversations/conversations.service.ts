import { conversationsRepository } from "./conversations.repository.js";
import { zApiService } from "../zapi/zapi.service.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { mediaService } from "../media/media.service.js";

const DEFAULT_MESSAGE_LIMIT = 50;

function encodeMessageCursor(message: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: message.createdAt.toISOString(), id: message.id }), "utf8").toString("base64url");
}

function decodeMessageCursor(value?: string): { createdAt: Date; id: string } | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { createdAt?: unknown; id?: unknown };
    if (typeof parsed.createdAt !== "string" || typeof parsed.id !== "string" || !parsed.id) return undefined;
    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) return undefined;
    return { createdAt, id: parsed.id };
  } catch {
    return undefined;
  }
}

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
    return Boolean(conversation.status === "OPEN" && user.departmentId && conversation.departmentId === user.departmentId);
  }

  private formatMessage(message: any, conversation: any) {
    return {
      id: message.id,
      direction: message.direction,
      senderType: message.senderType,
      senderName:
        message.senderType === "AGENT"
          ? message.senderAgent?.name ?? conversation.assignedAgent?.name ?? "Atendente"
          : message.senderType === "BOT"
          ? "GTF-Bot"
          : conversation.contact?.name ?? "Cliente",
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      media: message.media ? mediaService.toPublic(message.media) : null,
    };
  }

  private formatSummary(summary: any) {
    const latest = summary.messages?.[0];
    return {
      id: summary.id,
      contact: {
        name: summary.contact?.name ?? "Contato sem nome",
        phone: summary.contact?.phone ?? "",
        initials: getInitials(summary.contact?.name ?? "CS"),
      },
      status: summary.status,
      departmentId: summary.departmentId,
      departmentName: summary.department?.name ?? null,
      assignedAgentId: summary.assignedAgentId,
      assignedAgentName: summary.assignedAgent?.name ?? null,
      labels: (summary.labels || []).map((item: any) => item.label),
      groupChatName: summary.groupChatName ?? null,
      unreadCount: summary._count?.messages ?? 0,
      lastMessage: latest?.content ?? "Nenhuma mensagem ainda",
      // The queue never needs the full history. Keep the property for
      // compatibility with older clients that expect Conversation.messages.
      messages: [],
      startedAt: summary.startedAt.toISOString(),
      queuedAt: summary.queuedAt?.toISOString() ?? null,
      lastActivityAt: summary.lastActivityAt.toISOString(),
      closedAt: summary.closedAt?.toISOString() ?? null,
    };
  }

  async formatConversation(id: string, options: { messageLimit?: number; before?: string } = {}) {
    const before = decodeMessageCursor(options.before);
    const messageLimit = options.messageLimit;
    const conversation = await conversationsRepository.findById(id, {
      ...(messageLimit ? { messageLimit } : {}),
      ...(before ? { before } : {}),
    });
    if (!conversation) return null;

    const fetchedMessages = conversation.messages || [];
    const hasPrevious = Boolean(messageLimit && fetchedMessages.length > messageLimit);
    const messages = messageLimit ? fetchedMessages.slice(0, messageLimit).reverse() : fetchedMessages.slice().reverse();
    const lastMessage = messages.at(-1)?.content ?? "Nenhuma mensagem ainda";
    const unreadCount = conversation._count?.messages ?? messages.filter((m) => m.direction === "IN" && !m.readAt).length;

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
      labels: (conversation.labels || []).map((item: any) => item.label),
      groupChatName: conversation.groupChatName ?? null,
      unreadCount,
      lastMessage,
      messages: messages.map((m) => this.formatMessage(m, conversation)),
      messagesPagination: messageLimit
        ? {
            limit: messageLimit,
            hasPrevious,
            previousCursor: hasPrevious && messages[0] ? encodeMessageCursor(messages[0]) : null,
          }
        : undefined,
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
    labelIds?: string[];
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
      dateField: filters.dateField,
      from: filters.from,
      to: filters.to,
    });
    const items = result.isSummary
      ? result.items.map((item) => this.formatSummary(item))
      : (await Promise.all(result.items.map((c) => this.formatConversation(c.id)))).filter(Boolean);
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
        labelIds: filters.labelIds ?? [],
        q: filters.q ?? null,
        dateField: filters.dateField ?? "lastActivityAt",
        from: filters.from ?? null,
        to: filters.to ?? null,
        sort: filters.sort ?? "operational",
      },
    };
  }

  async getById(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findById(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
    if (!conversation || !this.canAccess(conversation, user)) return null;
    return this.formatConversationRecord(conversation, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }

  private formatConversationRecord(conversation: any, options: { messageLimit?: number } = {}) {
    const fetchedMessages = conversation.messages || [];
    const messageLimit = options.messageLimit;
    const hasPrevious = Boolean(messageLimit && fetchedMessages.length > messageLimit);
    const messages = messageLimit ? fetchedMessages.slice(0, messageLimit).reverse() : fetchedMessages.slice().reverse();
    const lastMessage = messages.at(-1)?.content ?? "Nenhuma mensagem ainda";
    const unreadCount = conversation._count?.messages ?? messages.filter((m: any) => m.direction === "IN" && !m.readAt).length;
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
      labels: (conversation.labels || []).map((item: any) => item.label),
      groupChatName: conversation.groupChatName ?? null,
      unreadCount,
      lastMessage,
      messages: messages.map((m: any) => this.formatMessage(m, conversation)),
      messagesPagination: messageLimit
        ? { limit: messageLimit, hasPrevious, previousCursor: hasPrevious && messages[0] ? encodeMessageCursor(messages[0]) : null }
        : undefined,
      startedAt: conversation.startedAt.toISOString(),
      queuedAt: conversation.queuedAt?.toISOString() ?? null,
      lastActivityAt: conversation.lastActivityAt.toISOString(),
      closedAt: conversation.closedAt?.toISOString() ?? null,
    };
  }

  async listMessages(id: string, options: { limit: number; before?: string }, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;
    const before = decodeMessageCursor(options.before);
    if (options.before && !before) return { invalidCursor: true } as const;

    const page = await conversationsRepository.findMessages(id, { limit: options.limit, before });
    const items = page.items.map((message) => this.formatMessage(message, conversation));
    return {
      items,
      pagination: {
        limit: options.limit,
        hasPrevious: page.hasPrevious,
        previousCursor: page.hasPrevious && page.items[page.items.length - 1]
          ? encodeMessageCursor(page.items[page.items.length - 1])
          : null,
      },
    };
  }

  async markAsRead(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation) return null;
    if (!this.canAccess(conversation, user)) return null;

    await conversationsRepository.markIncomingMessagesAsRead(id);
    conversationEvents.emit("conversation_updated", { conversationId: id, unreadCount: 0, eventType: "READ" });

    return this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }

  async assume(id: string, agentId: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;
    // Agents can only assume a conversation for their own identity. Supervisors
    // and administrators retain the ability to assign another eligible agent.
    if (user?.role === "AGENT" && agentId !== user.id) return null;

    await conversationsRepository.updateStatusAndAgent(id, "IN_PROGRESS", agentId);

    conversationEvents.emit("conversation_updated", { conversationId: id, eventType: "ASSIGNED", assignedAgentId: agentId });

    return this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }

  async close(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;

    await conversationsRepository.close(id);

    conversationEvents.emit("conversation_updated", { conversationId: id, status: "CLOSED", eventType: "CLOSED" });

    return this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }

  async sendMessage(id: string, rawContent: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
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
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;

    const dept = await conversationsRepository.findDepartmentById(departmentId);
    const deptName = dept?.name ?? "Novo Departamento";

    const queued = await conversationsRepository.updateStatusAndAgent(id, "OPEN", null);
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

    conversationEvents.emit("conversation_updated", { conversationId: id, status: "OPEN", eventType: "NEW_QUEUE", departmentId, assignedAgentId: null, queuedAt: queued.queuedAt });

    return this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }
}

export const conversationsService = new ConversationsService();
