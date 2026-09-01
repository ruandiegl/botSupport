import { prisma } from "../../shared/prisma.js";

export class MediaRepository {
  async findByMessage(conversationId: string, messageId: string) {
    const direct = await prisma.conversationMedia.findFirst({
      where: { conversationId, messageId },
      include: {
        conversation: {
          select: {
            id: true,
            status: true,
            channel: true,
            currentStep: true,
            departmentId: true,
            assignedAgentId: true,
            remoteChatId: true,
            groupChatId: true,
            groupChatName: true,
          },
        },
      },
    });
    if (direct) return direct;

    // A group transcript is continuous even though its tickets are separate
    // lifecycle records. Media rendered from a historical ticket is opened
    // while the user is viewing the current group monitor, so allow the
    // message lookup across rows that identify the same group.
    const selected = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { channel: true, remoteChatId: true, groupChatId: true, groupChatName: true },
    });
    if (!selected) return null;
    const isGroup = Boolean(selected?.channel === "GROUP" || selected?.groupChatId || selected?.groupChatName || selected?.remoteChatId?.includes("@g.us"));
    if (!isGroup) return null;

    const media = await prisma.conversationMedia.findUnique({
      where: { messageId },
      include: {
        conversation: {
          select: {
            id: true,
            status: true,
            channel: true,
            currentStep: true,
            departmentId: true,
            assignedAgentId: true,
            remoteChatId: true,
            groupChatId: true,
            groupChatName: true,
          },
        },
      },
    });
    if (!media) return null;
    const remoteVariants = [selected.remoteChatId, selected.remoteChatId?.replace(/@g\.us$/i, "")].filter(Boolean);
    const sameGroup = (selected.groupChatId && media.conversation.groupChatId === selected.groupChatId)
      || (selected.groupChatName && media.conversation.groupChatName === selected.groupChatName)
      || (remoteVariants.length > 0 && remoteVariants.includes(media.conversation.remoteChatId ?? ""));
    return sameGroup ? media : null;
  }

  async findById(id: string) {
    return prisma.conversationMedia.findUnique({
      where: { id },
      include: {
        conversation: {
          select: {
            id: true,
            status: true,
            channel: true,
            currentStep: true,
            departmentId: true,
            assignedAgentId: true,
          },
        },
      },
    });
  }

  async markAccessed(id: string) {
    return prisma.conversationMedia.update({
      where: { id },
      data: { lastAccessedAt: new Date(), lastAccessErrorCode: null },
    });
  }

  async markAccessError(id: string, code: string) {
    return prisma.conversationMedia.update({
      where: { id },
      data: { lastAccessErrorCode: code.slice(0, 80) },
    });
  }

  async markUnavailable(id: string, failureCode: string) {
    return prisma.conversationMedia.update({
      where: { id },
      data: {
        status: "UNAVAILABLE",
        failureCode,
        sourceUrlCiphertext: null,
        thumbnailUrlCiphertext: null,
        lastAccessErrorCode: failureCode,
      },
    });
  }

  async expireOne(id: string) {
    return prisma.conversationMedia.updateMany({
      where: { id, status: "AVAILABLE" },
      data: {
        status: "EXPIRED",
        sourceUrlCiphertext: null,
        thumbnailUrlCiphertext: null,
      },
    });
  }

  async expireDue(limit = 100) {
    const due = await prisma.conversationMedia.findMany({
      where: { status: "AVAILABLE", expiresAt: { lte: new Date() } },
      orderBy: { expiresAt: "asc" },
      take: limit,
      select: { id: true, conversationId: true },
    });
    if (!due.length) return [];
    const claimed: typeof due = [];
    for (const item of due) {
      const result = await prisma.conversationMedia.updateMany({
        where: { id: item.id, status: "AVAILABLE", expiresAt: { lte: new Date() } },
        data: {
          status: "EXPIRED",
          sourceUrlCiphertext: null,
          thumbnailUrlCiphertext: null,
        },
      });
      if (result.count === 1) claimed.push(item);
    }
    return claimed;
  }
}

export const mediaRepository = new MediaRepository();
