import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";

export class ZApiRepository {
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
    return prisma.conversation.findFirst({
      where: { channel: "GROUP", remoteChatId, status: { notIn: ["CLOSED", "DRAFT"] } },
      include: { contact: true, department: true, assignedAgent: true, groupChat: true },
      orderBy: { startedAt: "desc" },
    });
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
    return prisma.groupChat.upsert({
      where: { remoteChatId },
      create: { remoteChatId, name: safeName, lastMessageAt },
      update: { name: safeName, lastMessageAt, isActive: true },
    });
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
      take: 100,
      include: { conversations: { where: { status: { notIn: ["CLOSED", "DRAFT"] } }, select: { id: true, status: true, assignedAgentId: true }, take: 1 } },
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
        take: 100,
        include: { senderContact: { select: { name: true, phone: true } } },
      }),
      prisma.groupOutboundMessage.findMany({ where: { groupChatId }, orderBy: { createdAt: "desc" }, take: 100, include: { agent: { select: { name: true } } } }),
    ]);
    return [
      ...incoming.map((message) => ({ id: message.id, direction: message.direction, content: message.content, messageType: message.messageType, senderName: message.senderNameSnapshot || message.senderContact?.name || "Participante", status: "RECEIVED", createdAt: message.createdAt.toISOString() })),
      ...outgoing.map((message) => ({ id: message.id, direction: "OUT", content: message.content, messageType: "TEXT", senderName: message.agent.name, status: message.status, createdAt: message.createdAt.toISOString() })),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-100);
  }

  async findGroupOutboundByClientMessageId(clientMessageId: string) {
    return prisma.groupOutboundMessage.findUnique({ where: { clientMessageId } });
  }

  async createGroupOutboundMessage(data: { groupChatId: string; agentId: string; clientMessageId: string; content: string }) {
    try {
      return await prisma.groupOutboundMessage.create({ data });
    } catch (error: any) {
      if (error?.code === "P2002") return prisma.groupOutboundMessage.findUnique({ where: { clientMessageId: data.clientMessageId } });
      throw error;
    }
  }

  async updateGroupOutboundMessage(id: string, data: { status: string; providerMessageId?: string | null; failureCode?: string | null }) {
    return prisma.groupOutboundMessage.update({
      where: { id },
      data: {
        status: data.status,
        providerMessageId: data.providerMessageId ?? undefined,
        failureCode: data.failureCode ?? undefined,
        ...(data.status === "SENT" ? { sentAt: new Date() } : {}),
      },
    });
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
