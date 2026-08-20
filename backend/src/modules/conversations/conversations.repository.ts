import { prisma } from "../../shared/prisma.js";
// The generated client lives under src/ and is loaded at runtime by the
// compiled server as well as the TypeScript test runner.
import { Prisma } from "../../../src/generated/prisma/index.js";

export class ConversationsRepository {
  createManualConversation(contactId: string, departmentId?: string) {
    const now = new Date();
    return prisma.conversation.create({
      data: {
        contactId,
        status: "OPEN",
        currentStep: "MANUAL",
        departmentId: departmentId ?? null,
        queuedAt: now,
        lastActivityAt: now,
      },
      select: { id: true, status: true },
    });
  }

  async findMany(filters: {
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
  }) {
    const where: any = {};
    if (filters.status && filters.status !== "ALL") {
      // Map legacy statuses for backward compatibility
      const statusValue = filters.status;
      where.status = statusValue;
    }
    if (filters.departmentId && filters.departmentId !== "ALL") {
      where.departmentId = filters.departmentId;
    }

    if (filters.assignedAgentId && filters.assignedAgentId !== "ALL") {
      where.assignedAgentId = filters.assignedAgentId;
    }

    if (filters.openOnly && !where.status) {
      where.status = { not: "CLOSED" };
    }
    if (filters.unreadOnly) {
      where.messages = { some: { direction: "IN", readAt: null } };
    }
    if (filters.labelIds?.length) {
      where.labels = { some: { labelId: { in: filters.labelIds } } };
    }

    if (filters.q) {
      where.OR = [
        { contact: { name: { contains: filters.q, mode: "insensitive" } } },
        { contact: { phone: { contains: filters.q } } },
        { messages: { some: { content: { contains: filters.q, mode: "insensitive" } } } },
      ];
    }

    if (filters.from || filters.to) {
      where[filters.dateField === "createdAt" ? "startedAt" : "lastActivityAt"] = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lt: new Date(filters.to) } : {}),
      };
    }

    const isPaged = filters.page !== undefined || filters.limit !== undefined;
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(5, filters.limit ?? 20));
    const sort = filters.sort ?? "operational";

    // For paged operational reads, use a parameterized CASE expression so a
    // large queue is ranked correctly before LIMIT/OFFSET (Prisma's lexical
    // status ordering would put BOT before QUEUED).
    if (isPaged) {
      const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];
      if (filters.status && filters.status !== "ALL") conditions.push(Prisma.sql`c."status" = ${filters.status}`);
      if (filters.departmentId && filters.departmentId !== "ALL") conditions.push(Prisma.sql`c."department_id" = ${filters.departmentId}`);
      if (filters.assignedAgentId) conditions.push(Prisma.sql`c."assigned_agent_id" = ${filters.assignedAgentId}`);
      if (filters.openOnly) conditions.push(Prisma.sql`c."status" <> 'CLOSED'`);
      if (filters.unreadOnly) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "gtf_messages" umf WHERE umf."conversation_id" = c."id" AND umf."direction" = 'IN' AND umf."read_at" IS NULL)`);
      if (filters.labelIds?.length) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "gtf_conversation_labels" clf WHERE clf."conversation_id" = c."id" AND clf."label_id" IN (${Prisma.join(filters.labelIds)}))`);
      const dateColumn = Prisma.raw(filters.dateField === "createdAt" ? 'c."started_at"' : 'c."last_activity_at"');
      if (filters.from) conditions.push(Prisma.sql`${dateColumn} >= ${new Date(filters.from)}`);
      if (filters.to) conditions.push(Prisma.sql`${dateColumn} < ${new Date(filters.to)}`);
      if (filters.q) {
        const like = `%${filters.q}%`;
        conditions.push(Prisma.sql`(ct."name" ILIKE ${like} OR ct."phone" LIKE ${like} OR EXISTS (SELECT 1 FROM "gtf_messages" m WHERE m."conversation_id" = c."id" AND m."content" ILIKE ${like}))`);
      }
      const whereSql = Prisma.join(conditions, " AND ");
      const orderSql = sort === "oldest"
        ? Prisma.sql`c."started_at" ASC, c."id" ASC`
        : sort === "recent"
        ? Prisma.sql`c."last_activity_at" DESC, c."id" ASC`
        : Prisma.sql`CASE c."status" WHEN 'OPEN' THEN 0 WHEN 'IN_PROGRESS' THEN 1 WHEN 'CLOSED' THEN 2 ELSE 9 END ASC, (SELECT COUNT(*) FROM "gtf_messages" um WHERE um."conversation_id" = c."id" AND um."direction" = 'IN' AND um."read_at" IS NULL) DESC, CASE WHEN c."status" = 'OPEN' THEN COALESCE(c."queued_at", c."started_at") END ASC NULLS LAST, c."last_activity_at" DESC, c."id" ASC`;
      const offset = (page - 1) * limit;
      const idRows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT c."id" FROM "gtf_conversations" c
        LEFT JOIN "gtf_contacts" ct ON ct."id" = c."contact_id"
        WHERE ${whereSql}
        ORDER BY ${orderSql}
        LIMIT ${limit} OFFSET ${offset}
      `);
      const countRows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count FROM "gtf_conversations" c
        LEFT JOIN "gtf_contacts" ct ON ct."id" = c."contact_id"
        WHERE ${whereSql}
      `);
      const ids = idRows.map((row) => row.id);
      // A queue row only needs a summary.  The previous implementation
      // returned ids here and the service then called findById once per row,
      // loading the complete message history (N+1).  Keep this projection
      // intentionally small; the detail endpoint owns the full history.
      const rows = ids.length
        ? await prisma.conversation.findMany({
            where: { id: { in: ids } },
            select: {
              id: true,
              status: true,
              departmentId: true,
              assignedAgentId: true,
              queuedAt: true,
              lastActivityAt: true,
              startedAt: true,
              closedAt: true,
              groupChatName: true,
              contact: { select: { name: true, phone: true, isRegistered: true } },
              department: { select: { name: true } },
              assignedAgent: { select: { name: true } },
              labels: {
                select: { label: { select: { id: true, name: true, slug: true, color: true, icon: true, isSystem: true } } },
                orderBy: { createdAt: "asc" },
              },
              messages: {
                take: 1,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                select: { id: true, content: true, direction: true, senderType: true, createdAt: true, senderNameSnapshot: true },
              },
              _count: {
                select: { messages: { where: { direction: "IN", readAt: null } } },
              },
            },
          })
        : [];
      const byId = new Map(rows.map((row) => [row.id, row]));
      return { items: ids.map((id) => byId.get(id)).filter(Boolean) as typeof rows, total: Number(countRows[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(countRows[0]?.count ?? 0) / limit), isPaged: true, isSummary: true };
    }

    const orderBy = sort === "oldest"
      ? [{ startedAt: "asc" as const }, { id: "asc" as const }]
      : [{ lastActivityAt: "desc" as const }, { id: "asc" as const }];

    const [rows, total] = await Promise.all([
      prisma.conversation.findMany({
      where,
        orderBy,
        select: { id: true, status: true, queuedAt: true, lastActivityAt: true, startedAt: true },
      }),
      prisma.conversation.count({ where }),
    ]);

    const statusRank: Record<string, number> = { OPEN: 0, IN_PROGRESS: 1, CLOSED: 2 };
    const sorted = sort === "operational"
      ? rows.slice().sort((a, b) => {
          const rank = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
          if (rank !== 0) return rank;
          if (a.status === "OPEN" && b.status === "OPEN") {
            const aQueued = a.queuedAt?.getTime() ?? a.startedAt.getTime();
            const bQueued = b.queuedAt?.getTime() ?? b.startedAt.getTime();
            if (aQueued !== bQueued) return aQueued - bQueued;
          }
          const activity = b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
          return activity || a.id.localeCompare(b.id);
        })
      : rows;

    const items = isPaged ? sorted.slice((page - 1) * limit, page * limit) : sorted;
    return { items, total, page, limit, totalPages: Math.ceil(total / limit), isPaged, isSummary: false };
  }

  async countOperational(scope: {
    departmentId?: string | null;
    agentId?: string | null;
    accessible?: boolean;
    dateField?: "lastActivityAt" | "createdAt";
    from?: string;
    to?: string;
  }) {
    if (scope.accessible === false) {
      return { all: 0, open: 0, inProgress: 0, closed: 0, mine: 0, unread: 0 };
    }

    const baseWhere = scope.departmentId ? { departmentId: scope.departmentId } : {};
    const dateField = scope.dateField === "createdAt" ? "startedAt" : "lastActivityAt";
    const dateWhere = scope.from || scope.to
      ? {
          [dateField]: {
            ...(scope.from ? { gte: new Date(scope.from) } : {}),
            ...(scope.to ? { lt: new Date(scope.to) } : {}),
          },
        }
      : {};
    const scopedWhere = { ...baseWhere, ...dateWhere };
    const [byStatus, all, mine, unread] = await Promise.all([
      prisma.conversation.groupBy({ where: scopedWhere, by: ["status"], _count: { _all: true } }),
      prisma.conversation.count({ where: scopedWhere }),
      scope.agentId
        ? prisma.conversation.count({ where: { ...scopedWhere, assignedAgentId: scope.agentId, status: { not: "CLOSED" } } })
        : Promise.resolve(0),
      prisma.message.count({ where: { direction: "IN", readAt: null, conversation: scopedWhere } }),
    ]);

    const statusCount = (status: string) => byStatus.find((row) => row.status === status)?._count._all ?? 0;
    const open = statusCount("OPEN");
    const inProgress = statusCount("IN_PROGRESS");
    const closed = statusCount("CLOSED");
    return { all, open, inProgress, closed, mine, unread };
  }

  async findById(id: string, options: { messageLimit?: number; before?: { createdAt: Date; id: string } } = {}) {
    const messageLimit = options.messageLimit;
    const messageWhere = options.before
      ? {
          OR: [
            { createdAt: { lt: options.before.createdAt } },
            { createdAt: options.before.createdAt, id: { lt: options.before.id } },
          ],
        }
      : undefined;
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: { include: { phoneNumbers: { select: { id: true } } } },
        department: true,
        assignedAgent: {
          include: { department: true },
        },
        labels: {
          include: { label: { select: { id: true, name: true, slug: true, color: true, icon: true, isSystem: true } } },
          orderBy: { createdAt: "asc" },
        },
        messages: {
          ...(messageWhere ? { where: messageWhere } : {}),
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          ...(messageLimit ? { take: messageLimit + 1 } : {}),
          include: { media: true, contactShare: true, senderAgent: { include: { department: true } }, senderContact: true },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            fromAgent: { select: { id: true, name: true } },
            toAgent: { select: { id: true, name: true, department: { select: { name: true } } } },
            actorAgent: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { messages: { where: { direction: "IN", readAt: null } } },
        },
      },
    });
  }

  async findAccessById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        departmentId: true,
        assignedAgentId: true,
        contact: { select: { name: true, phone: true } },
        department: { select: { name: true } },
        assignedAgent: { select: { id: true, name: true, department: { select: { name: true } } } },
        assignments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            fromAgent: { select: { id: true, name: true } },
            toAgent: { select: { id: true, name: true, department: { select: { name: true } } } },
            actorAgent: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findMessages(id: string, options: { limit: number; before?: { createdAt: Date; id: string } }) {
    const where = options.before
      ? {
          conversationId: id,
          OR: [
            { createdAt: { lt: options.before.createdAt } },
            { createdAt: options.before.createdAt, id: { lt: options.before.id } },
          ],
        }
      : { conversationId: id };
    const rows = await prisma.message.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: options.limit + 1,
      include: { media: true, contactShare: true, senderAgent: { include: { department: true } }, senderContact: true },
    });
    const hasPrevious = rows.length > options.limit;
    const items = rows.slice(0, options.limit).reverse();
    return { items, hasPrevious };
  }

  async updateStatusAndAgent(id: string, status: string, assignedAgentId?: string | null) {
    const now = new Date();
    return prisma.conversation.update({
      where: { id },
      data: {
        status,
        ...(assignedAgentId !== undefined && { assignedAgentId }),
        lastActivityAt: now,
        // Reset inactivity warning when status changes
        ...(status !== "CLOSED" ? { warningSentAt: null } : {}),
        ...(status === "OPEN" ? { queuedAt: now } : {}),
      },
    });
  }

  async close(id: string, reason: string = "MANUAL") {
    return prisma.conversation.update({
      where: { id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        lastActivityAt: new Date(),
        closeReason: reason,
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
        content: data.content,
      },
    });
    await prisma.conversation.update({ where: { id: data.conversationId }, data: { lastActivityAt: message.createdAt } });
    return message;
  }

  async markIncomingMessagesAsRead(conversationId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        direction: "IN",
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  async findFirstAgent() {
    return prisma.agent.findFirst({
      orderBy: { name: "asc" },
      include: { department: true },
    });
  }

  async findAgentById(id: string) {
    return prisma.agent.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async findEligibleAssignees(conversationId: string, actor: { id: string; role: string; departmentId?: string | null }) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { departmentId: true } });
    if (!conversation) return null;
    const departmentFilter = actor.role === "SUPERVISOR" && actor.departmentId
      ? { departmentId: actor.departmentId }
      : actor.role === "AGENT" && actor.departmentId
      ? { departmentId: actor.departmentId }
      : {};
    return prisma.agent.findMany({
      where: { isActive: true, ...departmentFilter },
      orderBy: [{ isOnline: "desc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, role: true, isOnline: true, departmentId: true, department: { select: { name: true } } },
    });
  }

  async delegate(id: string, targetAgentId: string, actorAgentId: string, reason?: string | null) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.conversation.findUnique({ where: { id }, select: { assignedAgentId: true, status: true } });
      if (!current) return { kind: "NOT_FOUND" as const };
      if (current.status === "CLOSED") return { kind: "CLOSED" as const };
      const updated = await transaction.conversation.updateMany({
        where: { id, status: { not: "CLOSED" }, assignedAgentId: current.assignedAgentId },
        data: { assignedAgentId: targetAgentId, status: "IN_PROGRESS", lastActivityAt: new Date(), warningSentAt: null },
      });
      if (updated.count !== 1) return { kind: "CONFLICT" as const };
      const assignment = await transaction.conversationAssignment.create({
        data: { conversationId: id, fromAgentId: current.assignedAgentId, toAgentId: targetAgentId, actorAgentId, action: "DELEGATE", reason: reason || null },
        include: { fromAgent: { select: { id: true, name: true } }, toAgent: { select: { id: true, name: true, department: { select: { name: true } } } }, actorAgent: { select: { id: true, name: true } } },
      });
      return { kind: "OK" as const, assignment };
    });
  }

  async respondToDelegation(id: string, assignmentId: string, agentId: string, decision: "ACCEPT" | "DECLINE") {
    return prisma.$transaction(async (transaction) => {
      const assignment = await transaction.conversationAssignment.findFirst({
        where: {
          id: assignmentId,
          conversationId: id,
          action: "DELEGATE",
          toAgentId: agentId,
        },
        include: {
          fromAgent: { select: { id: true, name: true } },
          toAgent: { select: { id: true, name: true, department: { select: { name: true } } } },
          actorAgent: { select: { id: true, name: true } },
          conversation: { select: { id: true, status: true, assignedAgentId: true, departmentId: true, department: { select: { name: true } } } },
        },
      });
      if (!assignment) return { kind: "NOT_FOUND" as const };
      if (assignment.respondedAt || assignment.response) return { kind: "ALREADY_RESPONDED" as const, assignment };
      if (assignment.conversation.status === "CLOSED") return { kind: "CLOSED" as const };

      const now = new Date();
      const accepted = decision === "ACCEPT";
      const nextStatus = accepted ? "IN_PROGRESS" : assignment.fromAgentId ? "IN_PROGRESS" : "OPEN";
      const nextAssignedAgentId = accepted ? agentId : assignment.fromAgentId;
      const responseUpdate = await transaction.conversationAssignment.updateMany({
        where: { id: assignment.id, respondedAt: null, response: null },
        data: { response: accepted ? "ACCEPTED" : "DECLINED", respondedAt: now },
      });
      if (responseUpdate.count !== 1) return { kind: "ALREADY_RESPONDED" as const, assignment };
      const updatedAssignment = await transaction.conversationAssignment.findUniqueOrThrow({
        where: { id: assignment.id },
        include: {
          fromAgent: { select: { id: true, name: true } },
          toAgent: { select: { id: true, name: true, department: { select: { name: true } } } },
          actorAgent: { select: { id: true, name: true } },
        },
      });
      const updatedConversation = await transaction.conversation.update({
        where: { id },
        data: {
          assignedAgentId: nextAssignedAgentId,
          status: nextStatus,
          queuedAt: nextStatus === "OPEN" ? now : assignment.conversation.status === "OPEN" ? now : undefined,
          lastActivityAt: now,
          warningSentAt: null,
        },
        select: { id: true, status: true, assignedAgentId: true, departmentId: true },
      });

      // Keep the acceptance visible in the internal transcript. This is an
      // audit message for attendants and is intentionally not sent to Z-API.
      const message = accepted
        ? await transaction.message.create({
            data: {
              conversationId: id,
              direction: "OUT",
              senderType: "AGENT",
              senderAgentId: agentId,
              senderNameSnapshot: assignment.toAgent.name,
              senderDepartmentSnapshot: assignment.toAgent.department?.name ?? assignment.conversation.department?.name ?? null,
              content: `Atendimento assumido por ${assignment.toAgent.name}.`,
            },
          })
        : null;

      return { kind: "OK" as const, assignment: updatedAssignment, conversation: updatedConversation, message, accepted };
    });
  }

  async recordAssignment(data: { conversationId: string; fromAgentId?: string | null; toAgentId: string; actorAgentId: string; action: string; reason?: string | null }) {
    return prisma.conversationAssignment.create({
      data: {
        conversationId: data.conversationId,
        fromAgentId: data.fromAgentId ?? null,
        toAgentId: data.toAgentId,
        actorAgentId: data.actorAgentId,
        action: data.action,
        reason: data.reason ?? null,
      },
    });
  }

  async findDepartmentById(id: string) {
    return prisma.department.findUnique({
      where: { id },
    });
  }

  async updateDepartment(id: string, departmentId: string) {
    return prisma.conversation.update({
      where: { id },
      data: { departmentId, lastActivityAt: new Date() },
    });
  }

  // ─── Inactivity Worker Methods ───────────────────────────────────────────────

  /** Returns conversations open/in-progress with no client activity for `minutes` minutes and no warning sent yet. */
  async findInactiveWithoutWarning(inactiveMinutes: number) {
    const cutoff = new Date(Date.now() - inactiveMinutes * 60 * 1000);
    return prisma.conversation.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        lastActivityAt: { lt: cutoff },
        warningSentAt: null,
      },
      include: { contact: true },
    });
  }

  /** Returns conversations where the warning was sent more than `minutes` ago and client still hasn't replied. */
  async findInactiveAfterWarning(warningMinutes: number) {
    const cutoff = new Date(Date.now() - warningMinutes * 60 * 1000);
    return prisma.conversation.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        warningSentAt: { lt: cutoff, not: null },
      },
      include: { contact: true },
    });
  }

  /** Marks a warning as sent for the given conversation. */
  async markWarningSent(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { warningSentAt: new Date() },
    });
  }

  /** Resets inactivity warning (called when client sends a new message). */
  async resetInactivityWarning(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { warningSentAt: null },
    });
  }
}

export const conversationsRepository = new ConversationsRepository();
