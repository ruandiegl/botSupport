import { Prisma } from "../../../src/generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";
import type { SaveDraftBody, UpdateFlowBody } from "./flow.schemas.js";

const documentInclude = { nodes: { orderBy: { sortOrder: "asc" as const } }, transitions: { orderBy: { sortOrder: "asc" as const } } };

export class FlowRepository {
  findLatestLegacy() { return prisma.flowDefinition.findFirst({ orderBy: { updatedAt: "desc" } }); }
  async upsertLegacy(data: UpdateFlowBody) {
    const current = await this.findLatestLegacy();
    const options = data.options as Prisma.InputJsonValue;
    return current
      ? prisma.flowDefinition.update({ where: { id: current.id }, data: { ...data, options } })
      : prisma.flowDefinition.create({ data: { ...data, options } });
  }
  findPublished() { return prisma.flowRevision.findFirst({ where: { status: "PUBLISHED" }, include: documentInclude, orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }] }); }
  findDraft() { return prisma.flowRevision.findFirst({ where: { status: "DRAFT" }, include: documentInclude, orderBy: { updatedAt: "desc" } }); }
  findRevision(id: string) { return prisma.flowRevision.findUnique({ where: { id }, include: documentInclude }); }
  listRevisions() { return prisma.flowRevision.findMany({ include: documentInclude, orderBy: [{ version: "desc" }, { updatedAt: "desc" }] }); }
  findDepartments(ids: string[]) { return prisma.department.findMany({ where: { id: { in: ids } }, select: { id: true } }); }
  async createDraftFrom(revisionId?: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.flowRevision.findFirst({ where: { status: "DRAFT" }, include: documentInclude });
      if (existing) return existing;
      const source = revisionId
        ? await tx.flowRevision.findUnique({ where: { id: revisionId }, include: documentInclude })
        : await tx.flowRevision.findFirst({ where: { status: "PUBLISHED" }, include: documentInclude, orderBy: { version: "desc" } });
      if (!source) throw new Error("FLOW_NOT_FOUND");
      const max = await tx.flowRevision.aggregate({ where: { flowDefinitionId: source.flowDefinitionId }, _max: { version: true } });
      const draft = await tx.flowRevision.create({ data: { flowDefinitionId: source.flowDefinitionId, version: (max._max.version ?? 0) + 1, status: "DRAFT", schemaVersion: 2 } });
      const idMap = new Map<string, string>();
      for (const node of source.nodes) {
        const created = await tx.flowNode.create({ data: { flowRevisionId: draft.id, stableKey: node.stableKey, type: node.type, name: node.name, content: node.content, sortOrder: node.sortOrder, config: node.config === null ? Prisma.JsonNull : node.config as Prisma.InputJsonValue, departmentId: node.departmentId } });
        idMap.set(node.id, created.id);
      }
      await tx.flowTransition.createMany({ data: source.transitions.map((item) => ({ flowRevisionId: draft.id, fromNodeId: idMap.get(item.fromNodeId)!, toNodeId: idMap.get(item.toNodeId)!, optionKey: item.optionKey, label: item.label, sortOrder: item.sortOrder })) });
      return tx.flowRevision.findUniqueOrThrow({ where: { id: draft.id }, include: documentInclude });
    });
  }
  async createDraftFromLegacy() {
    const legacy = await this.findLatestLegacy();
    if (!legacy) throw new Error("FLOW_NOT_FOUND");
    const max = await prisma.flowRevision.aggregate({ where: { flowDefinitionId: legacy.id }, _max: { version: true } });
    const revision = await prisma.flowRevision.create({ data: { flowDefinitionId: legacy.id, version: (max._max.version ?? 0) + 1, status: "DRAFT", schemaVersion: 2 } });
    return { revision, legacy };
  }
  async saveDraft(id: string, data: SaveDraftBody) {
    return prisma.$transaction(async (tx) => {
      const draft = await tx.flowRevision.findUnique({ where: { id } });
      if (!draft || draft.status !== "DRAFT") throw new Error("DRAFT_NOT_FOUND");
      if (draft.revision !== data.revision) throw new Error("REVISION_CONFLICT");
      await tx.flowTransition.deleteMany({ where: { flowRevisionId: id } });
      await tx.flowNode.deleteMany({ where: { flowRevisionId: id } });
      await tx.flowNode.createMany({ data: data.nodes.map((node) => ({ ...node, flowRevisionId: id, config: node.config === null || node.config === undefined ? Prisma.JsonNull : node.config as Prisma.InputJsonValue })) });
      await tx.flowTransition.createMany({ data: data.transitions.map((transition) => ({ ...transition, flowRevisionId: id })) });
      await tx.flowRevision.update({ where: { id }, data: { revision: { increment: 1 } } });
      return tx.flowRevision.findUniqueOrThrow({ where: { id }, include: documentInclude });
    });
  }
  async publish(id: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const draft = await tx.flowRevision.findUnique({ where: { id } });
      if (!draft || draft.status !== "DRAFT") throw new Error("DRAFT_NOT_FOUND");
      await tx.flowRevision.updateMany({ where: { flowDefinitionId: draft.flowDefinitionId, status: "PUBLISHED" }, data: { status: "ARCHIVED" } });
      return tx.flowRevision.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date(), publishedById: actorId }, include: documentInclude });
    });
  }
}
export const flowRepository = new FlowRepository();
