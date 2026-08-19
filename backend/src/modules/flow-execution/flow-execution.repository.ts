import { Prisma } from "../../../src/generated/prisma/index.js";
import { prisma } from "../../shared/prisma.js";

const revisionInclude = { nodes: { orderBy: { sortOrder: "asc" as const } }, transitions: { orderBy: { sortOrder: "asc" as const } } };
export class FlowExecutionRepository {
  getConversation(id: string) { return prisma.conversation.findUnique({ where: { id } }); }
  getPublishedRevision() { return prisma.flowRevision.findFirst({ where: { status: "PUBLISHED" }, include: revisionInclude, orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }] }); }
  getRevision(id: string) { return prisma.flowRevision.findUnique({ where: { id }, include: revisionInclude }); }
  bindConversation(conversationId: string, revisionId: string, nodeId: string) { return prisma.conversation.update({ where: { id: conversationId }, data: { flowRevisionId: revisionId, currentFlowNodeId: nodeId, currentStep: "FLOW_V2" } }); }
  updateState(conversationId: string, nodeId: string | null, context?: Record<string, unknown>) { return prisma.conversation.update({ where: { id: conversationId }, data: { currentFlowNodeId: nodeId, ...(context ? { flowContext: context as Prisma.InputJsonValue } : {}) } }); }
  async mergeContext(conversationId: string, values: Record<string, unknown>) { const conversation = await this.getConversation(conversationId); const current = conversation?.flowContext && typeof conversation.flowContext === "object" && !Array.isArray(conversation.flowContext) ? conversation.flowContext as Record<string, unknown> : {}; return this.updateState(conversationId, conversation?.currentFlowNodeId ?? null, { ...current, ...values }); }
  handoff(conversationId: string, departmentId: string, context: Record<string, unknown>) { const now = new Date(); return prisma.conversation.update({ where: { id: conversationId }, data: { status: "OPEN", departmentId, queuedAt: now, lastActivityAt: now, currentFlowNodeId: null, currentStep: "QUEUED", flowContext: context as Prisma.InputJsonValue } }); }
  recordEvent(data: { conversationId: string; flowRevisionId: string; flowNodeId?: string | null; externalEventId?: string; type: string; metadata?: Record<string, unknown> }) { return prisma.flowExecutionEvent.create({ data: { ...data, metadata: data.metadata as Prisma.InputJsonValue | undefined } }); }
}
export const flowExecutionRepository = new FlowExecutionRepository();
