import { Prisma, ShortcutScope, ShortcutType } from "../../generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";

const shortcutInclude = {
  department: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  audits: { where: { action: "USE" }, select: { id: true, createdAt: true }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.ShortcutInclude;

export interface ShortcutFilters {
  q?: string;
  type?: ShortcutType;
  scope?: ShortcutScope;
  departmentId?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export class ShortcutsRepository {
  async list(where: Prisma.ShortcutWhereInput, filters: ShortcutFilters) {
    const filteredWhere: Prisma.ShortcutWhereInput = {
      AND: [
        where,
        ...(filters.q ? [{ OR: [
          { title: { contains: filters.q, mode: "insensitive" as const } },
          { message: { contains: filters.q, mode: "insensitive" as const } },
        ] }] : []),
      ],
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.scope ? { scope: filters.scope } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.active !== undefined ? { isActive: filters.active } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.shortcut.findMany({
        where: filteredWhere,
        include: shortcutInclude,
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.shortcut.count({ where: filteredWhere }),
    ]);
    return { items, total };
  }

  findById(id: string) {
    return prisma.shortcut.findUnique({ where: { id }, include: shortcutInclude });
  }

  create(data: Prisma.ShortcutUncheckedCreateInput) {
    return prisma.shortcut.create({ data, include: shortcutInclude });
  }

  update(id: string, data: Prisma.ShortcutUncheckedUpdateInput) {
    return prisma.shortcut.update({ where: { id }, data, include: shortcutInclude });
  }

  getConversation(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      select: { id: true, departmentId: true, assignedAgentId: true, status: true },
    });
  }

  audit(shortcutId: string, actorId: string, action: string, metadata?: Prisma.InputJsonValue) {
    return prisma.shortcutAudit.create({ data: { shortcutId, actorId, action, metadata } });
  }
}

export const shortcutsRepository = new ShortcutsRepository();
