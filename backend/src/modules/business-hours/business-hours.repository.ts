import { randomUUID } from "node:crypto";
import { prisma } from "../../shared/prisma.js";

const policyInclude = {
  intervals: { orderBy: [{ weekday: "asc" as const }, { sortOrder: "asc" as const }, { startMinute: "asc" as const }] },
  exceptions: { orderBy: { localDate: "asc" as const } },
};

export class BusinessHoursRepository {
  getZApiConfig() {
    return prisma.zApiConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  }

  listPolicies(zApiConfigId: string) {
    return prisma.businessHoursPolicy.findMany({ where: { zApiConfigId }, include: policyInclude, orderBy: [{ departmentId: "asc" }, { updatedAt: "desc" }] });
  }

  findPolicy(id: string) {
    return prisma.businessHoursPolicy.findUnique({ where: { id }, include: policyInclude });
  }

  findApplicable(zApiConfigId: string, departmentId?: string | null) {
    return prisma.businessHoursPolicy.findMany({
      where: { zApiConfigId, enabled: true, ...(departmentId ? { OR: [{ departmentId }, { departmentId: null }] } : { departmentId: null }) },
      include: policyInclude,
      orderBy: { departmentId: "desc" },
    });
  }

  countOnlineAgents(departmentId?: string | null) {
    return prisma.agent.count({ where: { isActive: true, isOnline: true, ...(departmentId ? { departmentId } : {}) } });
  }

  async createPolicy(zApiConfigId: string, data: any) {
    return prisma.businessHoursPolicy.create({
      data: {
        id: randomUUID(),
        zApiConfigId,
        departmentId: data.departmentId ?? null,
        enabled: data.enabled,
        mode: data.mode,
        timezone: data.timezone,
        outsideMessage: data.outsideMessage,
        noAgentMessage: data.noAgentMessage ?? null,
        noticeFrequency: data.noticeFrequency,
        messageCooldownMinutes: data.messageCooldownMinutes,
        updatedByAgentId: data.updatedByAgentId ?? null,
        intervals: { create: data.intervals.map((interval: any, index: number) => ({ id: randomUUID(), weekday: interval.weekday, startMinute: interval.startMinute, endMinute: interval.endMinute, sortOrder: interval.sortOrder ?? index })) },
        exceptions: { create: data.exceptions.map((exception: any) => ({ id: randomUUID(), localDate: new Date(`${exception.localDate}T00:00:00.000Z`), kind: exception.kind, intervalsJson: exception.intervals ?? null, reason: exception.reason ?? null })) },
      },
      include: policyInclude,
    });
  }

  async updatePolicy(id: string, revision: number, data: any) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.businessHoursPolicy.findUnique({ where: { id }, select: { revision: true } });
      if (!current) return null;
      if (current.revision !== revision) throw Object.assign(new Error("A política foi alterada por outro usuário."), { code: "REVISION_CONFLICT" });
      await transaction.businessHoursInterval.deleteMany({ where: { policyId: id } });
      await transaction.businessHoursException.deleteMany({ where: { policyId: id } });
      return transaction.businessHoursPolicy.update({
        where: { id },
        data: {
          departmentId: data.departmentId ?? null,
          enabled: data.enabled,
          mode: data.mode,
          timezone: data.timezone,
          outsideMessage: data.outsideMessage,
          noAgentMessage: data.noAgentMessage ?? null,
          noticeFrequency: data.noticeFrequency,
          messageCooldownMinutes: data.messageCooldownMinutes,
          updatedByAgentId: data.updatedByAgentId ?? null,
          revision: { increment: 1 },
          intervals: { create: data.intervals.map((interval: any, index: number) => ({ id: randomUUID(), weekday: interval.weekday, startMinute: interval.startMinute, endMinute: interval.endMinute, sortOrder: interval.sortOrder ?? index })) },
          exceptions: { create: data.exceptions.map((exception: any) => ({ id: randomUUID(), localDate: new Date(`${exception.localDate}T00:00:00.000Z`), kind: exception.kind, intervalsJson: exception.intervals ?? null, reason: exception.reason ?? null })) },
        },
        include: policyInclude,
      });
    });
  }

  disablePolicy(id: string, revision: number) {
    return prisma.businessHoursPolicy.updateMany({ where: { id, revision }, data: { enabled: false, revision: { increment: 1 } } });
  }

  async reserveNotice(data: { conversationId: string; policyId: string; reason: "OUTSIDE_HOURS" | "NO_AGENT_ONLINE"; windowKey: string }) {
    try {
      return await prisma.businessHoursNotice.create({ data: { id: randomUUID(), ...data, status: "PENDING" } });
    } catch (error: any) {
      if (error?.code === "P2002") {
        const existing = await prisma.businessHoursNotice.findFirst({ where: data });
        if (existing?.status === "FAILED" || (existing?.status === "PENDING" && Date.now() - existing.updatedAt.getTime() > 5 * 60_000)) {
          return prisma.businessHoursNotice.update({ where: { id: existing.id }, data: { status: "PENDING", lastError: null } });
        }
        return null;
      }
      throw error;
    }
  }

  markNoticeSent(id: string, messageId: string) {
    return prisma.businessHoursNotice.update({ where: { id }, data: { status: "SENT", messageId, sentAt: new Date(), lastError: null } });
  }

  markNoticeFailed(id: string, error: string) {
    return prisma.businessHoursNotice.update({ where: { id }, data: { status: "FAILED", lastError: error.slice(0, 500) } });
  }
}

export const businessHoursRepository = new BusinessHoursRepository();
