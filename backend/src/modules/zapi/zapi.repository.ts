import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";

/**
 * Z-API alternates between a bare group id and the WhatsApp JID suffix.
 * Keep lookups tolerant of both representations without requiring a data
 * migration or rewriting historical rows.
 */
function groupRemoteChatIdVariants(remoteChatId: string): string[] {
  const raw = String(remoteChatId ?? "").trim();
  const bare = raw.replace(/@g\.us$/i, "");
  return [...new Set([raw, bare].filter(Boolean))];
}

export class ZApiRepository {
  private async mirrorUnlinkedGroupMessages(groupChatId: string, conversationId: string) {
    const pending = await prisma.groupMessage.findMany({
      where: { groupChatId, conversationId: null },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        externalMessageId: true,
        direction: true,
        senderType: true,
        senderContactId: true,
        senderNameSnapshot: true,
        messageType: true,
        content: true,
        createdAt: true,
      },
    });
    if (pending.length) {
      for (const groupMessage of pending) {
        let message;
        try {
          message = await prisma.message.create({
            data: {
              conversationId,
              externalMessageId: groupMessage.externalMessageId,
              direction: groupMessage.direction,
              senderType: groupMessage.senderType,
              senderContactId: groupMessage.senderContactId,
              senderNameSnapshot: groupMessage.senderNameSnapshot,
              messageType: groupMessage.messageType,
              content: groupMessage.content,
              createdAt: groupMessage.createdAt,
            },
          });
        } catch (error: any) {
          // A webhook may have created the normal message before the group
          // audit row was linked. Reuse that message instead of duplicating it.
          if (error?.code !== "P2002" || !groupMessage.externalMessageId) throw error;
          message = await prisma.message.findUnique({ where: { externalMessageId: groupMessage.externalMessageId } });
        }
        if (!message) continue;
        await prisma.groupMessage.updateMany({
          where: { id: groupMessage.id, conversationId: null },
          data: { conversationId },
        });
      }

      const latest = pending.at(-1)?.createdAt;
      if (latest) {
        await prisma.conversation.updateMany({
          where: { id: conversationId, lastActivityAt: { lt: latest } },
          data: { lastActivityAt: latest },
        });
      }
    }

    // Messages created by the legacy group composer lived in
    // GroupOutboundMessage and were not visible to the normal conversation
    // reader. Copy their audit metadata into the canonical Message stream as
    // well, keeping the old rows intact for backwards compatibility.
    const outbound = await prisma.groupOutboundMessage.findMany({
      where: { groupChatId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        providerMessageId: true,
        agentId: true,
        content: true,
        messageType: true,
        createdAt: true,
        agent: { select: { name: true, department: { select: { name: true } } } },
      },
    });
    if (!outbound.length) return;

