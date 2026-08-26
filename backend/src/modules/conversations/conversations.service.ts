import { conversationsRepository } from "./conversations.repository.js";
import { zApiService } from "../zapi/zapi.service.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { mediaService } from "../media/media.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { contactsRepository } from "../contacts/contacts.repository.js";
import { validateOutgoingMedia, type OutgoingMediaKind } from "./outgoing-media.js";

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

function createSearchSnippet(content: string, query: string, maxLength = 160): string {
  const text = content.trim();
  if (!text) return "";
  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (index < 0) return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
  const half = Math.max(20, Math.floor((maxLength - query.length) / 2));
  const start = Math.max(0, index - half);
  const end = Math.min(text.length, index + query.length + half);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

type SearchMatchSource = "name" | "email" | "phone" | "group" | "message";

export class ConversationsService {
  private readonly outboundMediaInFlight = new Map<string, number>();
  private readonly outboundMediaWindow = new Map<string, number[]>();

  /**
   * Group conversations created before the unified queue was introduced may
   * not have the GROUP channel persisted yet.  The group relation/name/JID is
   * still authoritative in those rows, so all conversation actions must use
   * this single discriminator instead of checking only `channel`.
   */
  private isGroupConversation(conversation: any): boolean {
    return conversation?.channel === "GROUP"
      || Boolean(conversation?.groupChatId || conversation?.groupChatName)
      || (typeof conversation?.remoteChatId === "string" && /@g\.us$/i.test(conversation.remoteChatId));
  }

  private isGroupMonitor(conversation: any): boolean {
    return this.isGroupConversation(conversation)
      && conversation?.status === "DRAFT"
      && conversation?.currentStep === "GROUP_MONITOR";
  }

  /**
   * Older group tickets may only retain the GroupChat relation while newer
   * records also denormalize the JID on the conversation. Keep delivery and
   * read acknowledgements on the group target in either shape; never fall
   * back to the participant contact number for a group conversation.
   */
  private groupRemoteChatId(conversation: any): string | null {
    const value = conversation?.remoteChatId ?? conversation?.groupChat?.remoteChatId;
    return typeof value === "string" && value.trim() ? value.trim() : null;
  }

  private acquireOutboundMediaSlot(agentId: string): boolean {
    const now = Date.now();
    const maxConcurrent = Math.max(1, Number(process.env.OUTBOUND_MEDIA_MAX_CONCURRENT_PER_AGENT ?? 1));
    const maxPerMinute = Math.max(1, Number(process.env.OUTBOUND_MEDIA_RATE_LIMIT_PER_AGENT ?? 20));
    const inFlight = this.outboundMediaInFlight.get(agentId) ?? 0;
    const recent = (this.outboundMediaWindow.get(agentId) ?? []).filter((timestamp) => now - timestamp < 60_000);
    if (inFlight >= maxConcurrent || recent.length >= maxPerMinute) {
      this.outboundMediaWindow.set(agentId, recent);
      return false;
    }
    this.outboundMediaInFlight.set(agentId, inFlight + 1);
    recent.push(now);
    this.outboundMediaWindow.set(agentId, recent);
    return true;
  }

  private releaseOutboundMediaSlot(agentId: string) {
    const inFlight = this.outboundMediaInFlight.get(agentId) ?? 0;
    if (inFlight <= 1) this.outboundMediaInFlight.delete(agentId);
    else this.outboundMediaInFlight.set(agentId, inFlight - 1);
  }

  private canAccess(conversation: any, user?: AuthenticatedRequest["user"]): boolean {
    if (!user || user.role === "ADMIN" || user.role === "SUPERVISOR") return true;
    if (user.role !== "AGENT") return true;
    const isGroup = this.isGroupConversation(conversation);
    // A group monitor is a shared, unassigned conversation that keeps the
    // group visible before a mention opens a ticket. Agents may view and
    // answer it just like any other queue conversation.
    if (isGroup && this.isGroupMonitor(conversation)) return true;
    // Group tickets without an assigned attendant are shared queue work. They
    // must remain open to every agent so anyone can open the same chat and
    // assume it, regardless of the synthetic monitor contact's department.
    if (isGroup && !conversation.assignedAgentId && conversation.status !== "CLOSED") return true;
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
      messageType: message.messageType ?? "TEXT",
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      media: message.media ? mediaService.toPublic(message.media) : null,
      outgoingMedia: message.outgoingMedia
        ? {
            id: message.outgoingMedia.id,
            type: message.outgoingMedia.type,
            mimeType: message.outgoingMedia.mimeType,
            fileName: message.outgoingMedia.fileName,
            caption: message.outgoingMedia.caption,
            sizeBytes: message.outgoingMedia.sizeBytes,
            status: message.outgoingMedia.status,
            providerMessageId: message.outgoingMedia.providerMessageId,
            failureCode: message.outgoingMedia.failureCode,
            createdAt: message.outgoingMedia.createdAt.toISOString(),
          }
        : null,
      contactShare: message.contactShare
        ? {
            id: message.contactShare.id,
            displayName: message.contactShare.displayName,
            phones: Array.isArray(message.contactShare.phones) ? message.contactShare.phones : [],
            primaryPhone: message.contactShare.primaryPhone ?? null,
            email: message.contactShare.email ?? null,
            organization: message.contactShare.organization ?? null,
            note: message.contactShare.note ?? null,
            canonicalContactId: message.contactShare.canonicalContactId ?? null,
          }
        : null,
    };
  }

  private formatSummary(summary: any, query = "") {
    const latest = summary.messages?.[0];
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const contactName = summary.contact?.name ?? "Contato sem nome";
    const contactEmail = summary.contact?.email ?? "";
    const contactPhone = summary.contact?.phone ?? "";
    const groupName = summary.groupChatName ?? "";
    const digits = query.replace(/\D/g, "");
    const alternatePhones = (summary.contact?.phoneNumbers ?? []).map((item: { phone: string }) => item.phone);
    const matchedMessages = (summary.__searchMatches ?? (summary.__searchMatch ? [summary.__searchMatch] : [])) as Array<{ id: string; content: string; createdAt: Date; senderNameSnapshot: string | null }>;
    const matchedMessage = matchedMessages[0];
    let searchMatch: { source: SearchMatchSource; messageId: string | null; snippet: string; createdAt: string; senderDisplayName: string | null } | null = null;
    let searchConversationMatch: { source: Exclude<SearchMatchSource, "message">; messageId: null; snippet: string; createdAt: string; senderDisplayName: null } | null = null;

    if (normalizedQuery) {
      const normalizedName = contactName.toLocaleLowerCase();
      const normalizedEmail = contactEmail.toLocaleLowerCase();
      const normalizedGroup = groupName.toLocaleLowerCase();
      const phoneMatches = [contactPhone, ...alternatePhones].some((phone) => digits.length > 0 && phone.includes(digits));
      const conversationSource = normalizedEmail.includes(normalizedQuery)
        ? { source: "email" as const, value: contactEmail }
        : phoneMatches
        ? { source: "phone" as const, value: contactPhone || alternatePhones[0] || "" }
        : normalizedName.includes(normalizedQuery)
        ? { source: "name" as const, value: contactName }
        : normalizedGroup.includes(normalizedQuery)
        ? { source: "group" as const, value: groupName }
        : null;
      if (conversationSource) {
        searchConversationMatch = {
          source: conversationSource.source,
          messageId: null,
          snippet: createSearchSnippet(conversationSource.value, query),
          createdAt: (latest?.createdAt ?? summary.lastActivityAt).toISOString(),
          senderDisplayName: null,
        };
      }
      if (matchedMessage) {
        const source: SearchMatchSource = "message";
        const createdAt = matchedMessage?.createdAt ?? latest?.createdAt ?? summary.lastActivityAt;
        searchMatch = {
          source,
          messageId: matchedMessage?.id ?? null,
          snippet: createSearchSnippet(matchedMessage.content, query),
          createdAt: createdAt.toISOString(),
          senderDisplayName: matchedMessage?.senderNameSnapshot ?? null,
        };
      }
    }

    const isGroup = this.isGroupConversation(summary);
    const isGroupMonitor = this.isGroupMonitor(summary);
    return {
      id: summary.id,
      contact: {
        id: summary.contact?.id,
        name: contactName,
        phone: contactPhone,
        email: contactEmail || null,
        isRegistered: summary.contact?.isRegistered ?? false,
        initials: getInitials(contactName),
      },
      status: isGroupMonitor ? "OPEN" : summary.status,
      isGroupMonitor,
      channel: isGroup ? "GROUP" : (summary.channel ?? "PRIVATE"),
      departmentId: summary.departmentId,
      departmentName: summary.department?.name ?? null,
      assignedAgentId: summary.assignedAgentId,
      assignedAgentName: summary.assignedAgent?.name ?? null,
      labels: (summary.labels || []).map((item: any) => item.label),
      groupChatName: summary.groupChatName ?? null,
      groupChatId: summary.groupChatId ?? null,
      unreadCount: summary._count?.messages ?? 0,
      lastMessage: latest?.content ?? "Nenhuma mensagem ainda",
      searchMatch,
      searchConversationMatch,
      searchMatches: matchedMessages.map((match) => ({
        source: "message" as const,
        messageId: match.id,
        snippet: createSearchSnippet(match.content, query),
        createdAt: match.createdAt.toISOString(),
        senderDisplayName: match.senderNameSnapshot ?? null,
      })),
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

    const isGroup = this.isGroupConversation(conversation);
    const isGroupMonitor = this.isGroupMonitor(conversation);
    return {
      id: conversation.id,
      contact: {
        id: conversation.contact?.id,
        name: conversation.contact?.name ?? "Contato sem nome",
        phone: conversation.contact?.phone ?? "",
        isRegistered: conversation.contact?.isRegistered ?? false,
        initials: getInitials(conversation.contact?.name ?? "CS"),
      },
      status: isGroupMonitor ? "OPEN" : conversation.status,
      isGroupMonitor,
      channel: isGroup ? "GROUP" : (conversation.channel ?? "PRIVATE"),
      departmentId: conversation.departmentId,
      departmentName: conversation.department?.name ?? null,
      assignedAgentId: conversation.assignedAgentId,
      assignedAgentName: conversation.assignedAgent?.name ?? null,
      labels: (conversation.labels || []).map((item: any) => item.label),
      groupChatName: conversation.groupChatName ?? null,
      groupChatId: conversation.groupChatId ?? null,
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
    channel?: "ALL" | "PRIVATE" | "GROUP";
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
      // Metric cards are a stable operational summary, independent of the
      // currently selected channel.  In particular, selecting "Grupos"
      // must not make the private conversation counters appear as zero.
      // The channel is still applied to `findMany` above for the list itself.
      channel: undefined,
      dateField: filters.dateField,
      from: filters.from,
      to: filters.to,
    });
    const items = result.isSummary
      ? result.items.map((item) => this.formatSummary(item, filters.q ?? ""))
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
        channel: filters.channel ?? "ALL",
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

  async search(filters: {
    q: string;
    scope: "all" | "unread" | "mine" | "groups";
    status: string;
    departmentId?: string;
    assignedAgentId?: string;
    labelIds?: string[];
    dateField: "lastActivityAt" | "createdAt";
    from?: string;
    to?: string;
    sort: "relevance" | "recent" | "oldest";
    page: number;
    limit: number;
  }) {
    const result = await conversationsRepository.search(filters);
    const query = filters.q.trim();
    const digits = query.replace(/\D/g, "");
    const items = result.rows.map((row: any) => {
      const matched = result.matches.get(row.id);
      const contactName = row.contact?.name ?? "Contato sem nome";
      const phone = row.contact?.phone ?? "";
      const normalizedName = contactName.toLocaleLowerCase();
      const normalizedQuery = query.toLocaleLowerCase();
      const source = matched
        ? "message"
        : digits.length >= 3 && phone.includes(digits)
        ? "phone"
        : normalizedName.includes(normalizedQuery)
        ? "contact"
        : "message";
      const latest = row.messages?.[0];
      const content = matched?.content ?? latest?.content ?? "";
      return {
        conversationId: row.id,
        contact: {
          id: row.contact?.id ?? null,
          displayName: contactName,
          phone,
        },
        status: row.status,
        department: row.department ? { id: row.department.id, name: row.department.name } : null,
        assignedAgent: row.assignedAgent ? { id: row.assignedAgent.id, name: row.assignedAgent.name } : null,
        isGroup: Boolean(row.groupChatName),
        groupChatName: row.groupChatName ?? null,
        unreadCount: row._count?.messages ?? 0,
        lastActivityAt: row.lastActivityAt.toISOString(),
        match: {
          source,
          messageId: matched?.id ?? null,
          snippet: createSearchSnippet(content, query),
          createdAt: (matched?.createdAt ?? latest?.createdAt ?? row.lastActivityAt).toISOString(),
          senderDisplayName: matched?.senderNameSnapshot ?? latest?.senderNameSnapshot ?? null,
        },
      };
    });
    return {
      items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
      },
      appliedFilters: {
        q: query,
        scope: filters.scope,
        status: filters.status,
        departmentId: filters.departmentId ?? "ALL",
        dateField: filters.dateField,
        from: filters.from ?? null,
        to: filters.to ?? null,
        sort: filters.sort,
      },
    };
  }

  async createManual(data: { contactId?: string; phone: string; departmentId?: string }, user?: AuthenticatedRequest["user"]) {
    let contact = data.contactId ? await contactsRepository.findById(data.contactId) : await contactsRepository.findByPhone(data.phone);
    if (!contact && !data.contactId) {
      try {
        contact = await contactsRepository.create({
          name: "Contato WhatsApp",
          phones: [{ phone: data.phone, label: "WhatsApp", isPrimary: true }],
          isRegistered: false,
        });
      } catch (error: any) {
        // A unicidade do telefone resolve a corrida entre dois atendentes.
        if (error?.code === "P2002") contact = await contactsRepository.findByPhone(data.phone);
        else throw error;
      }
    }
    if (!contact || (!contact.phoneNumbers.some((item) => item.phone === data.phone) && contact.phone !== data.phone)) return { kind: "NOT_FOUND" as const };
    if (user?.role === "AGENT" && data.departmentId && data.departmentId !== user.departmentId) return { kind: "FORBIDDEN" as const };
    const existing = await contactsRepository.findActiveConversation(contact.id, data.phone);
    if (existing) return { kind: "CONFLICT" as const, conversationId: existing.id };
    try {
      const conversation = await conversationsRepository.createManualConversation(contact.id, data.departmentId);
      const formatted = await this.formatConversationRecord(await conversationsRepository.findById(conversation.id, { messageLimit: DEFAULT_MESSAGE_LIMIT }));
      // Do not emit a queue/notification event for a draft. The conversation
      // is promoted when the first outbound message is actually delivered.
      return { kind: "OK" as const, conversation: formatted };
    } catch (error: any) {
      if (error?.code === "P2002") return { kind: "CONFLICT" as const, conversationId: undefined };
      throw error;
    }
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
    const isGroup = this.isGroupConversation(conversation);
    const isGroupMonitor = this.isGroupMonitor(conversation);
    return {
      id: conversation.id,
      contact: {
        id: conversation.contact?.id,
        name: conversation.contact?.name ?? "Contato sem nome",
        phone: conversation.contact?.phone ?? "",
        isRegistered: conversation.contact?.isRegistered ?? false,
        initials: getInitials(conversation.contact?.name ?? "CS"),
      },
      status: isGroupMonitor ? "OPEN" : conversation.status,
      isGroupMonitor,
      channel: isGroup ? "GROUP" : (conversation.channel ?? "PRIVATE"),
      departmentId: conversation.departmentId,
      departmentName: conversation.department?.name ?? null,
      assignedAgentId: conversation.assignedAgentId,
      assignedAgentName: conversation.assignedAgent?.name ?? null,
      labels: (conversation.labels || []).map((item: any) => item.label),
      groupChatName: conversation.groupChatName ?? null,
      groupChatId: conversation.groupChatId ?? null,
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
    const groupRemoteChatId = this.groupRemoteChatId(conversation);
    if (this.isGroupConversation(conversation) && groupRemoteChatId) {
      const group = await zApiService.findGroupChatByRemoteChatId(groupRemoteChatId);
      if (group) await zApiService.markGroupRead(group.id);
    }
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

  async close(id: string, user?: AuthenticatedRequest["user"], reason: "NORMAL" | "INACTIVITY" | "SILENT" = "NORMAL") {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user)) return null;

    const closeReason = reason === "INACTIVITY" ? "AUTO_TIMEOUT" : reason === "SILENT" ? "SILENT" : "MANUAL";
    await conversationsRepository.close(id, closeReason);

    conversationEvents.emit("conversation_updated", { conversationId: id, status: "CLOSED", eventType: "CLOSED", closeReason });

    return this.formatConversation(id, { messageLimit: DEFAULT_MESSAGE_LIMIT });
  }

  async sendMessage(id: string, rawContent: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user) || !user) return { kind: "NOT_FOUND" as const };

    const agent = await conversationsRepository.findAgentById(user.id);
    if (!agent || !agent.isActive) return { kind: "AGENT_UNAVAILABLE" as const };

    const agentName = agent?.name ?? "Atendente";
    const deptName = agent?.department?.name || conversation.department?.name || "Suporte T.I.";
    const cleanContent = rawContent.trim();

    const unsignedContent = cleanContent.replace(/^\*[^*\n]{1,200}:\*\s*/u, "").trim();
    if (!unsignedContent) return { kind: "EMPTY" as const };
    const content = `*${agentName} - ${deptName}:*\n\n${unsignedContent}`;
    const isGroup = this.isGroupConversation(conversation);
    const isGroupMonitor = this.isGroupMonitor(conversation);
    const wasDraft = conversation.status === "DRAFT" && !isGroupMonitor;

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
    const deliveryTarget = isGroup && this.groupRemoteChatId(conversation)
      ? this.groupRemoteChatId(conversation)
      : conversation.contact?.phone;
    const delivery = deliveryTarget ? await zApiService.sendText(deliveryTarget, content) : null;
    if (!delivery || (typeof delivery === "object" && "error" in delivery && delivery.error)) {
      // Keep the local message for auditability, but report the provider
      // failure instead of presenting an unsent group message as delivered.
      return {
        kind: "PROVIDER_ERROR" as const,
        error: delivery && typeof delivery === "object" && "error" in delivery
          ? String(delivery.error)
          : "Não foi possível entregar a mensagem pela integração Z-API.",
      };
    }

    if (wasDraft) {
      const activated = await conversationsRepository.activateDraft(id);
      if (activated) {
        const current = await conversationsRepository.findAccessById(id);
        conversationEvents.emit("conversation_updated", {
          conversationId: id,
          status: "OPEN",
          eventType: "NEW_QUEUE",
          departmentId: current?.departmentId ?? conversation.departmentId,
          assignedAgentId: current?.assignedAgentId ?? conversation.assignedAgentId,
          queuedAt: new Date(),
        });
      }
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

    return { kind: "OK" as const, message: formattedMsg };
  }

  async sendMedia(id: string, input: {
    file: { fileName: string; mimeType: string; buffer: Buffer } | null;
    caption: string;
    clientMessageId: string;
  }, user?: AuthenticatedRequest["user"]) {
    // O envio fica ativo por padrão quando a API está configurada. Defina
    // OUTBOUND_MEDIA_ENABLED=false para desabilitar o recurso durante um rollback.
    if (process.env.OUTBOUND_MEDIA_ENABLED?.toLowerCase() === "false") return { kind: "DISABLED" as const };
    const conversation = await conversationsRepository.findAccessById(id);
    if (!conversation || !this.canAccess(conversation, user) || !user) return { kind: "NOT_FOUND" as const };

    const agent = await conversationsRepository.findAgentById(user.id);
    if (!agent || !agent.isActive) return { kind: "AGENT_UNAVAILABLE" as const };

    let metadata: ReturnType<typeof validateOutgoingMedia>;
    try {
      metadata = validateOutgoingMedia(input.file as any, input.caption.trim(), input.clientMessageId);
    } catch (error: any) {
      return { kind: "INVALID" as const, code: error?.code || "INVALID_FILE" };
    }

    const existing = await conversationsRepository.findOutgoingMediaByClientMessageId(input.clientMessageId);
    if (existing) {
      if (existing.status === "SENT") {
        const formatted = this.formatMessage({ ...existing.message, outgoingMedia: existing, media: null, contactShare: null, senderAgent: agent, senderContact: null }, conversation);
        return { kind: "OK" as const, message: formatted, duplicate: true };
      }
      return { kind: "DUPLICATE" as const };
    }
    if (!this.acquireOutboundMediaSlot(agent.id)) return { kind: "RATE_LIMIT" as const };

    const agentName = agent.name || "Atendente";
    const departmentName = agent.department?.name || conversation.department?.name || "Suporte T.I.";
    const caption = input.caption.trim();
    const signedCaption = caption ? `*${agentName} - ${departmentName}:*\n\n${caption}` : "";
    const contentLabel: Record<OutgoingMediaKind, string> = {
      IMAGE: "[Imagem enviada]",
      VIDEO: "[Vídeo enviado]",
      AUDIO: "[Áudio enviado]",
      DOCUMENT: `[Documento enviado${metadata.fileName ? `: ${metadata.fileName}` : ""}]`,
    };
    const content = signedCaption || contentLabel[metadata.type];

    let pending;
    try {
      pending = await conversationsRepository.createOutgoingMediaPending({
        conversationId: id,
        senderAgentId: agent.id,
        senderNameSnapshot: agentName,
        senderDepartmentSnapshot: agent.department?.name ?? null,
        type: metadata.type,
        mimeType: metadata.mimeType,
        fileName: metadata.fileName,
        caption: caption || null,
        sizeBytes: metadata.sizeBytes,
        clientMessageId: input.clientMessageId,
        content,
      });
    } catch (error) {
      this.releaseOutboundMediaSlot(agent.id);
      throw error;
    }
    await conversationsRepository.updateOutgoingMedia(pending.outgoingMedia.id, { status: "SENDING" });

    const isGroup = this.isGroupConversation(conversation);
    const sendInput = {
      phone: isGroup ? (this.groupRemoteChatId(conversation) || "") : (conversation.contact?.phone || ""),
      mimeType: metadata.mimeType,
      buffer: input.file!.buffer,
      fileName: metadata.fileName,
      caption: signedCaption || null,
      clientMessageId: input.clientMessageId,
    };
    let delivery;
    try {
      delivery = metadata.type === "IMAGE"
        ? await zApiService.sendImage(sendInput)
        : metadata.type === "VIDEO"
        ? await zApiService.sendVideo(sendInput)
        : metadata.type === "AUDIO"
        ? await zApiService.sendAudio(sendInput)
        : await zApiService.sendDocument(sendInput);
    } finally {
      this.releaseOutboundMediaSlot(agent.id);
    }

    if ("error" in delivery) {
      await conversationsRepository.updateOutgoingMedia(pending.outgoingMedia.id, { status: "FAILED", failureCode: delivery.error.slice(0, 160) });
      return { kind: "PROVIDER_ERROR" as const, error: delivery.error };
    }

    const providerMessageId = delivery.providerMessageId || null;
    const storedMedia = await conversationsRepository.updateOutgoingMedia(pending.outgoingMedia.id, { status: "SENT", providerMessageId });
    if (providerMessageId) {
      await conversationsRepository.updateMessageExternalId(pending.message.id, providerMessageId).catch(() => undefined);
    }

    const isGroupMonitor = this.isGroupMonitor(conversation);
    const wasDraft = conversation.status === "DRAFT" && !isGroupMonitor;
    if (wasDraft) {
      const activated = await conversationsRepository.activateDraft(id);
      if (activated) {
        const current = await conversationsRepository.findAccessById(id);
        conversationEvents.emit("conversation_updated", {
          conversationId: id,
          status: "OPEN",
          eventType: "NEW_QUEUE",
          departmentId: current?.departmentId ?? conversation.departmentId,
          assignedAgentId: current?.assignedAgentId ?? conversation.assignedAgentId,
          queuedAt: new Date(),
        });
      }
    }

    const formattedMsg = this.formatMessage({
      ...pending.message,
      externalMessageId: providerMessageId,
      outgoingMedia: storedMedia,
      media: null,
      contactShare: null,
      senderAgent: agent,
      senderContact: null,
    }, conversation);
    socketEmitter.emitToConversation(id, "message:new", { conversationId: id, message: formattedMsg });
    conversationEvents.emit("conversation_updated", { conversationId: id, eventType: "MESSAGE_SENT", messageId: pending.message.id });
    return { kind: "OK" as const, message: formattedMsg };
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
