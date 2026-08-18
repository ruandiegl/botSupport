import { conversationsRepository } from "./conversations.repository.js";
import { zApiService } from "../zapi/zapi.service.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { mediaService } from "../media/media.service.js";
import { notificationsService } from "../notifications/notifications.service.js";

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
    // Collaboration is allowed for agents in the ticket department even after
    // another agent assumed it. Assignment still controls ownership and queue
    // ordering, but it must not rewrite message authorship.
    return Boolean(user.departmentId && conversation.departmentId === user.departmentId);
  }

  private formatMessage(message: any, conversation: any) {
    return {
      id: message.id,
      direction: message.direction,
      senderType: message.senderType,
      senderName:
        message.senderType === "AGENT"
          ? message.senderNameSnapshot ?? message.senderAgent?.name ?? "Atendente"
          : message.senderType === "BOT"
          ? "GTF-Bot"
          : message.senderNameSnapshot ?? message.senderContact?.name ?? conversation.contact?.name ?? "Cliente",
      senderDepartmentName: message.senderType === "AGENT"
        ? message.senderDepartmentSnapshot ?? message.senderAgent?.department?.name ?? null
        : null,
      senderContactId: message.senderContactId ?? null,
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
      assignments: (conversation.assignments || []).map((assignment: any) => ({
        id: assignment.id,
        action: assignment.action,
        reason: assignment.reason,
        response: assignment.response ?? null,
        respondedAt: assignment.respondedAt?.toISOString() ?? null,
        createdAt: assignment.createdAt.toISOString(),
        fromAgent: assignment.fromAgent ? { id: assignment.fromAgent.id, name: assignment.fromAgent.name } : null,
        toAgent: assignment.toAgent ? { id: assignment.toAgent.id, name: assignment.toAgent.name, departmentName: assignment.toAgent.department?.name ?? null } : null,
        actorAgent: assignment.actorAgent ? { id: assignment.actorAgent.id, name: assignment.actorAgent.name } : null,
      })),
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
      assignments: (conversation.assignments || []).map((assignment: any) => ({
        id: assignment.id,
        action: assignment.action,
        reason: assignment.reason,
        response: assignment.response ?? null,
        respondedAt: assignment.respondedAt?.toISOString() ?? null,
        createdAt: assignment.createdAt.toISOString(),
        fromAgent: assignment.fromAgent ? { id: assignment.fromAgent.id, name: assignment.fromAgent.name } : null,
        toAgent: assignment.toAgent ? { id: assignment.toAgent.id, name: assignment.toAgent.name, departmentName: assignment.toAgent.department?.name ?? null } : null,
        actorAgent: assignment.actorAgent ? { id: assignment.actorAgent.id, name: assignment.actorAgent.name } : null,
      })),
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
    const target = await conversationsRepository.findAgentById(agentId);
    if (!target || !target.isActive) return null;
    if (user?.role === "SUPERVISOR" && user.departmentId && target.departmentId !== user.departmentId) return null;

    await conversationsRepository.updateStatusAndAgent(id, "IN_PROGRESS", agentId);
    if (user) {
      await conversationsRepository.recordAssignment({
        conversationId: id,
        fromAgentId: conversation.assignedAgentId,
        toAgentId: agentId,
        actorAgentId: user.id,
        action: "ASSUME",
      });
    }

    conversationEvents.emit("conversation_updated", { conversationId: id, eventType: "ASSIGNED", assignedAgentId: agentId });

    return this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }

  async listEligibleAssignees(id: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;
    if (!user || user.role === "AGENT") return { forbidden: true } as const;
    const items = await conversationsRepository.findEligibleAssignees(id, user);
    return {
      items: (items || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        isOnline: agent.isOnline,
        isActive: true,
        departmentId: agent.departmentId,
        departmentName: agent.department?.name ?? null,
      })),
    };
  }

  async delegate(id: string, targetAgentId: string, reason?: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return { kind: "NOT_FOUND" as const };
    if (!user || user.role === "AGENT") return { kind: "FORBIDDEN" as const };
    if (conversation.assignedAgentId === targetAgentId) return { kind: "INVALID_TARGET" as const };

    const target = await conversationsRepository.findAgentById(targetAgentId);
    if (!target || !target.isActive) return { kind: "INVALID_TARGET" as const };
    if (user.role === "SUPERVISOR" && (!user.departmentId || target.departmentId !== user.departmentId)) {
      return { kind: "FORBIDDEN" as const };
    }
    const result = await conversationsRepository.delegate(id, targetAgentId, user.id, reason?.trim() || null);
    if (result.kind !== "OK") return result;

    conversationEvents.emit("conversation_updated", {
      conversationId: id,
      status: "IN_PROGRESS",
      eventType: "DELEGATED",
      assignedAgentId: targetAgentId,
      departmentId: conversation.departmentId,
      fromAgentId: conversation.assignedAgentId,
      actorAgentId: user.id,
      actorName: user.name,
      reason: reason?.trim() || null,
      assignmentId: result.assignment.id,
    });
    socketEmitter.emitToConversation(id, "conversation:delegated", {
      conversationId: id,
      assignedAgentId: targetAgentId,
      assignedAgentName: target.name,
      actorName: user.name,
    });
    const updated = await this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
    return { kind: "OK" as const, conversation: updated, assignment: result.assignment };
  }

  async respondToDelegation(id: string, assignmentId: string, decision: "ACCEPT" | "DECLINE", user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !user || !this.canAccess(conversation, user)) return { kind: "NOT_FOUND" as const };

    const result = await conversationsRepository.respondToDelegation(id, assignmentId, user.id, decision);
    if (result.kind !== "OK") return result;

    const eventType = result.accepted ? "DELEGATION_ACCEPTED" : "DELEGATION_DECLINED";
    conversationEvents.emit("conversation_updated", {
      conversationId: id,
      status: result.conversation.status,
      eventType,
      assignedAgentId: result.conversation.assignedAgentId,
      departmentId: result.conversation.departmentId,
      assignmentId: result.assignment.id,
      response: result.accepted ? "ACCEPTED" : "DECLINED",
      actorAgentId: user.id,
      actorName: user.name,
    });
    if (result.message) {
      const formattedMessage = this.formatMessage({ ...result.message, senderAgent: null, senderContact: null }, conversation);
      socketEmitter.emitToConversation(id, "message:new", { conversationId: id, message: formattedMessage });
    }
    await notificationsService.notifyDelegationResponse({
      assignmentId: result.assignment.id,
      conversationId: id,
      delegatorAgentId: result.assignment.actorAgent.id,
      responderName: result.assignment.toAgent.name,
      decision: result.accepted ? "ACCEPTED" : "DECLINED",
    });
    const updated = await this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
    return { kind: "OK" as const, conversation: updated, assignment: result.assignment, response: result.accepted ? "ACCEPTED" as const : "DECLINED" as const };
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
    if (!conversation || conversation.status === "CLOSED" || !this.canAccess(conversation, user) || !user) return null;

    const agent = await conversationsRepository.findAgentById(user.id);
    if (!agent || !agent.isActive) return null;

    const agentName = agent?.name ?? "Atendente";
    const deptName = agent?.department?.name || conversation.department?.name || "Suporte T.I.";
    const cleanContent = rawContent.trim();

    const unsignedContent = cleanContent.replace(/^\*[^*\n]{1,200}:\*\s*/u, "").trim();
    if (!unsignedContent) return null;
    const content = `*${agentName} - ${deptName}:*\n\n${unsignedContent}`;

    const message = await conversationsRepository.addMessage({
      conversationId: id,
      direction: "OUT",
      senderType: "AGENT",
      senderAgentId: agent?.id ?? null,
      senderNameSnapshot: agent.name,
      senderDepartmentSnapshot: agent.department?.name ?? null,
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
      senderDepartmentName: agent.department?.name ?? null,
      senderContactId: null,
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
