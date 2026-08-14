import { prisma } from "../../shared/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";

export class NotificationsRepository {
  list(agentId: string, params: { unreadOnly?: boolean; page: number; limit: number }) {
    const where = {
      agentId,
      // Dismissed notifications are archived from the active bell feed. They
      // remain persisted for audit/history but must not reappear after a
      // refresh or socket-driven invalidation.
      dismissedAt: null,
      ...(params.unreadOnly ? { readAt: null } : {}),
    };
    return Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (params.page - 1) * params.limit, take: params.limit }),
      prisma.notification.count({ where }),
    ]);
  }

  unreadCount(agentId: string) {
    return prisma.notification.count({ where: { agentId, readAt: null, dismissedAt: null } });
  }

  findById(id: string, agentId: string) {
    return prisma.notification.findFirst({ where: { id, agentId } });
  }

  async createManyIdempotent(items: Array<{
    agentId: string;
    type: string;
    title: string;
    body: string;
    conversationId?: string | null;
    departmentId?: string | null;
    dedupeKey: string;
    payload?: Prisma.InputJsonValue;
  }>) {
    const created: any[] = [];
    for (const item of items) {
      try {
        const row = await prisma.notification.create({ data: item });
        created.push(row);
      } catch (error: any) {
        if (error?.code !== "P2002") throw error;
      }
    }
    return created;
  }

  markRead(id: string, agentId: string) {
    return prisma.notification.updateMany({ where: { id, agentId, readAt: null }, data: { readAt: new Date() } });
  }

  markAllRead(agentId: string) {
    return prisma.notification.updateMany({ where: { agentId, readAt: null }, data: { readAt: new Date() } });
  }

  dismiss(id: string, agentId: string) {
    return prisma.notification.updateMany({ where: { id, agentId, dismissedAt: null }, data: { dismissedAt: new Date() } });
  }

  async getPreference(agentId: string) {
    return prisma.notificationPreference.upsert({
      where: { agentId },
      update: {},
      create: { agentId },
    });
  }

  updatePreference(agentId: string, data: { soundEnabled?: boolean; browserEnabled?: boolean; unresolvedRemindersEnabled?: boolean; unresolvedReminderMinutes?: number; reminderRepeatMinutes?: number }) {
    return prisma.notificationPreference.upsert({ where: { agentId }, update: data, create: { agentId, ...data } });
  }

  findEligibleAgents(departmentId?: string | null, assignedAgentId?: string | null) {
    return prisma.agent.findMany({
      where: {
        isActive: true,
        ...(assignedAgentId ? { id: assignedAgentId } : departmentId ? { OR: [{ departmentId }, { role: "ADMIN" }] } : {}),
      },
      select: { id: true },
    });
  }

  findQueuedForReminder(before: Date) {
    return prisma.conversation.findMany({
      where: { status: "QUEUED", queuedAt: { lte: before }, closedAt: null },
      select: { id: true, queuedAt: true, departmentId: true, assignedAgentId: true, lastActivityAt: true },
      take: 500,
      orderBy: { queuedAt: "asc" },
    });
  }

  findInProgressForReminder(before: Date) {
    return prisma.conversation.findMany({
      where: { status: "IN_PROGRESS", assignedAgentId: { not: null }, lastActivityAt: { lte: before }, closedAt: null },
      select: { id: true, queuedAt: true, departmentId: true, assignedAgentId: true, lastActivityAt: true },
      take: 500,
      orderBy: { lastActivityAt: "asc" },
    });
  }

  findConversationContext(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      select: { status: true, departmentId: true, assignedAgentId: true, queuedAt: true },
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
