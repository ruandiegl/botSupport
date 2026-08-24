import type { FlowNode, FlowTransition } from "../../generated/prisma/index.js";
import { logger } from "../../shared/logger.js";
import { flowExecutionRepository } from "./flow-execution.repository.js";
import type { ExecuteFlowInput, FlowExecutionAction } from "./flow-execution.schemas.js";

type RuntimeRevision = NonNullable<Awaited<ReturnType<typeof flowExecutionRepository.getRevision>>>;
function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().toLowerCase(); }
function nextTransition(revision: RuntimeRevision, nodeId: string) { return revision.transitions.filter((item) => item.fromNodeId === nodeId).sort((a, b) => a.sortOrder - b.sortOrder)[0]; }
function contextRecord(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function findDecisionChoice(revision: RuntimeRevision, node: FlowNode, content: string, selectedOptionId?: string) {
  const outgoing = revision.transitions.filter((item) => item.fromNodeId === node.id && item.optionKey).sort((a, b) => a.sortOrder - b.sortOrder);
  return outgoing.find((item, index) => (
    item.optionKey === selectedOptionId ||
    String(index + 1) === selectedOptionId ||
    normalize(item.label ?? "") === normalize(content)
  ));
}

export class FlowExecutionService {
  async inspectInput(conversationId: string, content: string, selectedOptionId?: string) {
    const conversation = await flowExecutionRepository.getConversation(conversationId);
    if (!conversation) return { nodeType: null, isDecisionSelection: false };
    const revision = conversation.flowRevisionId
      ? await flowExecutionRepository.getRevision(conversation.flowRevisionId)
      : await flowExecutionRepository.getPublishedRevision();
    if (!revision) return { nodeType: null, isDecisionSelection: false };
    const node = conversation.currentFlowNodeId
      ? revision.nodes.find((item) => item.id === conversation.currentFlowNodeId)
      : revision.nodes.find((item) => item.type === "ENTRY");
    if (!node) return { nodeType: null, isDecisionSelection: false };
    return {
      nodeType: node.type,
      isDecisionSelection: node.type === "DECISION" && Boolean(findDecisionChoice(revision, node, content, selectedOptionId)),
    };
  }

  async rollbackDelivery(conversationId: string, nodeId: string | null, context: unknown) {
    await flowExecutionRepository.updateState(conversationId, nodeId, contextRecord(context));
    logger.warn({ conversationId, nodeId }, "Estado do fluxo restaurado após falha de entrega");
  }
  async rememberDecisionPrompt(conversationId: string, nodeId: string, referenceMessageId: string) {
    await flowExecutionRepository.mergeContext(conversationId, { lastPromptNodeId: nodeId, lastPromptMessageId: referenceMessageId });
  }
  async execute(input: ExecuteFlowInput): Promise<{ status: string; actions: FlowExecutionAction[] }> {
    let conversation = await flowExecutionRepository.getConversation(input.conversationId);
    if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");
    let revision = conversation.flowRevisionId ? await flowExecutionRepository.getRevision(conversation.flowRevisionId) : await flowExecutionRepository.getPublishedRevision();
    if (!revision) return { status: "no_flow_configured", actions: [] };
    let node = conversation.currentFlowNodeId ? revision.nodes.find((item) => item.id === conversation!.currentFlowNodeId) : revision.nodes.find((item) => item.type === "ENTRY");
    if (!node) throw new Error("FLOW_NODE_NOT_FOUND");
    if (!conversation.flowRevisionId) { await flowExecutionRepository.bindConversation(conversation.id, revision.id, node.id); conversation = await flowExecutionRepository.getConversation(conversation.id); }
    const context = contextRecord(conversation?.flowContext);
    const actions: FlowExecutionAction[] = [];

    if (!input.isNewConversation && node.type === "DECISION") {
      const expectedReference = typeof context.lastPromptMessageId === "string" ? context.lastPromptMessageId : undefined;
      if (input.referenceMessageId && expectedReference && input.referenceMessageId !== expectedReference) {
        logger.warn({ conversationId: conversation!.id, flowNodeId: node.id }, "Resposta interativa pertence a outro prompt do fluxo");
        return this.waitAtDecision(revision, node, conversation!.id);
      }
      const chosen = findDecisionChoice(revision, node, input.content, input.selectedOptionId);
      if (!chosen) return this.waitAtDecision(revision, node, conversation!.id);
      const nodeConfig = contextRecord(node.config);
      const selections = contextRecord(context.decisionSelections);
      context.decisionSelections = { ...selections, [node.stableKey]: { optionKey: chosen.optionKey, label: chosen.label } };
      if (nodeConfig.decisionScope === "ROUTE" || typeof nodeConfig.parentRouteId === "string") {
        context.selectedIssueKey = chosen.optionKey;
        context.selectedIssueLabel = chosen.label;
      } else {
        context.selectedOptionKey = chosen.optionKey;
        context.teamName = chosen.label;
      }
      context.lastPromptMessageId = null;
      context.lastPromptNodeId = null;
      node = revision.nodes.find((item) => item.id === chosen.toNodeId);
      if (!node) throw new Error("FLOW_NODE_NOT_FOUND");
    } else if (!input.isNewConversation && node.type === "TRIAGE") {
      const config = contextRecord(node.config); const responseKey = typeof config.responseKey === "string" ? config.responseKey : node.stableKey;
      context[responseKey] = input.content;
      const edge = nextTransition(revision, node.id); node = edge ? revision.nodes.find((item) => item.id === edge.toNodeId) : undefined;
      if (!node) throw new Error("FLOW_NODE_NOT_FOUND");
    }

    for (let guard = 0; guard < 100; guard += 1) {
      if (node.type === "ENTRY" || node.type === "ROUTE") {
        if (node.type === "ROUTE") { context.teamName = node.name; if (node.departmentId) context.departmentId = node.departmentId; }
        const edge = nextTransition(revision, node.id); node = edge ? revision.nodes.find((item) => item.id === edge.toNodeId) : undefined; if (!node) throw new Error("FLOW_NODE_NOT_FOUND"); continue;
      }
      if (node.type === "MESSAGE") { if (node.content.trim()) actions.push({ type: "SEND_TEXT", content: node.content }); const edge = nextTransition(revision, node.id); node = edge ? revision.nodes.find((item) => item.id === edge.toNodeId) : undefined; if (!node) throw new Error("FLOW_NODE_NOT_FOUND"); continue; }
      if (node.type === "DECISION") { await flowExecutionRepository.updateState(conversation!.id, node.id, context); const result = this.decisionAction(revision, node); actions.push(result); await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "WAITING_DECISION" }); return { status: "waiting_decision", actions }; }
      if (node.type === "TRIAGE") { await flowExecutionRepository.updateState(conversation!.id, node.id, context); actions.push({ type: "SEND_TEXT", content: node.content }); await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "WAITING_TRIAGE" }); return { status: "waiting_triage", actions }; }
      if (node.type === "HANDOFF") { const departmentId = node.departmentId ?? (typeof context.departmentId === "string" ? context.departmentId : ""); if (!departmentId) throw new Error("HANDOFF_WITHOUT_DEPARTMENT"); await flowExecutionRepository.handoff(conversation!.id, departmentId, context); actions.push({ type: "HANDOFF", departmentId }); await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "HANDOFF" }); return { status: "routed_to_department", actions }; }
      if (node.type === "END") { await flowExecutionRepository.updateState(conversation!.id, null, context); return { status: "flow_ended", actions }; }
    }
    logger.error({ conversationId: input.conversationId }, "Limite de passos do fluxo excedido"); throw new Error("FLOW_STEP_LIMIT");
  }
  private decisionAction(revision: RuntimeRevision, node: FlowNode): FlowExecutionAction {
    const config = contextRecord(node.config);
    const configuredOptions = Array.isArray(config.decisionOptions) ? config.decisionOptions : [];
    const descriptionByKey = new Map(configuredOptions.flatMap((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return [];
      const option = value as Record<string, unknown>;
      const description = typeof option.description === "string" ? option.description.trim() : "";
      return typeof option.optionKey === "string" && description
        ? [[option.optionKey, description] as const]
        : [];
    }));
    return {
      type: "SEND_OPTIONS",
      nodeId: node.id,
      content: typeof config.buttonMessage === "string" ? config.buttonMessage : node.content,
      options: revision.transitions
        .filter((item) => item.fromNodeId === node.id && item.optionKey)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => {
          const target = revision.nodes.find((nodeItem) => nodeItem.id === item.toNodeId);
          const description = descriptionByKey.get(item.optionKey!);
          return {
            optionKey: item.optionKey!,
            label: item.label ?? target?.name ?? "Opção",
            ...(description ? { description } : {}),
            departmentId: target?.departmentId ?? "",
          };
        }),
    };
  }
  private async waitAtDecision(revision: RuntimeRevision, node: FlowNode, conversationId: string) { await flowExecutionRepository.updateState(conversationId, node.id); return { status: "invalid_option", actions: [this.decisionAction(revision, node)] as FlowExecutionAction[] }; }
}
export const flowExecutionService = new FlowExecutionService();
