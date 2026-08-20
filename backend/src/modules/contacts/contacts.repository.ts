import { prisma } from "../../shared/prisma.js";

export type ContactAccessScope = {
  role?: string;
  id?: string;
  departmentId?: string | null;
};

function contactWhere(scope?: ContactAccessScope) {
  if (!scope || scope.role !== "AGENT") return {};

  const conversationScope = [
    ...(scope.id ? [{ assignedAgentId: scope.id }] : []),
    ...(scope.departmentId ? [{ departmentId: scope.departmentId }] : []),
  ];

  return conversationScope.length > 0
    ? { conversations: { some: { OR: conversationScope } } }
    : { conversations: { some: { assignedAgentId: "__agent_without_department__" } } };
}

export class ContactsRepository {
  async list(filters: { q?: string; page: number; limit: number }, scope?: ContactAccessScope) {
    const query = filters.q
      ? { OR: [
          { name: { contains: filters.q, mode: "insensitive" as const } },
          { phone: { contains: filters.q } },
          { phoneNumbers: { some: { phone: { contains: filters.q } } } },
        ] }
      : {};
    const where = { ...query, ...contactWhere(scope) };
    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: { phoneNumbers: { orderBy: [{ isPrimary: "desc" }, { phone: "asc" }] } },
      }),
      prisma.contact.count({ where }),
    ]);
    return { items, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  findById(id: string, scope?: ContactAccessScope) {
    return prisma.contact.findFirst({
      where: { id, ...contactWhere(scope) },
      include: { phoneNumbers: { orderBy: [{ isPrimary: "desc" }, { phone: "asc" }] } },
    });
  }

  findByPhone(phone: string) {
    return prisma.contact.findFirst({
      where: { OR: [{ phone }, { phoneNumbers: { some: { phone } } }] },
      include: { phoneNumbers: { orderBy: [{ isPrimary: "desc" }, { phone: "asc" }] } },
    });
  }

  findShareById(id: string, scope?: ContactAccessScope) {
    return prisma.contactShare.findFirst({
      where: { id, message: { conversation: conversationWhere(scope) } },
      select: { id: true, canonicalContactId: true, phones: true },
    });
  }

  create(data: { name: string; phones: Array<{ phone: string; label?: string | null; isPrimary?: boolean }>; email?: string | null; organization?: string | null; notes?: string | null }) {
    const primary = data.phones.find((item) => item.isPrimary) ?? data.phones[0];
    return prisma.contact.create({
      data: {
        phone: primary.phone,
        name: data.name,
        email: data.email ?? null,
        organization: data.organization ?? null,
        notes: data.notes ?? null,
        phoneNumbers: { create: data.phones.map((item) => ({ phone: item.phone, label: item.label ?? null, isPrimary: item.phone === primary.phone })) },
      },
      include: { phoneNumbers: { orderBy: [{ isPrimary: "desc" }, { phone: "asc" }] } },
    });
  }

  async createWithShare(
    data: { name: string; phones: Array<{ phone: string; label?: string | null; isPrimary?: boolean }>; email?: string | null; organization?: string | null; notes?: string | null },
    shareId: string,
    primaryPhone: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.contactShare.updateMany({
        where: { id: shareId, canonicalContactId: null },
        data: { primaryPhone },
      });
      if (claimed.count !== 1) {
        const error = new Error("CONTACT_SHARE_ALREADY_LINKED");
        (error as Error & { code?: string }).code = "CONTACT_SHARE_ALREADY_LINKED";
        throw error;
      }

      const primary = data.phones.find((item) => item.isPrimary) ?? data.phones[0];
      const contact = await tx.contact.create({
        data: {
          phone: primary.phone,
          name: data.name,
          email: data.email ?? null,
          organization: data.organization ?? null,
          notes: data.notes ?? null,
          phoneNumbers: { create: data.phones.map((item) => ({ phone: item.phone, label: item.label ?? null, isPrimary: item.phone === primary.phone })) },
        },
      });
      await tx.contactShare.update({ where: { id: shareId }, data: { canonicalContactId: contact.id } });
      return tx.contact.findUnique({
        where: { id: contact.id },
        include: { phoneNumbers: { orderBy: [{ isPrimary: "desc" }, { phone: "asc" }] } },
      });
    });
  }

  async update(id: string, data: { name?: string; phones?: Array<{ phone: string; label?: string | null; isPrimary?: boolean }>; email?: string | null; organization?: string | null; notes?: string | null }) {
    return prisma.$transaction(async (tx) => {
      const phoneData = data.phones;
      const primary = phoneData ? (phoneData.find((item) => item.isPrimary) ?? phoneData[0]) : null;
      const contact = await tx.contact.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.organization !== undefined ? { organization: data.organization } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(primary ? { phone: primary.phone } : {}),
        },
      });
      if (phoneData) {
        await tx.contactPhone.deleteMany({ where: { contactId: id } });
        await tx.contactPhone.createMany({ data: phoneData.map((item) => ({ contactId: id, phone: item.phone, label: item.label ?? null, isPrimary: item.phone === primary!.phone })) });
      }
      return tx.contact.findUnique({ where: { id: contact.id }, include: { phoneNumbers: { orderBy: [{ isPrimary: "desc" }, { phone: "asc" }] } } });
    });
  }

  async linkShare(shareId: string, contactId: string, primaryPhone: string) {
    return prisma.contactShare.update({ where: { id: shareId }, data: { canonicalContactId: contactId, primaryPhone } });
  }

  async listConversations(contactId: string, filters: { openOnly: boolean; page: number; limit: number }, scope?: ContactAccessScope) {
    const where = { contactId, ...(filters.openOnly ? { status: { not: "CLOSED" } } : {}), ...conversationWhere(scope) };
    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: [{ lastActivityAt: "desc" }, { id: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        select: {
          id: true, status: true, departmentId: true, assignedAgentId: true, startedAt: true, lastActivityAt: true,
          department: { select: { name: true } }, assignedAgent: { select: { name: true } },
          _count: { select: { messages: { where: { direction: "IN", readAt: null } } } },
        },
      }),
      prisma.conversation.count({ where }),
    ]);
    return { items, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  findActiveConversation(contactId: string, phone?: string) {
    return prisma.conversation.findFirst({
      where: {
        status: { not: "CLOSED" },
        OR: [
          { contactId },
          ...(phone ? [{ contact: { OR: [{ phone }, { phoneNumbers: { some: { phone } } }] } }] : []),
        ],
      },
      orderBy: [{ lastActivityAt: "desc" }, { id: "asc" }],
      select: { id: true, status: true, contactId: true, departmentId: true },
    });
  }
}

function conversationWhere(scope?: ContactAccessScope) {
  if (!scope || scope.role !== "AGENT") return {};
  const or = [
    ...(scope.id ? [{ assignedAgentId: scope.id }] : []),
    ...(scope.departmentId ? [{ departmentId: scope.departmentId }] : []),
  ];
  return or.length > 0 ? { OR: or } : { assignedAgentId: "__agent_without_department__" };
}

export const contactsRepository = new ContactsRepository();
