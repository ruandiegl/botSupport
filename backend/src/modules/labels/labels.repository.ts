import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";

const publicSelect = {
  id: true,
  name: true,
  slug: true,
  color: true,
  icon: true,
  isSystem: true,
  createdAt: true,
  _count: { select: { conversationLabels: true } },
} satisfies Prisma.LabelSelect;

export class LabelsRepository {
  async list(q: string | undefined, page: number, limit: number) {
    const where: Prisma.LabelWhereInput = q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q.toUpperCase() } }] }
      : {};
    const [items, total] = await prisma.$transaction([
      prisma.label.findMany({ where, select: publicSelect, orderBy: [{ isSystem: "desc" }, { name: "asc" }], skip: (page - 1) * limit, take: limit }),
      prisma.label.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: string) { return prisma.label.findUnique({ where: { id }, select: publicSelect }); }
  findBySlug(slug: string) { return prisma.label.findUnique({ where: { slug }, select: publicSelect }); }
  create(data: Prisma.LabelCreateInput) { return prisma.label.create({ data, select: publicSelect }); }
  update(id: string, data: Prisma.LabelUpdateInput) { return prisma.label.update({ where: { id }, data, select: publicSelect }); }
  delete(id: string) { return prisma.label.delete({ where: { id } }); }

  getConversation(id: string) {
    return prisma.conversation.findUnique({ where: { id }, select: { id: true, status: true, departmentId: true, assignedAgentId: true } });
  }

  async assign(conversationId: string, labelId: string, addedByAgentId?: string | null) {
    return prisma.conversationLabel.upsert({
      where: { conversationId_labelId: { conversationId, labelId } },
      create: { conversationId, labelId, addedByAgentId: addedByAgentId ?? null },
      update: {},
      include: { label: { select: { id: true, name: true, slug: true, color: true, icon: true, isSystem: true } } },
    });
  }

  remove(conversationId: string, labelId: string) {
    return prisma.conversationLabel.deleteMany({ where: { conversationId, labelId } });
  }

  listConversationLabels(conversationId: string) {
    return prisma.conversationLabel.findMany({
      where: { conversationId },
      include: { label: { select: { id: true, name: true, slug: true, color: true, icon: true, isSystem: true } } },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const labelsRepository = new LabelsRepository();
