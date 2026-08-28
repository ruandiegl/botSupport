import { prisma } from "../../shared/prisma.js";
// The generated client lives under src/ and is loaded at runtime by the
// compiled server as well as the TypeScript test runner.
import { Prisma } from "../../../src/generated/prisma/index.js";

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export class ConversationsRepository {
  createManualConversation(contactId: string, departmentId?: string) {
    const now = new Date();
    return prisma.conversation.create({
      data: {
        contactId,
        // A manually started conversation is only a draft until the first
        // outbound message is successfully sent.  This keeps it out of the
        // operational queue and prevents any bot/queue notification from
        // reaching the customer before the attendant actually sends text.
        status: "DRAFT",
        currentStep: "MANUAL",
        departmentId: departmentId ?? null,
        lastActivityAt: now,
      },
      select: { id: true, status: true },
    });
  }

  async findMany(filters: {
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
  }) {
    const where: any = {};
    // Group monitor conversations are persisted as DRAFT so they never count
    // as an open ticket until a mention (or an agent message) promotes them.
    // They are nevertheless real conversation records and must be visible
    // whenever the queue is filtered to groups. A group filter represents the
    // continuous WhatsApp stream, not the ticket lifecycle: it must therefore
    // ignore OPEN/IN_PROGRESS/CLOSED status selection and only exclude closed
    // ticket rows (the monitor itself can remain DRAFT).
    const isGroupChannel = filters.channel === "GROUP";
    const includeGroupMonitors = isGroupChannel;
    if (!isGroupChannel && filters.status && filters.status !== "ALL") {
      // Map legacy statuses for backward compatibility
      const statusValue = filters.status;
      where.status = statusValue;
    }
    if (filters.channel && filters.channel !== "ALL") {
      if (filters.channel === "GROUP") {
        // Rows created before the unified queue may still have PRIVATE in
        // channel. The relation/JID identifies them as groups reliably.
        where.AND = [
          ...(where.AND ?? []),
          {
            OR: [
              { channel: "GROUP" },
              { groupChatId: { not: null } },
              { groupChatName: { not: null } },
              { remoteChatId: { contains: "@g.us", mode: "insensitive" } },
            ],
          },
        ];
      } else {
        where.channel = filters.channel;
      }
    }
    if (filters.departmentId && filters.departmentId !== "ALL") {
      where.departmentId = filters.departmentId;
    }

    if (filters.assignedAgentId && filters.assignedAgentId !== "ALL") {
      where.assignedAgentId = filters.assignedAgentId;
    }

    if (isGroupChannel) {
      // Keep the channel predicate already added above and append the live
      // stream constraints instead of replacing it. Replacing `AND` here
      // used to let closed ticket rows leak into the group filter.
      where.AND = [
        ...(where.AND ?? []),
        { status: { not: "CLOSED" } },
        { OR: [{ status: { not: "DRAFT" } }, { status: "DRAFT", currentStep: "GROUP_MONITOR" }] },
      ];
    } else if (filters.openOnly && !where.status) {
      where.status = { notIn: ["CLOSED", "DRAFT"] };
    } else if (!where.status) {
      // DRAFT conversations are private composer sessions, not tickets.
      where.status = { not: "DRAFT" };
    }
    if (filters.unreadOnly) {
      where.messages = { some: { direction: "IN", readAt: null } };
    }
    if (filters.labelIds?.length) {
      where.labels = { some: { labelId: { in: filters.labelIds } } };
    }

    if (filters.q?.trim()) {
      const query = filters.q.trim();
      const phoneQuery = query.replace(/\D/g, "") || query;
      where.OR = [
        { contact: { name: { contains: query, mode: "insensitive" } } },
        { contact: { email: { contains: query, mode: "insensitive" } } },
        { contact: { phone: { contains: phoneQuery } } },
        { contact: { phoneNumbers: { some: { phone: { contains: phoneQuery } } } } },
        { groupChatName: { contains: query, mode: "insensitive" } },
        { messages: { some: { content: { contains: query, mode: "insensitive" } } } },
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
      // Never expose a private composer draft. Group monitor drafts are the
      // exception: when the group channel is selected they are the canonical
      // conversation row for the always-on group history.
      const groupChannelCondition = Prisma.sql`(c."channel" = 'GROUP' OR c."group_chat_id" IS NOT NULL OR c."group_chat_name" IS NOT NULL OR c."remote_chat_id" ILIKE '%@g.us')`;
      const conditions: Prisma.Sql[] = [
        includeGroupMonitors
          ? Prisma.sql`(c."status" <> 'DRAFT' OR (c."status" = 'DRAFT' AND c."current_step" = 'GROUP_MONITOR' AND ${groupChannelCondition}))`
          : Prisma.sql`c."status" <> 'DRAFT'`,
      ];
      if (!isGroupChannel && filters.status && filters.status !== "ALL") conditions.push(Prisma.sql`c."status" = ${filters.status}`);
      if (filters.channel === "GROUP") conditions.push(groupChannelCondition);
      else if (filters.channel && filters.channel !== "ALL") conditions.push(Prisma.sql`c."channel" = ${filters.channel}`);
      if (isGroupChannel) conditions.push(Prisma.sql`c."status" <> 'CLOSED'`);
      if (filters.departmentId && filters.departmentId !== "ALL") conditions.push(Prisma.sql`c."department_id" = ${filters.departmentId}`);
      if (filters.assignedAgentId) conditions.push(Prisma.sql`c."assigned_agent_id" = ${filters.assignedAgentId}`);
      if (filters.openOnly && !isGroupChannel) conditions.push(Prisma.sql`c."status" <> 'CLOSED'`);
      if (filters.unreadOnly) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "gtf_messages" umf WHERE umf."conversation_id" = c."id" AND umf."direction" = 'IN' AND umf."read_at" IS NULL)`);
      if (filters.labelIds?.length) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "gtf_conversation_labels" clf WHERE clf."conversation_id" = c."id" AND clf."label_id" IN (${Prisma.join(filters.labelIds)}))`);
      const dateColumn = Prisma.raw(filters.dateField === "createdAt" ? 'c."started_at"' : 'c."last_activity_at"');
      if (filters.from) conditions.push(Prisma.sql`${dateColumn} >= ${new Date(filters.from)}`);
      if (filters.to) conditions.push(Prisma.sql`${dateColumn} < ${new Date(filters.to)}`);
      if (filters.q?.trim()) {
        const query = filters.q.trim();
        const escapedQuery = escapeLike(query);
        const like = `%${escapedQuery}%`;
        const digits = query.replace(/\D/g, "");
        const phoneLike = `%${escapeLike(digits || query)}%`;
        conditions.push(Prisma.sql`(
          ct."name" ILIKE ${like} ESCAPE '\\'
          OR ct."email" ILIKE ${like} ESCAPE '\\'
          OR c."group_chat_name" ILIKE ${like} ESCAPE '\\'
          OR ${digits || /\d/.test(query) ? Prisma.sql`ct."phone" LIKE ${phoneLike} OR EXISTS (SELECT 1 FROM "gtf_contact_phones" search_cp WHERE search_cp."contact_id" = ct."id" AND search_cp."phone" LIKE ${phoneLike})` : Prisma.sql`FALSE`}
          OR EXISTS (SELECT 1 FROM "gtf_messages" m WHERE m."conversation_id" = c."id" AND m."content" ILIKE ${like} ESCAPE '\\')
        )`);
      }
      const whereSql = Prisma.join(conditions, " AND ");
      // Group conversations are a continuous monitor of the WhatsApp group,
      // so their position must follow the group's latest message rather than
      // the unread counter (which changes when an agent opens the queue).
      // Keep the existing operational ordering for private conversations.
      const latestGroupActivity = Prisma.sql`COALESCE(gc."last_message_at", c."last_activity_at")`;
      const orderSql = sort === "oldest"
        ? Prisma.sql`c."started_at" ASC, c."id" ASC`
        : filters.channel === "GROUP"
        ? Prisma.sql`${latestGroupActivity} DESC, c."id" ASC`
        : sort === "recent"
        ? Prisma.sql`c."last_activity_at" DESC, c."id" ASC`
        : Prisma.sql`CASE c."status" WHEN 'OPEN' THEN 0 WHEN 'IN_PROGRESS' THEN 1 WHEN 'CLOSED' THEN 2 ELSE 9 END ASC, (SELECT COUNT(*) FROM "gtf_messages" um WHERE um."conversation_id" = c."id" AND um."direction" = 'IN' AND um."read_at" IS NULL) DESC, CASE WHEN c."status" = 'OPEN' THEN COALESCE(c."queued_at", c."started_at") END ASC NULLS LAST, c."last_activity_at" DESC, c."id" ASC`;
      const offset = (page - 1) * limit;
      const idRows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT c."id" FROM "gtf_conversations" c
        LEFT JOIN "gtf_contacts" ct ON ct."id" = c."contact_id"
        LEFT JOIN "gtf_group_chats" gc
          ON gc."id" = c."group_chat_id"
          OR gc."remote_chat_id" = c."remote_chat_id"
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
              channel: true,
              status: true,
              departmentId: true,
              assignedAgentId: true,
              queuedAt: true,
              lastActivityAt: true,
              startedAt: true,
              closedAt: true,
              currentStep: true,
              groupChatId: true,
              groupChatName: true,
              contact: { select: { name: true, phone: true, email: true, isRegistered: true, phoneNumbers: { select: { phone: true } } } },
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
      const searchMatches = filters.q?.trim() && ids.length
        ? await prisma.$queryRaw<Array<{ conversationId: string; id: string; content: string; createdAt: Date; senderNameSnapshot: string | null; rank: number }>>(Prisma.sql`
            SELECT ranked."conversationId", ranked."id", ranked."content", ranked."createdAt", ranked."senderNameSnapshot", ranked."rank"
            FROM (
              SELECT
                m."conversation_id" AS "conversationId",
                m."id",
                m."content",
                m."created_at" AS "createdAt",
                m."sender_name_snapshot" AS "senderNameSnapshot",
                ROW_NUMBER() OVER (PARTITION BY m."conversation_id" ORDER BY m."created_at" DESC, m."id" DESC) AS "rank"
              FROM "gtf_messages" m
              WHERE m."conversation_id" IN (${Prisma.join(ids)})
                AND m."content" ILIKE ${`%${escapeLike(filters.q.trim())}%`} ESCAPE '\\'
            ) ranked
            WHERE ranked."rank" <= 3
            ORDER BY ranked."conversationId", ranked."rank"
          `)
        : [];
      const matchesByConversation = new Map<string, typeof searchMatches>();
      for (const match of searchMatches) {
        const current = matchesByConversation.get(match.conversationId) ?? [];
        current.push(match);
        matchesByConversation.set(match.conversationId, current);
      }
      const items = ids.map((id) => {
        const row = byId.get(id) as (typeof rows)[number] | undefined;
        if (!row) return undefined;
        const matches = matchesByConversation.get(id) ?? [];
        return matches.length ? { ...row, __searchMatch: matches[0], __searchMatches: matches } : row;
      }).filter(Boolean) as typeof rows;
      return { items, total: Number(countRows[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(countRows[0]?.count ?? 0) / limit), isPaged: true, isSummary: true };
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
    const query = filters.q.trim();
    const like = `%${query}%`;
    const digits = query.replace(/\D/g, "");
    const isGroupScope = filters.scope === "groups";
    const conditions: Prisma.Sql[] = [
      isGroupScope
        ? Prisma.sql`(c."status" <> 'CLOSED' AND (c."status" <> 'DRAFT' OR (c."status" = 'DRAFT' AND c."current_step" = 'GROUP_MONITOR')))`
        : Prisma.sql`c."status" <> 'DRAFT'`,
    ];

    // The groups scope is a continuous stream, so ticket status is not a
    // second filter there. Closed ticket rows are excluded by the base
    // predicate while OPEN/IN_PROGRESS selections cannot hide the monitor.
    if (!isGroupScope && filters.status && filters.status !== "ALL") conditions.push(Prisma.sql`c."status" = ${filters.status}`);
    if (filters.departmentId && filters.departmentId !== "ALL") conditions.push(Prisma.sql`c."department_id" = ${filters.departmentId}`);
    if (filters.assignedAgentId) conditions.push(Prisma.sql`c."assigned_agent_id" = ${filters.assignedAgentId}`);
    if (filters.scope === "unread") conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "gtf_messages" unread_m WHERE unread_m."conversation_id" = c."id" AND unread_m."direction" = 'IN' AND unread_m."read_at" IS NULL)`);
    if (isGroupScope) conditions.push(Prisma.sql`(c."channel" = 'GROUP' OR c."group_chat_id" IS NOT NULL OR c."group_chat_name" IS NOT NULL OR c."remote_chat_id" ILIKE '%@g.us')`);
    if (filters.labelIds?.length) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "gtf_conversation_labels" search_label WHERE search_label."conversation_id" = c."id" AND search_label."label_id" IN (${Prisma.join(filters.labelIds)})`);
    const dateColumn = Prisma.raw(filters.dateField === "createdAt" ? 'c."started_at"' : 'c."last_activity_at"');
    if (filters.from) conditions.push(Prisma.sql`${dateColumn} >= ${new Date(filters.from)}`);
    if (filters.to) conditions.push(Prisma.sql`${dateColumn} < ${new Date(filters.to)}`);

    const messageMatch = Prisma.sql`EXISTS (SELECT 1 FROM "gtf_messages" search_m WHERE search_m."conversation_id" = c."id" AND search_m."content" ILIKE ${like})`;
    const phoneMatch = digits.length >= 3 ? Prisma.sql`ct."phone" LIKE ${`%${digits}%`}` : Prisma.sql`FALSE`;
    conditions.push(Prisma.sql`(ct."name" ILIKE ${like} OR c."group_chat_name" ILIKE ${like} OR ${phoneMatch} OR ${messageMatch})`);

    const whereSql = Prisma.join(conditions, " AND ");
    const relevanceSql = Prisma.sql`CASE
      WHEN ${digits.length >= 3 ? Prisma.sql`ct."phone" = ${digits}` : Prisma.sql`FALSE`} THEN 0
      WHEN lower(ct."name") = lower(${query}) THEN 1
      WHEN ct."name" ILIKE ${`${query}%`} THEN 2
      WHEN c."group_chat_name" ILIKE ${`${query}%`} THEN 3
      WHEN ${messageMatch} THEN 4
      ELSE 5
    END`;
    const orderSql = filters.sort === "oldest"
      ? Prisma.sql`c."last_activity_at" ASC, c."id" ASC`
      : filters.sort === "recent"
      ? Prisma.sql`c."last_activity_at" DESC, c."id" ASC`
      : Prisma.sql`${relevanceSql} ASC, c."last_activity_at" DESC, c."id" ASC`;
    const offset = (filters.page - 1) * filters.limit;
    const idRows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT c."id" FROM "gtf_conversations" c
      LEFT JOIN "gtf_contacts" ct ON ct."id" = c."contact_id"
      WHERE ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ${filters.limit} OFFSET ${offset}
    `);
    const countRows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count FROM "gtf_conversations" c
      LEFT JOIN "gtf_contacts" ct ON ct."id" = c."contact_id"
      WHERE ${whereSql}
    `);
    const ids = idRows.map((row) => row.id);
    if (!ids.length) {
      return { rows: [], matches: new Map<string, { id: string; content: string; createdAt: Date; senderNameSnapshot: string | null }>(), total: Number(countRows[0]?.count ?? 0), page: filters.page, limit: filters.limit, totalPages: Math.ceil(Number(countRows[0]?.count ?? 0) / filters.limit) };
    }

    const rows = await prisma.conversation.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        channel: true,
        remoteChatId: true,
        groupChatId: true,
        groupChatName: true,
        status: true,
        currentStep: true,
        departmentId: true,
        assignedAgentId: true,
        queuedAt: true,
        lastActivityAt: true,
        startedAt: true,
        closedAt: true,
        contact: { select: { id: true, name: true, phone: true, isRegistered: true } },
        department: { select: { id: true, name: true } },
        assignedAgent: { select: { id: true, name: true } },
        labels: {
          select: { label: { select: { id: true, name: true, slug: true, color: true, icon: true, isSystem: true } } },
          orderBy: { createdAt: "asc" },
        },
        messages: {
          take: 1,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          select: { id: true, content: true, createdAt: true, senderNameSnapshot: true },
        },
        _count: { select: { messages: { where: { direction: "IN", readAt: null } } } },
      },
    });
    const matchedRows = await prisma.$queryRaw<Array<{ conversationId: string; id: string; content: string; createdAt: Date; senderNameSnapshot: string | null }>>(Prisma.sql`
      SELECT DISTINCT ON (m."conversation_id") m."conversation_id" AS "conversationId", m."id", m."content", m."created_at" AS "createdAt", m."sender_name_snapshot" AS "senderNameSnapshot"
      FROM "gtf_messages" m
      WHERE m."conversation_id" IN (${Prisma.join(ids)}) AND m."content" ILIKE ${like}
      ORDER BY m."conversation_id", m."created_at" DESC, m."id" DESC
    `);
    const matches = new Map(matchedRows.map((row) => [row.conversationId, row]));
    const byId = new Map(rows.map((row) => [row.id, row]));
    return {
      rows: ids.map((id) => byId.get(id)).filter(Boolean),
      matches,
      total: Number(countRows[0]?.count ?? 0),
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(Number(countRows[0]?.count ?? 0) / filters.limit),
    };
  }

  async countOperational(scope: {
    departmentId?: string | null;
    agentId?: string | null;
    accessible?: boolean;
    channel?: "ALL" | "PRIVATE" | "GROUP";
    dateField?: "lastActivityAt" | "createdAt";
    from?: string;
    to?: string;
  }) {
    if (scope.accessible === false) {
      return { all: 0, open: 0, inProgress: 0, closed: 0, mine: 0, unread: 0 };
    }

    const baseWhere = {
      ...(scope.departmentId ? { departmentId: scope.departmentId } : {}),
      ...(scope.channel && scope.channel !== "ALL" ? { channel: scope.channel } : {}),
    };
    const dateField = scope.dateField === "createdAt" ? "startedAt" : "lastActivityAt";
    const dateWhere = scope.from || scope.to
      ? {
          [dateField]: {
            ...(scope.from ? { gte: new Date(scope.from) } : {}),
            ...(scope.to ? { lt: new Date(scope.to) } : {}),
          },
        }
      : {};
    // Drafts are intentionally excluded from every operational counter. They
    // become OPEN only after the first outbound message is sent.
    const scopedWhere = { ...baseWhere, ...dateWhere, status: { not: "DRAFT" } };
    const [byStatus, all, mine, unread] = await Promise.all([
      prisma.conversation.groupBy({ where: scopedWhere, by: ["status"], _count: { _all: true } }),
      prisma.conversation.count({ where: scopedWhere }),
      scope.agentId
        ? prisma.conversation.count({ where: { ...scopedWhere, assignedAgentId: scope.agentId, status: { notIn: ["CLOSED", "DRAFT"] } } })
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
          include: { media: true, outgoingMedia: true, contactShare: true, senderAgent: { include: { department: true } }, senderContact: true },
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
        channel: true,
        remoteChatId: true,
        status: true,
        currentStep: true,
        departmentId: true,
        assignedAgentId: true,
        contact: { select: { name: true, phone: true } },
        groupChat: { select: { id: true, remoteChatId: true, name: true } },
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
      include: { media: true, outgoingMedia: true, contactShare: true, senderAgent: { include: { department: true } }, senderContact: true },
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

  async findOutgoingMediaByClientMessageId(clientMessageId: string) {
    return prisma.outgoingMedia.findUnique({
      where: { clientMessageId },
      include: { message: true },
    });
  }

  async createOutgoingMediaPending(data: {
    conversationId: string;
    senderAgentId: string;
    senderNameSnapshot: string;
    senderDepartmentSnapshot?: string | null;
    type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    mimeType: string;
    fileName?: string | null;
    caption?: string | null;
    sizeBytes: number;
    clientMessageId: string;
    content: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          direction: "OUT",
          senderType: "AGENT",
          senderAgentId: data.senderAgentId,
          senderNameSnapshot: data.senderNameSnapshot,
          senderDepartmentSnapshot: data.senderDepartmentSnapshot ?? null,
          messageType: data.type,
          content: data.content,
        },
      });
      const outgoingMedia = await tx.outgoingMedia.create({
        data: {
          messageId: message.id,
          conversationId: data.conversationId,
          type: data.type,
          mimeType: data.mimeType,
          fileName: data.fileName ?? null,
          caption: data.caption ?? null,
          sizeBytes: data.sizeBytes,
          status: "PENDING",
          clientMessageId: data.clientMessageId,
        },
      });
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { lastActivityAt: message.createdAt },
      });
      return { message, outgoingMedia };
    });
  }

  async updateOutgoingMedia(id: string, data: {
    status: "SENDING" | "SENT" | "FAILED";
    providerMessageId?: string | null;
    failureCode?: string | null;
  }) {
    return prisma.outgoingMedia.update({
      where: { id },
      data,
      include: { message: true },
    });
  }

  async updateMessageExternalId(id: string, externalMessageId: string) {
    return prisma.message.update({ where: { id }, data: { externalMessageId } });
  }

  async updateMessageType(id: string, messageType: string) {
    return prisma.message.update({ where: { id }, data: { messageType } });
  }

  /** Promote a manual draft only after the outbound transport accepted the message. */
  async activateDraft(id: string) {
    const now = new Date();
    const result = await prisma.conversation.updateMany({
      where: { id, status: "DRAFT" },
      data: {
        status: "OPEN",
        queuedAt: now,
        lastActivityAt: now,
        currentStep: "MANUAL",
      },
    });
    return result.count > 0;
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
