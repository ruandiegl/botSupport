import type { FlowNode, FlowTransition } from "../../generated/prisma/index.js";
import { logger } from "../../shared/logger.js";
import { flowExecutionRepository } from "./flow-execution.repository.js";
import type { ExecuteFlowInput, FlowExecutionAction } from "./flow-execution.schemas.js";

type RuntimeRevision = NonNullable<Awaited<ReturnType<typeof flowExecutionRepository.getRevision>>>;
type RuntimeConversation = NonNullable<Awaited<ReturnType<typeof flowExecutionRepository.getConversation>>>;
type RuntimeContact = RuntimeConversation["contact"];
type DecisionOption = { optionKey: string; label: string; description?: string };
type DecisionGroup = { categoryKey: string; label: string; description?: string; items: DecisionOption[] };
type GroupedDecisionOption = DecisionOption & { categoryKey: string; categoryLabel: string };

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().toLowerCase(); }
function nextTransition(revision: RuntimeRevision, nodeId: string) { return revision.transitions.filter((item) => item.fromNodeId === nodeId).sort((a, b) => a.sortOrder - b.sortOrder)[0]; }
function contextRecord(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function featureEnabled(name: string) { return String(process.env[name] ?? "true").trim().toLowerCase() !== "false"; }
function configuredDecisionGroups(node: FlowNode): DecisionGroup[] {
  const config = contextRecord(node.config);
  if (config.decisionMode !== "CATEGORIES" || !Array.isArray(config.decisionGroups)) return [];
  return config.decisionGroups.flatMap((value) => {
    const group = contextRecord(value);
    if (typeof group.categoryKey !== "string" || typeof group.label !== "string" || !Array.isArray(group.items)) return [];
    const items = group.items.flatMap((itemValue) => {
      const item = contextRecord(itemValue);
      if (typeof item.optionKey !== "string" || typeof item.label !== "string") return [];
      const description = typeof item.description === "string" && item.description.trim() ? item.description.trim() : undefined;
      return [{ optionKey: item.optionKey, label: item.label, ...(description ? { description } : {}) }];
    });
    const description = typeof group.description === "string" && group.description.trim() ? group.description.trim() : undefined;
    return [{ categoryKey: group.categoryKey, label: group.label, ...(description ? { description } : {}), items }];
  });
}
function flattenedDecisionOptions(groups: DecisionGroup[]): GroupedDecisionOption[] {
  return groups.flatMap((group) => group.items.map((item) => ({
    ...item,
    categoryKey: group.categoryKey,
    categoryLabel: group.label,
  })));
}
function findConfiguredChoice(options: DecisionOption[], content: string, selectedOptionId?: string) {
  return options.find((item, index) => item.optionKey === selectedOptionId || String(index + 1) === selectedOptionId || normalize(item.label) === normalize(content));
}
function contactSummaryConfig(node: FlowNode) {
  const raw = contextRecord(contextRecord(node.config).knownContactSummary);
  return {
    enabled: raw.enabled === true,
    template: typeof raw.template === "string" && raw.template.trim()
      ? raw.template
      : "Olá, {contactName}. Seja bem-vindo(a)! 👋\n\nEncontramos o seu cadastro:\n👤 Nome: {contactName}\n{stationLine}\n{locationLine}\n\nSeus dados estão certos?",
    confirmLabel: typeof raw.confirmLabel === "string" && raw.confirmLabel.trim() ? raw.confirmLabel.trim() : "Sim, estão certos",
    updateLabel: typeof raw.updateLabel === "string" && raw.updateLabel.trim() ? raw.updateLabel.trim() : "Atualizar meus dados",
    updateIntro: typeof raw.updateIntro === "string" && raw.updateIntro.trim() ? raw.updateIntro.trim() : "Vamos atualizar seu cadastro. Informe seu nome completo.",
  };
}
function renderContactSummary(template: string, contact: RuntimeContact) {
  if (!contact) return "";
  const station = String(contact.station ?? contact.organization ?? "").trim();
  const city = String(contact.city ?? "").trim();
  const state = String(contact.state ?? "").trim().toUpperCase();
  const location = [city, state].filter(Boolean).join("/");
  return template
    .replaceAll("{contactName}", contact.name)
    .replaceAll("{station}", station)
    .replaceAll("{city}", city)
    .replaceAll("{state}", state)
    .replaceAll("{stationLine}", station ? `📻 Emissora: ${station}` : "")
    .replaceAll("{locationLine}", location ? `📍 Cidade/UF: ${location}` : "")
    .split("\n")
    .filter((line, index, lines) => line.trim() || (index > 0 && lines[index - 1]?.trim()))
    .join("\n")
    .trim();
}
function parseLocation(value: string) {
  const match = value.trim().match(/^(.+?)\s*[/,-]\s*([A-Za-z]{2})$/);
  return match ? { city: match[1].trim(), state: match[2].toUpperCase() } : null;
}
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
    const context = contextRecord(conversation.flowContext);
    if (typeof context.contactProfileUpdateStep === "string") {
      return { nodeType: "TRIAGE", isDecisionSelection: true };
    }
    if (context.contactConfirmationPending === true) {
      const entry = revision.nodes.find((item) => item.type === "ENTRY") ?? node;
      const config = contactSummaryConfig(entry);
      const options = [
        { optionKey: "contact-profile-confirm", label: config.confirmLabel },
        { optionKey: "contact-profile-update", label: config.updateLabel },
      ];
      return { nodeType: "DECISION", isDecisionSelection: Boolean(findConfiguredChoice(options, content, selectedOptionId)) };
    }
    if (node.type === "DECISION") {
      const groups = configuredDecisionGroups(node);
      const pendingCategoryKey = context.pendingCategoryNodeId === node.id && typeof context.pendingCategoryKey === "string" ? context.pendingCategoryKey : undefined;
      if (groups.length && pendingCategoryKey) {
        const group = groups.find((item) => item.categoryKey === pendingCategoryKey);
        return { nodeType: node.type, isDecisionSelection: Boolean(group && findConfiguredChoice(group.items, content, selectedOptionId)) };
      }
      if (groups.length) {
        // A category menu is delivered as one list. The category remains
        // attached to every item so the choice can continue through the
        // category transition without an intermediate category prompt.
        return { nodeType: node.type, isDecisionSelection: Boolean(findConfiguredChoice(flattenedDecisionOptions(groups), content, selectedOptionId)) };
      }
    }
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
    const entryNode = revision.nodes.find((item) => item.type === "ENTRY");

    if (!input.isNewConversation && typeof context.contactProfileUpdateStep === "string") {
      const value = input.content.trim();
      if (!value) return { status: "waiting_contact_update", actions: [{ type: "SEND_TEXT", content: "Envie uma informação válida para continuar a atualização." }] };
      if (context.contactProfileUpdateStep === "NAME") {
        context.contactProfileDraft = { ...contextRecord(context.contactProfileDraft), name: value.slice(0, 300) };
        context.contactProfileUpdateStep = "STATION";
        await flowExecutionRepository.updateState(conversation!.id, node.id, context);
        return { status: "waiting_contact_update", actions: [{ type: "SEND_TEXT", content: "Agora informe sua emissora ou organização." }] };
      }
      if (context.contactProfileUpdateStep === "STATION") {
        context.contactProfileDraft = { ...contextRecord(context.contactProfileDraft), station: value.slice(0, 300) };
        context.contactProfileUpdateStep = "LOCATION";
        await flowExecutionRepository.updateState(conversation!.id, node.id, context);
        return { status: "waiting_contact_update", actions: [{ type: "SEND_TEXT", content: "Por último, informe sua cidade e UF no formato Cidade/UF. Ex.: Volta Redonda/RJ." }] };
      }
      const location = parseLocation(value);
      if (!location) {
        return { status: "waiting_contact_update", actions: [{ type: "SEND_TEXT", content: "Não consegui identificar a cidade e a UF. Envie no formato Cidade/UF, por exemplo: Volta Redonda/RJ." }] };
      }
      const draft = contextRecord(context.contactProfileDraft);
      const name = typeof draft.name === "string" ? draft.name : conversation!.contact.name;
      const station = typeof draft.station === "string" ? draft.station : String(conversation!.contact.station ?? conversation!.contact.organization ?? "");
      await flowExecutionRepository.updateContactProfile(conversation!.contactId, { name, station, ...location });
      delete context.contactProfileUpdateStep;
      delete context.contactProfileDraft;
      context.contactSummaryAcceptedAt = new Date().toISOString();
      context.contactSummaryUpdated = true;
      actions.push({ type: "SEND_TEXT", content: "Cadastro atualizado. Obrigado por confirmar seus dados." });
      if (!entryNode) throw new Error("FLOW_NODE_NOT_FOUND");
      node = entryNode;
    }

    if (!input.isNewConversation && context.contactConfirmationPending === true) {
      if (!entryNode) throw new Error("FLOW_NODE_NOT_FOUND");
      const expectedReference = typeof context.lastPromptMessageId === "string" ? context.lastPromptMessageId : undefined;
      if (input.referenceMessageId && expectedReference && input.referenceMessageId !== expectedReference) {
        logger.warn({ conversationId: conversation!.id, flowNodeId: entryNode.id }, "Confirmação de contato pertence a outro prompt do fluxo");
        return this.waitAtContactConfirmation(entryNode, conversation!.id, conversation!.contact, context);
      }
      const summary = contactSummaryConfig(entryNode);
      const choices = [
        { optionKey: "contact-profile-confirm", label: summary.confirmLabel },
        { optionKey: "contact-profile-update", label: summary.updateLabel },
      ];
      const chosen = findConfiguredChoice(choices, input.content, input.selectedOptionId);
      if (!chosen) return this.waitAtContactConfirmation(entryNode, conversation!.id, conversation!.contact, context);
      delete context.contactConfirmationPending;
      context.lastPromptMessageId = null;
      context.lastPromptNodeId = null;
      if (chosen.optionKey === "contact-profile-update") {
        context.contactProfileUpdateStep = "NAME";
        context.contactProfileDraft = {};
        await flowExecutionRepository.updateState(conversation!.id, entryNode.id, context);
        return { status: "waiting_contact_update", actions: [{ type: "SEND_TEXT", content: summary.updateIntro }] };
      }
      await flowExecutionRepository.confirmContactProfile(conversation!.contactId);
      context.contactSummaryAcceptedAt = new Date().toISOString();
      node = entryNode;
    }

    if (!input.isNewConversation && node.type === "DECISION") {
      const decisionNodeId = node.id;
      const expectedReference = typeof context.lastPromptMessageId === "string" ? context.lastPromptMessageId : undefined;
      if (input.referenceMessageId && expectedReference && input.referenceMessageId !== expectedReference) {
        logger.warn({ conversationId: conversation!.id, flowNodeId: node.id }, "Resposta interativa pertence a outro prompt do fluxo");
        return this.waitAtDecision(revision, node, conversation!.id, context);
      }
      const nodeConfig = contextRecord(node.config);
      const groups = featureEnabled("FLOW_HIERARCHICAL_MENUS_ENABLED") ? configuredDecisionGroups(node) : [];
      const pendingCategoryKey = context.pendingCategoryNodeId === node.id && typeof context.pendingCategoryKey === "string" ? context.pendingCategoryKey : undefined;
      if (groups.length && pendingCategoryKey) {
        const group = groups.find((item) => item.categoryKey === pendingCategoryKey);
        const selectedItem = group ? findConfiguredChoice(group.items, input.content, input.selectedOptionId) : undefined;
        if (!group || !selectedItem) return this.waitAtDecision(revision, node, conversation!.id, context);
        const selections = contextRecord(context.decisionSelections);
        context.decisionSelections = { ...selections, [`${node.stableKey}:item`]: { optionKey: selectedItem.optionKey, label: selectedItem.label } };
        context.selectedCategoryKey = group.categoryKey;
        context.selectedCategoryLabel = group.label;
        context.selectedItemKey = selectedItem.optionKey;
        context.selectedItemLabel = selectedItem.label;
        context.selectedIssueKey = selectedItem.optionKey;
        context.selectedIssueLabel = selectedItem.label;
        delete context.pendingCategoryNodeId;
        delete context.pendingCategoryKey;
        context.lastPromptMessageId = null;
        context.lastPromptNodeId = null;
        // Keep the historical event name for conversations that were already
        // waiting on the old two-step category prompt.
        await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "WAITING_ITEM" });
        const categoryTransition = revision.transitions.find((item) => item.fromNodeId === decisionNodeId && item.optionKey === group.categoryKey);
        node = categoryTransition ? revision.nodes.find((item) => item.id === categoryTransition.toNodeId) : undefined;
        if (!node) throw new Error("FLOW_NODE_NOT_FOUND");
      } else if (groups.length) {
        const selectedItem = findConfiguredChoice(flattenedDecisionOptions(groups), input.content, input.selectedOptionId) as GroupedDecisionOption | undefined;
        if (!selectedItem) return this.waitAtDecision(revision, node, conversation!.id, context);
        const selections = contextRecord(context.decisionSelections);
        context.decisionSelections = { ...selections, [node.stableKey]: { optionKey: selectedItem.optionKey, label: selectedItem.label, categoryKey: selectedItem.categoryKey, categoryLabel: selectedItem.categoryLabel } };
        context.selectedCategoryKey = selectedItem.categoryKey;
        context.selectedCategoryLabel = selectedItem.categoryLabel;
        context.selectedItemKey = selectedItem.optionKey;
        context.selectedItemLabel = selectedItem.label;
        context.selectedIssueKey = selectedItem.optionKey;
        context.selectedIssueLabel = selectedItem.label;
        context.lastPromptMessageId = null;
        context.lastPromptNodeId = null;
        const categoryTransition = revision.transitions.find((item) => item.fromNodeId === decisionNodeId && item.optionKey === selectedItem.categoryKey);
        node = categoryTransition ? revision.nodes.find((item) => item.id === categoryTransition.toNodeId) : undefined;
        if (!node) throw new Error("FLOW_NODE_NOT_FOUND");
      } else {
        const chosen = findDecisionChoice(revision, node, input.content, input.selectedOptionId);
        if (!chosen) return this.waitAtDecision(revision, node, conversation!.id, context);
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
      }
    } else if (!input.isNewConversation && node.type === "TRIAGE") {
      const config = contextRecord(node.config); const responseKey = typeof config.responseKey === "string" ? config.responseKey : node.stableKey;
      context[responseKey] = input.content;
      const edge = nextTransition(revision, node.id); node = edge ? revision.nodes.find((item) => item.id === edge.toNodeId) : undefined;
      if (!node) throw new Error("FLOW_NODE_NOT_FOUND");
    }

    for (let guard = 0; guard < 100; guard += 1) {
      if (node.type === "ENTRY" || node.type === "ROUTE") {
        if (
          node.type === "ENTRY" &&
          input.isNewConversation &&
          !input.isGroup &&
          featureEnabled("CONTACT_SUMMARY_ENABLED") &&
          conversation!.contact.isRegistered &&
          contactSummaryConfig(node).enabled &&
          context.contactSummaryAcceptedAt == null
        ) {
          context.contactConfirmationPending = true;
          context.contactSummaryPresentedAt = new Date().toISOString();
          await flowExecutionRepository.updateState(conversation!.id, node.id, context);
          const action = this.contactConfirmationAction(node, conversation!.contact);
          await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "WAITING_CONTACT_CONFIRMATION" });
          return { status: "waiting_contact_confirmation", actions: [action] };
        }
        if (node.type === "ROUTE") { context.teamName = node.name; if (node.departmentId) context.departmentId = node.departmentId; }
        const edge = nextTransition(revision, node.id); node = edge ? revision.nodes.find((item) => item.id === edge.toNodeId) : undefined; if (!node) throw new Error("FLOW_NODE_NOT_FOUND"); continue;
      }
      if (node.type === "MESSAGE") { if (node.content.trim()) actions.push({ type: "SEND_TEXT", content: node.content }); const edge = nextTransition(revision, node.id); node = edge ? revision.nodes.find((item) => item.id === edge.toNodeId) : undefined; if (!node) throw new Error("FLOW_NODE_NOT_FOUND"); continue; }
      if (node.type === "DECISION") { await flowExecutionRepository.updateState(conversation!.id, node.id, context); const result = this.decisionAction(revision, node, context); actions.push(result); await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "WAITING_DECISION" }); return { status: "waiting_decision", actions }; }
      if (node.type === "TRIAGE") { await flowExecutionRepository.updateState(conversation!.id, node.id, context); actions.push({ type: "SEND_TEXT", content: node.content }); await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "WAITING_TRIAGE" }); return { status: "waiting_triage", actions }; }
      if (node.type === "HANDOFF") { const departmentId = node.departmentId ?? (typeof context.departmentId === "string" ? context.departmentId : ""); if (!departmentId) throw new Error("HANDOFF_WITHOUT_DEPARTMENT"); await flowExecutionRepository.handoff(conversation!.id, departmentId, context); actions.push({ type: "HANDOFF", departmentId }); await flowExecutionRepository.recordEvent({ conversationId: conversation!.id, flowRevisionId: revision.id, flowNodeId: node.id, externalEventId: input.externalEventId, type: "HANDOFF" }); return { status: "routed_to_department", actions }; }
      if (node.type === "END") { await flowExecutionRepository.updateState(conversation!.id, null, context); return { status: "flow_ended", actions }; }
    }
    logger.error({ conversationId: input.conversationId }, "Limite de passos do fluxo excedido"); throw new Error("FLOW_STEP_LIMIT");
  }
  private decisionAction(revision: RuntimeRevision, node: FlowNode, context: Record<string, unknown> = {}): FlowExecutionAction {
    const config = contextRecord(node.config);
    const groups = featureEnabled("FLOW_HIERARCHICAL_MENUS_ENABLED") ? configuredDecisionGroups(node) : [];
    const pendingCategoryKey = context.pendingCategoryNodeId === node.id && typeof context.pendingCategoryKey === "string" ? context.pendingCategoryKey : undefined;
    if (groups.length && pendingCategoryKey) {
      const group = groups.find((item) => item.categoryKey === pendingCategoryKey);
      if (group) {
        return {
          type: "SEND_OPTIONS",
          nodeId: node.id,
          content: `Escolha uma opção de ${group.label}:`,
          options: group.items.map((item) => ({ ...item, departmentId: node.departmentId ?? "" })),
        };
      }
    }
    if (groups.length) {
      const options = flattenedDecisionOptions(groups).map((item) => ({
        optionKey: item.optionKey,
        label: item.label,
        ...(item.description ? { description: item.description } : {}),
        categoryLabel: item.categoryLabel,
        departmentId: node.departmentId ?? "",
      }));
      return {
        type: "SEND_OPTIONS",
        nodeId: node.id,
        content: typeof config.buttonMessage === "string" ? config.buttonMessage : node.content,
        options,
      };
    }
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
  private contactConfirmationAction(node: FlowNode, contact: RuntimeContact): FlowExecutionAction {
    const config = contactSummaryConfig(node);
    return {
      type: "SEND_OPTIONS",
      nodeId: node.id,
      content: renderContactSummary(config.template, contact),
      options: [
        { optionKey: "contact-profile-confirm", label: config.confirmLabel, departmentId: "" },
        { optionKey: "contact-profile-update", label: config.updateLabel, departmentId: "" },
      ],
    };
  }
  private async waitAtContactConfirmation(node: FlowNode, conversationId: string, contact: RuntimeContact, context: Record<string, unknown>) {
    await flowExecutionRepository.updateState(conversationId, node.id, context);
    return { status: "invalid_option", actions: [this.contactConfirmationAction(node, contact)] as FlowExecutionAction[] };
  }
  private async waitAtDecision(revision: RuntimeRevision, node: FlowNode, conversationId: string, context: Record<string, unknown> = {}) { await flowExecutionRepository.updateState(conversationId, node.id, context); return { status: "invalid_option", actions: [this.decisionAction(revision, node, context)] as FlowExecutionAction[] }; }
}
export const flowExecutionService = new FlowExecutionService();