    for (const groupMessage of outbound) {
      let existing = groupMessage.providerMessageId
        ? await prisma.message.findUnique({ where: { externalMessageId: groupMessage.providerMessageId } })
        : null;
      if (!existing) {
        existing = await prisma.message.findFirst({
          where: {
            conversationId,
            direction: "OUT",
            senderAgentId: groupMessage.agentId,
            content: groupMessage.content,
            createdAt: groupMessage.createdAt,
          },
        });
      }
      if (existing) continue;

      try {
        await prisma.message.create({
          data: {
            conversationId,
            ...(groupMessage.providerMessageId ? { externalMessageId: groupMessage.providerMessageId } : {}),
            direction: "OUT",
            senderType: "AGENT",
            senderAgentId: groupMessage.agentId,
            senderNameSnapshot: groupMessage.agent.name,
            senderDepartmentSnapshot: groupMessage.agent.department?.name ?? null,
            messageType: groupMessage.messageType,
            content: groupMessage.content,
            createdAt: groupMessage.createdAt,
          },
        });
      } catch (error: any) {
        if (error?.code !== "P2002") throw error;
      }
    }
  }

  async claimExternalEvent(conversationId: string, externalEventId: string) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { flowRevisionId: true } });
    const revisionId = conversation?.flowRevisionId ?? (await prisma.flowRevision.findFirst({ where: { status: "PUBLISHED" }, select: { id: true }, orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }] }))?.id;
    if (!revisionId) return true;
    try {
      await prisma.flowExecutionEvent.create({ data: { conversationId, flowRevisionId: revisionId, externalEventId, type: "RECEIVED" } });
      return true;
    } catch (error: any) {
      if (error?.code === "P2002") return false;
      throw error;
    }
  }
  async getConfig() {
    return prisma.zApiConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  }

  async upsertConfig(data: {
    instanceId: string;
    token?: string;
    clientToken?: string;
    webhookUrl?: string;
    isActive?: boolean;
    autoReply?: boolean;
    groupsEnabled?: boolean;
    groupCooldownSeconds?: number;
    groupConfirmInGroup?: boolean;
    groupConfirmMessage?: string | null;
    groupConversationMode?: string;
    groupResponseMode?: string;
  }) {
    const existing = await this.getConfig();
    if (existing) {
      return prisma.zApiConfig.update({
        where: { id: existing.id },
        data: {
          instanceId: data.instanceId,
          token: data.token || existing.token,
          clientToken: data.clientToken ?? existing.clientToken,
          webhookUrl: data.webhookUrl ?? existing.webhookUrl,
          isActive: data.isActive ?? existing.isActive,
          autoReply: data.autoReply ?? existing.autoReply,
          groupsEnabled: data.groupsEnabled ?? existing.groupsEnabled,
          groupCooldownSeconds: data.groupCooldownSeconds ?? existing.groupCooldownSeconds,
          groupConfirmInGroup: data.groupConfirmInGroup ?? existing.groupConfirmInGroup,
          groupConfirmMessage: data.groupConfirmMessage !== undefined ? data.groupConfirmMessage : existing.groupConfirmMessage,
          groupConversationMode: data.groupConversationMode ?? existing.groupConversationMode,
          groupResponseMode: data.groupResponseMode ?? existing.groupResponseMode,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.zApiConfig.create({
      data: {
        instanceId: data.instanceId,
        token: data.token ?? "",
        clientToken: data.clientToken ?? "",
        webhookUrl: data.webhookUrl ?? "http://localhost:3001/api/webhooks/z-api",
        isActive: data.isActive ?? true,
        autoReply: data.autoReply ?? true,
        groupsEnabled: data.groupsEnabled ?? false,
        groupCooldownSeconds: data.groupCooldownSeconds ?? 60,
        groupConfirmInGroup: data.groupConfirmInGroup ?? false,
        groupConfirmMessage: data.groupConfirmMessage ?? null,
        groupConversationMode: data.groupConversationMode ?? "PRIVATE_LEGACY",
        groupResponseMode: data.groupResponseMode ?? "ANY_PARTICIPANT",
      },
    });
  }

  async findContactByPhone(phone: string) {
    return prisma.contact.findFirst({
      where: {
        OR: [
          { phone },
          { phoneNumbers: { some: { phone } } },
        ],
      },
    });
  }

  async createContact(phone: string, name: string) {
    return prisma.contact.create({
      data: { phone, name, isRegistered: false },
    });
  }

  async findActiveConversationByContact(contactId: string) {
    return prisma.conversation.findFirst({
      where: {
        contactId,
        status: { notIn: ["CLOSED", "DRAFT"] },
      },
      include: {
        contact: true,
        department: true,
        assignedAgent: true,
      },
      orderBy: { startedAt: "desc" },
    });
  }

  async findActiveConversationByGroup(remoteChatId: string) {
    const remoteChatIds = groupRemoteChatIdVariants(remoteChatId);
    const groupLookup = {
      OR: [
        { remoteChatId: { in: remoteChatIds } },
        { groupChat: { remoteChatId: { in: remoteChatIds } } },
      ],
    };
    // Prefer a real ticket, but keep the persistent group monitor (DRAFT)
    // available so messages received before a mention are also mirrored into
    // the unified conversation view without triggering the bot.
    const active = await prisma.conversation.findFirst({
      // Group JIDs are unique in remoteChatId. Older rows may predate the
      // GROUP channel value, so the JID is the compatibility key here.
      where: { ...groupLookup, status: { notIn: ["CLOSED", "DRAFT"] } },
      include: { contact: true, department: true, assignedAgent: true, groupChat: true },
      orderBy: { startedAt: "desc" },
    });
    if (active) return active;
    return prisma.conversation.findFirst({
      where: { ...groupLookup, status: "DRAFT", currentStep: "GROUP_MONITOR" },
      include: { contact: true, department: true, assignedAgent: true, groupChat: true },
      orderBy: { startedAt: "desc" },
    });
  }

  async ensureGroupMonitorConversation(groupChat: { id: string; remoteChatId: string; name: string }) {
    const remoteChatIds = groupRemoteChatIdVariants(groupChat.remoteChatId);
    // A group has one canonical conversation in the unified queue. If a
    // mention already promoted the monitor to a real ticket, reuse that
    // ticket instead of creating a second monitor row for the same group.
    const activeTicket = await prisma.conversation.findFirst({
      where: {
        status: { notIn: ["CLOSED", "DRAFT"] },
        OR: [
          { groupChatId: groupChat.id },
          { remoteChatId: { in: remoteChatIds } },
        ],
      },
      include: { contact: true, department: true, assignedAgent: true, groupChat: true },
      orderBy: { startedAt: "desc" },
    });
    if (activeTicket) {
      await this.mirrorUnlinkedGroupMessages(groupChat.id, activeTicket.id);
      return activeTicket;
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        status: "DRAFT",
        currentStep: "GROUP_MONITOR",
        OR: [{ groupChatId: groupChat.id }, { remoteChatId: { in: remoteChatIds } }],
      },
      include: { contact: true, department: true, assignedAgent: true, groupChat: true },
      orderBy: { startedAt: "desc" },
    });
    if (existing) {
      await this.mirrorUnlinkedGroupMessages(groupChat.id, existing.id);
      return existing;
    }

    const latest = await prisma.groupMessage.findFirst({
      where: { groupChatId: groupChat.id, senderContactId: { not: null } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { senderContactId: true },
    });
    let contactId = latest?.senderContactId ?? null;
    if (!contactId) {
      const syntheticPhone = groupChat.remoteChatId;
      const contact = await prisma.contact.findFirst({ where: { phone: syntheticPhone }, select: { id: true } });
      if (contact) {
        contactId = contact.id;
      } else {
        try {
          const created = await prisma.contact.create({
            data: { phone: syntheticPhone, name: groupChat.name, isRegistered: false },
            select: { id: true },
          });
          contactId = created.id;
        } catch (error: any) {
          if (error?.code !== "P2002") throw error;
          contactId = (await prisma.contact.findFirst({ where: { phone: syntheticPhone }, select: { id: true } }))?.id ?? null;
        }
      }
    }
    if (!contactId) return null;

    let monitor;
    try {
      monitor = await prisma.conversation.create({
        data: {
          contactId,
          channel: "GROUP",
          remoteChatId: groupChat.remoteChatId,
          groupChatId: groupChat.id,
          groupChatName: groupChat.name,
          currentStep: "GROUP_MONITOR",
          status: "DRAFT",
          lastActivityAt: new Date(),
        },
        include: { contact: true, department: true, assignedAgent: true, groupChat: true },
      });
    } catch (error: any) {
      // A webhook and a manual group sync can arrive at the same time. If a
      // deployment enforces uniqueness for group monitors, reuse the winner.
      if (error?.code !== "P2002") throw error;
      monitor = await prisma.conversation.findFirst({
        where: {
          status: "DRAFT",
          currentStep: "GROUP_MONITOR",
          OR: [{ groupChatId: groupChat.id }, { remoteChatId: { in: remoteChatIds } }],
        },
        include: { contact: true, department: true, assignedAgent: true, groupChat: true },
        orderBy: { startedAt: "desc" },
      });
      if (!monitor) throw error;
    }
    await this.mirrorUnlinkedGroupMessages(groupChat.id, monitor.id);
    return monitor;
  }

  async findGroupChatByRemoteChatId(remoteChatId: string) {
    return prisma.groupChat.findFirst({ where: { remoteChatId, isActive: true }, select: { id: true } });
  }

  async activateGroupMonitorConversation(id: string, contactId?: string, participant?: string | null) {
    const now = new Date();
    const result = await prisma.conversation.updateMany({
      // Keep old monitor rows activatable even when their channel was stored
      // before the unified GROUP value existed.
      where: { id, status: "DRAFT", currentStep: "GROUP_MONITOR" },
      data: {
        status: "OPEN",
        queuedAt: now,
        lastActivityAt: now,
        currentStep: "AWAITING_TEAM",
        // The monitor may have been created from an earlier participant. On
        // the first mention, make the requester the ticket contact so flow
        // variables and contact summaries never use the group name.
        ...(contactId ? { contactId } : {}),
        ...(participant !== undefined ? { groupParticipant: participant } : {}),
      },
    });
    return result.count > 0;
  }

  async createConversation(contactId: string, status = "OPEN", currentStep = "AWAITING_TEAM", group?: { chatName?: string | null; participant?: string | null; remoteChatId?: string | null; groupChatId?: string | null; channel?: "GROUP" | "PRIVATE" }) {
    const now = new Date();
    return prisma.conversation.create({
      data: {
        contactId,
        status,
        currentStep,
        lastActivityAt: now,
        ...(status === "OPEN" ? { queuedAt: now } : {}),
        ...(group ? { groupChatName: group.chatName ?? null, groupParticipant: group.participant ?? null } : {}),
        ...(group?.channel ? { channel: group.channel } : {}),
        ...(group?.remoteChatId ? { remoteChatId: group.remoteChatId } : {}),
        ...(group?.groupChatId ? { groupChatId: group.groupChatId } : {}),
      },
      include: {
        contact: true,
        department: true,
        assignedAgent: true,
      },
    });
  }

  async updateConversationStatus(
    id: string,
    data: { status: string; departmentId?: string; assignedAgentId?: string; currentStep?: string }
  ) {
    const current = await prisma.conversation.findUnique({ where: { id }, select: { status: true } });
    const now = new Date();
    return prisma.conversation.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.assignedAgentId !== undefined && { assignedAgentId: data.assignedAgentId }),
        ...(data.currentStep !== undefined && { currentStep: data.currentStep }),
        lastActivityAt: now,
        ...(data.status === "OPEN" && current?.status !== "OPEN" ? { queuedAt: now } : {}),
        warningSentAt: null,
      },
    });
  }

  async addMessage(data: {
    conversationId: string;
    direction: string;
    senderType: string;
    senderAgentId?: string | null;
    senderContactId?: string | null;
    senderNameSnapshot?: string | null;
    senderDepartmentSnapshot?: string | null;
    messageType?: string;
    content: string;
  }) {
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        direction: data.direction,
        senderType: data.senderType,
        senderAgentId: data.senderAgentId ?? null,
        senderContactId: data.senderContactId ?? null,
        senderNameSnapshot: data.senderNameSnapshot ?? null,
        senderDepartmentSnapshot: data.senderDepartmentSnapshot ?? null,
        messageType: data.messageType ?? "TEXT",
        content: data.content,
      },
    });
    await prisma.conversation.update({ where: { id: data.conversationId }, data: { lastActivityAt: message.createdAt } });
    return message;
  }

  async upsertGroupChat(remoteChatId: string, name: string, lastMessageAt = new Date()) {
    const safeName = name.trim().slice(0, 300) || "Grupo do WhatsApp";
    const variants = groupRemoteChatIdVariants(remoteChatId);
    const existing = await prisma.groupChat.findFirst({
      where: { remoteChatId: { in: variants } },
    });
    if (existing) {
      return prisma.groupChat.update({
        where: { id: existing.id },
        data: { name: safeName, lastMessageAt, isActive: true },
      });
    }
    try {
      return await prisma.groupChat.create({
        // New rows use the provider's bare id. Existing suffix-based rows
        // continue to work through the tolerant lookup above.
        data: { remoteChatId: variants[1] || variants[0], name: safeName, lastMessageAt },
      });
    } catch (error: any) {
      // A webhook and a synchronization request can race before either sees
      // the row. Re-read the unique winner instead of creating a duplicate.
      if (error?.code !== "P2002") throw error;
      const winner = await prisma.groupChat.findFirst({ where: { remoteChatId: { in: variants } } });
      if (!winner) throw error;
      return prisma.groupChat.update({
        where: { id: winner.id },
        data: { name: safeName, lastMessageAt, isActive: true },
      });
    }
  }

  async addGroupMessage(data: {
    groupChatId: string;
    conversationId?: string | null;
    externalMessageId?: string | null;
    content: string;
    messageType?: string;
    senderContactId?: string | null;
    senderNameSnapshot?: string | null;
    isMention?: boolean;
  }) {
    if (data.externalMessageId) {
      const existing = await prisma.groupMessage.findUnique({ where: { externalMessageId: data.externalMessageId } });
      if (existing) return { duplicate: true, message: existing };
    }
    try {
      const message = await prisma.groupMessage.create({
        data: {
          groupChatId: data.groupChatId,
          conversationId: data.conversationId ?? null,
          externalMessageId: data.externalMessageId ?? null,
          direction: "IN",
          senderType: "CLIENT",
          senderContactId: data.senderContactId ?? null,
          senderNameSnapshot: data.senderNameSnapshot ?? null,
          messageType: data.messageType ?? "TEXT",
          content: data.content,
          isMention: data.isMention ?? false,
        },
      });
      await prisma.groupChat.update({ where: { id: data.groupChatId }, data: { lastMessageAt: message.createdAt, unreadCount: { increment: 1 } } });
      return { duplicate: false, message };
    } catch (error: any) {
      if (error?.code !== "P2002" || !data.externalMessageId) throw error;
      const existing = await prisma.groupMessage.findUnique({ where: { externalMessageId: data.externalMessageId } });
      if (!existing) throw error;
      return { duplicate: true, message: existing };
    }
  }

  async linkGroupMessageToConversation(externalMessageId: string | undefined, conversationId: string) {
    if (!externalMessageId) return;
    await prisma.groupMessage.updateMany({ where: { externalMessageId }, data: { conversationId } });
  }

  async listGroupChats(query?: string) {
    return prisma.groupChat.findMany({
      where: { isActive: true, ...(query?.trim() ? { name: { contains: query.trim(), mode: "insensitive" } } : {}) },
      orderBy: [{ lastMessageAt: "desc" }, { name: "asc" }],
      include: {
        conversations: {
          where: {
            OR: [
              { status: { notIn: ["CLOSED", "DRAFT"] } },
              { status: "DRAFT", currentStep: "GROUP_MONITOR" },
            ],
          },
          select: { id: true, status: true, assignedAgentId: true, currentStep: true },
          orderBy: [{ status: "asc" }, { lastActivityAt: "desc" }],
          take: 1,
        },
      },
    });
  }

  async findGroupChatById(id: string) {
    return prisma.groupChat.findFirst({ where: { id, isActive: true } });
  }

  async listGroupHistory(groupChatId: string) {
    const [incoming, outgoing] = await Promise.all([
      prisma.groupMessage.findMany({
        where: { groupChatId },
        orderBy: { createdAt: "desc" },
        include: { senderContact: { select: { name: true, phone: true } } },
      }),
      prisma.groupOutboundMessage.findMany({ where: { groupChatId }, orderBy: { createdAt: "desc" }, include: { agent: { select: { name: true } } } }),
    ]);
    const externalIds = incoming.map((message) => message.externalMessageId).filter((id): id is string => Boolean(id));
    const linkedMessages = externalIds.length
      ? await prisma.message.findMany({
          where: { externalMessageId: { in: externalIds } },
          select: {
            id: true,
            conversationId: true,
            externalMessageId: true,
            media: true,
          },
        })
      : [];
    const linkedByExternalId = new Map(linkedMessages.map((message) => [message.externalMessageId, message]));
    const publicMedia = (media: any) => media ? {
      id: media.id,
      type: media.type,
      status: media.status,
      mimeType: media.mimeType,
      caption: media.caption,
      fileName: media.originalFileName,
      title: media.title,
      ptt: media.ptt,
      seconds: media.seconds,
      width: media.width,
      height: media.height,
      pageCount: media.pageCount,
      viewOnce: media.viewOnce,
      hasThumbnail: Boolean(media.thumbnailUrlCiphertext),
      expiresAt: media.expiresAt.toISOString(),
      available: media.status === "AVAILABLE" && !media.viewOnce && media.expiresAt.getTime() > Date.now(),
    } : null;
    return [
      ...incoming.map((message) => {
        const linked = message.externalMessageId ? linkedByExternalId.get(message.externalMessageId) : null;
        return {
          id: message.id,
          direction: message.direction,
          content: message.content,
          messageType: message.messageType,
          senderName: message.senderNameSnapshot || message.senderContact?.name || "Participante",
          status: "RECEIVED",
          createdAt: message.createdAt.toISOString(),
          conversationId: linked?.conversationId ?? message.conversationId ?? null,
          linkedMessageId: linked?.id ?? null,
          media: publicMedia(linked?.media),
          outgoingMedia: null,
        };
      }),
      ...outgoing.map((message) => ({
        id: message.id,
        direction: "OUT",
        content: message.content,
        messageType: message.messageType,
        senderName: message.agent.name,
        status: message.status,
        createdAt: message.createdAt.toISOString(),
        conversationId: null,
        linkedMessageId: null,
        media: null,
        outgoingMedia: message.messageType === "TEXT" ? null : {
          id: message.id,
          type: message.messageType,
          mimeType: message.mimeType || "application/octet-stream",
          fileName: message.fileName,
          caption: message.caption,
          sizeBytes: message.sizeBytes || 0,
          status: message.status,
          providerMessageId: message.providerMessageId,
          failureCode: message.failureCode,
          createdAt: message.createdAt.toISOString(),
        },
      })),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async markGroupRead(groupChatId: string) {
    const now = new Date();
    await prisma.$transaction([
      prisma.groupMessage.updateMany({ where: { groupChatId, readAt: null }, data: { readAt: now } }),
      prisma.groupChat.update({ where: { id: groupChatId }, data: { unreadCount: 0 } }),
    ]);
    return { groupChatId, readAt: now.toISOString() };
  }

  async findGroupOutboundByClientMessageId(clientMessageId: string) {
    return prisma.groupOutboundMessage.findUnique({ where: { clientMessageId }, include: { agent: { select: { name: true } } } });
  }

  async findGroupOutboundByProviderMessageIds(providerMessageIds: string[]) {
    const ids = providerMessageIds.filter(Boolean);
    if (!ids.length) return null;
    return prisma.groupOutboundMessage.findFirst({
      where: { providerMessageId: { in: ids } },
      select: { id: true, groupChatId: true, status: true, providerMessageId: true },
    });
  }

  async createGroupOutboundMessage(data: {
    groupChatId: string;
    agentId: string;
    clientMessageId: string;
    content: string;
    messageType?: string;
    mimeType?: string | null;
    fileName?: string | null;
    sizeBytes?: number | null;
    caption?: string | null;
  }) {
    try {
      return await prisma.groupOutboundMessage.create({ data, include: { agent: { select: { name: true } } } });
    } catch (error: any) {
      if (error?.code === "P2002") return prisma.groupOutboundMessage.findUnique({ where: { clientMessageId: data.clientMessageId }, include: { agent: { select: { name: true } } } });
      throw error;
    }
  }

  async updateGroupOutboundMessage(id: string, data: { status: string; providerMessageId?: string | null; failureCode?: string | null }) {
    const updated = await prisma.groupOutboundMessage.update({
      where: { id },
      data: {
        status: data.status,
        providerMessageId: data.providerMessageId ?? undefined,
        failureCode: data.failureCode ?? undefined,
        ...(data.status === "SENT" ? { sentAt: new Date() } : {}),
      },
      include: { agent: { select: { name: true } } },
    });
    if (data.status === "SENT") {
      await prisma.groupChat.update({ where: { id: updated.groupChatId }, data: { lastMessageAt: updated.sentAt ?? updated.createdAt } });
    }
    return updated;
  }

  async findOutgoingMediaByProviderMessageIds(providerMessageIds: string[]) {
    const ids = providerMessageIds.filter(Boolean);
    if (!ids.length) return null;
    return prisma.outgoingMedia.findFirst({
      where: { providerMessageId: { in: ids } },
      select: { id: true, conversationId: true, status: true, providerMessageId: true },
    });
  }

  async markOutgoingMediaDeliveryFailed(id: string, failureCode: string) {
    return prisma.outgoingMedia.updateMany({
      where: { id, status: { in: ["PENDING", "SENDING", "SENT"] } },
      data: { status: "FAILED", failureCode: failureCode.slice(0, 160) },
    });
  }

  async markGroupOutboundDeliveryFailed(id: string, failureCode: string) {
    return prisma.groupOutboundMessage.updateMany({
      where: { id, status: { in: ["PENDING", "SENDING", "SENT"] } },
      data: { status: "FAILED", failureCode: failureCode.slice(0, 500) },
    });
  }

  async findAgentById(id: string) {
    return prisma.agent.findUnique({ where: { id }, select: { id: true, name: true, isActive: true, department: { select: { name: true } } } });
  }

  async findContactByAnyPhone(phones: string[]) {
    if (!phones.length) return null;
    return prisma.contact.findFirst({
      where: { OR: [{ phone: { in: phones } }, { phoneNumbers: { some: { phone: { in: phones } } } }] },
      select: { id: true, phone: true },
    });
  }

  async findLastBotMessageAt(conversationId: string) {
    const message = await prisma.message.findFirst({
      where: { conversationId, senderType: "BOT", direction: "OUT" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { createdAt: true },
    });
    return message?.createdAt ?? null;
  }

  updateGroupContext(id: string, groupChatName?: string | null, groupParticipant?: string | null) {
    return prisma.conversation.update({ where: { id }, data: { groupChatName: groupChatName ?? null, groupParticipant: groupParticipant ?? null } });
  }

  findIncomingMessage(externalMessageId: string) {
    return prisma.message.findUnique({ where: { externalMessageId }, select: { id: true } });
  }

  async reserveGroupMention(groupKey: string, participantKey: string, cooldownSeconds: number) {
    const cutoff = new Date(Date.now() - cooldownSeconds * 1000);
    const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      INSERT INTO "gtf_group_mention_cooldowns" ("id", "group_key", "participant_key", "last_mention_at")
      VALUES (${randomUUID()}, ${groupKey}, ${participantKey}, NOW())
      ON CONFLICT ("group_key", "participant_key") DO UPDATE
      SET "last_mention_at" = EXCLUDED."last_mention_at"
      WHERE "gtf_group_mention_cooldowns"."last_mention_at" <= ${cutoff}
      RETURNING "id"
    `);
    return rows.length > 0;
  }

  updateInstanceIdentity(instancePhone: string, instanceLid?: string | null) {
    return prisma.zApiConfig.updateMany({
      data: {
        instancePhone,
        ...(instanceLid ? { instanceLid } : {}),
      },
    });
  }

  async addIncomingMessage(data: {
    conversationId: string;
    externalMessageId: string;
    content: string;
    messageType?: string;
    senderContactId?: string | null;
    senderNameSnapshot?: string | null;
    contactShare?: {
      displayName: string;
      phones: string[];
      primaryPhone?: string | null;
      canonicalContactId?: string | null;
      email?: string | null;
      organization?: string | null;
      note?: string | null;
    };
    media?: {
      type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
      status: "AVAILABLE" | "UNAVAILABLE" | "EXPIRED";
      mimeType: string;
      caption?: string | null;
      originalFileName?: string | null;
      title?: string | null;
      ptt?: boolean | null;
      seconds?: number | null;
      width?: number | null;
      height?: number | null;
      pageCount?: number | null;
      viewOnce: boolean;
      sourceUrlCiphertext?: string | null;
      thumbnailUrlCiphertext?: string | null;
      encryptionKeyVersion: number;
      sourceCreatedAt: Date;
      expiresAt: Date;
      failureCode?: string | null;
    };
  }) {
    try {
      return await prisma.$transaction(async (transaction) => {
        const existing = await transaction.message.findUnique({
          where: { externalMessageId: data.externalMessageId },
          include: { media: true, contactShare: true },
        });
        if (existing) return { duplicate: true, message: existing };

        const message = await transaction.message.create({
          data: {
            conversationId: data.conversationId,
            externalMessageId: data.externalMessageId,
            direction: "IN",
            senderType: "CLIENT",
            senderContactId: data.senderContactId ?? null,
            senderNameSnapshot: data.senderNameSnapshot ?? null,
            messageType: data.messageType ?? "TEXT",
            content: data.content,
            ...(data.contactShare
              ? {
                  contactShare: {
                    create: {
                      displayName: data.contactShare.displayName,
                      phones: data.contactShare.phones,
                      primaryPhone: data.contactShare.primaryPhone ?? null,
                      canonicalContactId: data.contactShare.canonicalContactId ?? null,
                      email: data.contactShare.email ?? null,
                      organization: data.contactShare.organization ?? null,
                      note: data.contactShare.note ?? null,
                    },
                  },
                }
              : {}),
            ...(data.media
              ? {
                  media: {
                    create: {
                      conversationId: data.conversationId,
                      whatsappMessageId: data.externalMessageId,
                      provider: "ZAPI",
                      ...data.media,
                    },
                  },
                }
              : {}),
          },
          include: { media: true, contactShare: true },
        });
        await transaction.conversation.update({
          where: { id: data.conversationId },
          data: { lastActivityAt: message.createdAt },
        });
        return { duplicate: false, message };
      });
    } catch (error: any) {
      if (error?.code !== "P2002") throw error;
      const existing = await prisma.message.findUnique({
        where: { externalMessageId: data.externalMessageId },
        include: { media: true, contactShare: true },
      });
      if (!existing) throw error;
      return { duplicate: true, message: existing };
    }
  }

  async deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } });
  }

  async getLatestFlow() {
    return prisma.flowDefinition.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  }

  async getDepartmentById(id: string) {
    return prisma.department.findUnique({
      where: { id },
    });
  }

  async getConversationContext(id: string) {
    return prisma.conversation.findUnique({ where: { id }, select: { status: true, departmentId: true, assignedAgentId: true, queuedAt: true } });
  }

  async resetInactivityWarning(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { warningSentAt: null },
    });
  }
}

export const zApiRepository = new ZApiRepository();
