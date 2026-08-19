import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";

const select = {
  id: true,
  phone: true,
  label: true,
  reason: true,
  isActive: true,
  disabledAt: true,
  createdAt: true,
  updatedAt: true,
  createdByAgentId: true,
} satisfies Prisma.BotExclusionSelect;

export class BotExclusionsRepository {
  async list(q: string | undefined, activeOnly: boolean, page: number, limit: number) {
    const where: Prisma.BotExclusionWhereInput = {
      ...(activeOnly ? { isActive: true } : {}),
      ...(q ? { OR: [{ phone: { contains: q.replace(/\D/g, "") } }, { label: { contains: q, mode: "insensitive" } }, { reason: { contains: q, mode: "insensitive" } }] } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.botExclusion.findMany({ where, select, orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }], skip: (page - 1) * limit, take: limit }),
      prisma.botExclusion.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: string) { return prisma.botExclusion.findUnique({ where: { id }, select }); }
  findByPhone(phone: string) { return prisma.botExclusion.findUnique({ where: { phone }, select }); }
  findActiveByPhone(phones: string[]) { return prisma.botExclusion.findFirst({ where: { phone: { in: phones }, isActive: true }, select: { id: true, phone: true, isActive: true } }); }
  findByPhones(phones: string[]) { return prisma.botExclusion.findFirst({ where: { phone: { in: phones } }, select }); }

  create(data: Prisma.BotExclusionUncheckedCreateInput) { return prisma.botExclusion.create({ data, select }); }
  update(id: string, data: Prisma.BotExclusionUncheckedUpdateInput) { return prisma.botExclusion.update({ where: { id }, data, select }); }
}

export const botExclusionsRepository = new BotExclusionsRepository();
