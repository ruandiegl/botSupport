import { randomUUID } from "node:crypto";
import { logger } from "../../shared/logger.js";
import { flowRepository } from "./flow.repository.js";
import type { FlowNodeInput, FlowTransitionInput, SaveDraftBody, UpdateFlowBody } from "./flow.schemas.js";

export type FlowValidationIssue = { code: string; message: string; nodeId?: string; transitionId?: string };

export function validateFlowDocument(nodes: FlowNodeInput[], transitions: FlowTransitionInput[]): FlowValidationIssue[] {
  const issues: FlowValidationIssue[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const stableKeys = new Set<string>();
  const optionKeys = new Set<string>();
  const routeDecisionParents = new Set<string>();
  const entries = nodes.filter((node) => node.type === "ENTRY");
  if (entries.length !== 1) issues.push({ code: "ENTRY_COUNT", message: "O fluxo deve possuir exatamente uma entrada." });
  for (const node of nodes) {
    if (stableKeys.has(node.stableKey)) issues.push({ code: "DUPLICATE_STABLE_KEY", message: "Identificador estável duplicado.", nodeId: node.id });
    stableKeys.add(node.stableKey);
    if (node.type === "TRIAGE" && (!node.content.trim() || typeof node.config?.responseKey !== "string" || !node.config.responseKey.trim())) issues.push({ code: "INVALID_TRIAGE", message: "Triagem exige mensagem e chave de resposta.", nodeId: node.id });
    if (node.type === "HANDOFF" && !node.departmentId) issues.push({ code: "HANDOFF_WITHOUT_DEPARTMENT", message: "Encaminhamento exige departamento.", nodeId: node.id });
    if (node.type === "DECISION" && node.config?.parentRouteId) {
      const parent = nodes.find((item) => item.id === node.config?.parentRouteId);
      if (!parent || parent.type !== "ROUTE") issues.push({ code: "INVALID_DECISION_PARENT", message: "O submenu precisa pertencer a uma rota válida.", nodeId: node.id });
      if (routeDecisionParents.has(node.config.parentRouteId)) issues.push({ code: "ROUTE_DECISION_LIMIT", message: "Cada rota pode possuir somente um submenu nesta versão.", nodeId: node.id });
      routeDecisionParents.add(node.config.parentRouteId);
    }
    if (node.config?.parentDecisionId) {
      const parentDecision = nodes.find((item) => item.id === node.config?.parentDecisionId);
      if (!parentDecision || parentDecision.type !== "DECISION") issues.push({ code: "INVALID_NESTED_DECISION_PARENT", message: "A decisão filha precisa pertencer a uma decisão válida.", nodeId: node.id });
    }
  }
  for (const transition of transitions) {
    if (!nodeIds.has(transition.fromNodeId) || !nodeIds.has(transition.toNodeId)) issues.push({ code: "UNKNOWN_NODE", message: "Transição aponta para nó inexistente.", transitionId: transition.id });
    if (transition.optionKey) {
      if (optionKeys.has(transition.optionKey)) issues.push({ code: "DUPLICATE_OPTION_KEY", message: "Chave de opção duplicada.", transitionId: transition.id });
      optionKeys.add(transition.optionKey);
    }
  }
  for (const decision of nodes.filter((node) => node.type === "DECISION")) {
    const outgoing = transitions.filter((item) => item.fromNodeId === decision.id);
    if (!outgoing.some((item) => item.optionKey)) issues.push({ code: "DECISION_WITHOUT_OPTIONS", message: "Decisão exige uma opção de saída.", nodeId: decision.id });
    if (outgoing.some((item) => !item.optionKey)) issues.push({ code: "DECISION_WITHOUT_OPTION_KEY", message: "Toda saída de uma decisão precisa de identificação estável.", nodeId: decision.id });
    if (outgoing.length > 20) issues.push({ code: "DECISION_OPTION_LIMIT", message: "Decisão excede o limite de 20 opções.", nodeId: decision.id });
    const hierarchical = decision.config?.decisionMode === "CATEGORIES";
    const groups = hierarchical && Array.isArray(decision.config?.decisionGroups) ? decision.config.decisionGroups : [];
    if (hierarchical && !groups.length) issues.push({ code: "DECISION_WITHOUT_CATEGORIES", message: "Adicione ao menos uma categoria e seus itens.", nodeId: decision.id });
    if (hierarchical && groups.length > 20) issues.push({ code: "DECISION_CATEGORY_LIMIT", message: "A decisão excede o limite de 20 categorias.", nodeId: decision.id });
    if (hierarchical) {
      const categoryKeys = new Set<string>();
      for (const group of groups) {
        if (categoryKeys.has(group.categoryKey)) issues.push({ code: "DUPLICATE_CATEGORY_KEY", message: "Há categorias com identificação duplicada.", nodeId: decision.id });
        categoryKeys.add(group.categoryKey);
        if (!group.items.length) issues.push({ code: "CATEGORY_WITHOUT_ITEMS", message: `A categoria ${group.label} precisa de ao menos um item.`, nodeId: decision.id });
        for (const item of group.items) {
          if (optionKeys.has(item.optionKey)) issues.push({ code: "DUPLICATE_ITEM_KEY", message: "Há itens com identificação duplicada no fluxo.", nodeId: decision.id });
          optionKeys.add(item.optionKey);
        }
      }
    }
    if (decision.config?.parentRouteId && (Array.isArray(decision.config.decisionOptions) || hierarchical)) {
      const configured = new Set(hierarchical
        ? groups.map((item) => item.categoryKey)
        : decision.config.decisionOptions!.map((item) => item.optionKey));
      const persisted = new Set(outgoing.flatMap((item) => item.optionKey ? [item.optionKey] : []));
      if (configured.size !== persisted.size || [...configured].some((key) => !persisted.has(key))) issues.push({ code: "DECISION_OPTIONS_MISMATCH", message: hierarchical ? "As categorias configuradas não correspondem às transições do submenu." : "Os botões configurados não correspondem às transições do submenu.", nodeId: decision.id });
    }
  }
  for (const triage of nodes.filter((node) => node.type === "TRIAGE")) if (transitions.filter((item) => item.fromNodeId === triage.id).length !== 1) issues.push({ code: "TRIAGE_NEXT", message: "Triagem exige exatamente uma próxima etapa.", nodeId: triage.id });
  if (entries.length === 1) {
    const reachable = new Set<string>(); const queue = [entries[0].id];
    while (queue.length) { const id = queue.shift()!; if (reachable.has(id)) continue; reachable.add(id); for (const edge of transitions.filter((item) => item.fromNodeId === id)) queue.push(edge.toNodeId); }
    nodes.filter((node) => !reachable.has(node.id)).forEach((node) => issues.push({ code: "UNREACHABLE_NODE", message: "Nó desconectado da entrada.", nodeId: node.id }));
    const adjacency = new Map(nodes.map((node) => [node.id, transitions.filter((edge) => edge.fromNodeId === node.id).map((edge) => edge.toNodeId)]));
    const visiting = new Set<string>(), visited = new Set<string>();
    const detectCycle = (id: string): boolean => { if (visiting.has(id)) return true; if (visited.has(id)) return false; visiting.add(id); const cycle = (adjacency.get(id) ?? []).some(detectCycle); visiting.delete(id); visited.add(id); return cycle; };
    if (detectCycle(entries[0].id)) issues.push({ code: "CYCLE", message: "O fluxo não pode possuir ciclos." });
    const terminalMemo = new Map<string, boolean>();
    const reachesTerminal = (id: string, path = new Set<string>()): boolean => { if (terminalMemo.has(id)) return terminalMemo.get(id)!; if (path.has(id)) return false; const current = nodes.find((item) => item.id === id); if (current?.type === "HANDOFF" || current?.type === "END") return true; const nextPath = new Set(path).add(id); const result = (adjacency.get(id) ?? []).some((next) => reachesTerminal(next, nextPath)); terminalMemo.set(id, result); return result; };
    nodes.filter((node) => node.type === "ROUTE" && !reachesTerminal(node.id)).forEach((node) => issues.push({ code: "ROUTE_WITHOUT_TERMINAL", message: "Toda rota deve terminar em encaminhamento ou fim.", nodeId: node.id }));
    nodes.filter((node) => node.type === "DECISION" && !reachesTerminal(node.id)).forEach((node) => issues.push({ code: "DECISION_WITHOUT_TERMINAL", message: "Toda opção da decisão precisa alcançar um encaminhamento ou fim.", nodeId: node.id }));
    for (const decision of nodes.filter((node) => node.type === "DECISION")) {
      transitions
        .filter((item) => item.fromNodeId === decision.id && item.optionKey && !reachesTerminal(item.toNodeId))
        .forEach((item) => issues.push({ code: "DECISION_OPTION_WITHOUT_TERMINAL", message: "Esta opção não alcança um encaminhamento ou fim.", nodeId: decision.id, transitionId: item.id }));
    }
  }
  return issues;
}

function legacyOptionKey(label: string, index: number) { return `route-${label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-${index + 1}`; }

export function legacyToDocument(data: UpdateFlowBody) {
  const entry = randomUUID(), greeting = randomUUID(), decision = randomUUID();
  const nodes: FlowNodeInput[] = [
    { id: entry, stableKey: "entry", type: "ENTRY", name: "Entrada", content: "", sortOrder: 0 },
    { id: greeting, stableKey: "greeting", type: "MESSAGE", name: "Saudação", content: data.greeting, sortOrder: 1 },
    { id: decision, stableKey: "team-decision", type: "DECISION", name: "Escolha da equipe", content: data.menuMessage, sortOrder: 2, config: { buttonMessage: "Escolha uma equipe para iniciar o atendimento:" } },
  ];
  const transitions: FlowTransitionInput[] = [
    { id: randomUUID(), fromNodeId: entry, toNodeId: greeting, sortOrder: 0 },
    { id: randomUUID(), fromNodeId: greeting, toNodeId: decision, sortOrder: 0 },
  ];
  data.options.forEach((option, index) => {
    const route = randomUUID(), triage = randomUUID(), handoff = randomUUID(); const key = option.optionKey ?? legacyOptionKey(option.label, index);
    const defaultTriage = option.label.toLowerCase().includes("suporte") ? "Você selecionou a equipe Suporte.\nPor favor, informe-nos os dados abaixo para que possamos entrar em contato com você em breve:\n\nSeu nome\nSua emissora\nSua cidade/UF\nSua necessidade de suporte" : option.procedureMessage || `Você selecionou a equipe ${option.label}.\nInforme os detalhes necessários para o atendimento.`;
    nodes.push({ id: route, stableKey: key, type: "ROUTE", name: option.label, content: "", sortOrder: index, departmentId: option.departmentId || null }, { id: triage, stableKey: `${key}-triage`, type: "TRIAGE", name: `Triagem ${option.label}`, content: defaultTriage, sortOrder: 0, config: { responseKey: "triageDetails" }, departmentId: option.departmentId || null }, { id: handoff, stableKey: `${key}-handoff`, type: "HANDOFF", name: `Encaminhar para ${option.label}`, content: "", sortOrder: 1, departmentId: option.departmentId || null });
    transitions.push({ id: randomUUID(), fromNodeId: decision, toNodeId: route, optionKey: key, label: option.label, sortOrder: index }, { id: randomUUID(), fromNodeId: route, toNodeId: triage, sortOrder: 0 }, { id: randomUUID(), fromNodeId: triage, toNodeId: handoff, sortOrder: 0 });
  });
  return { nodes, transitions };
}

export class FlowService {
  getLatest() { return flowRepository.findLatestLegacy(); }
  async update(data: UpdateFlowBody) {
    const legacy = await flowRepository.upsertLegacy(data);
    const draft = await flowRepository.findDraft() ?? await flowRepository.createDraftFrom();
    const document = legacyToDocument(data); const issues = validateFlowDocument(document.nodes, document.transitions);
    if (!issues.length) await flowRepository.saveDraft(draft.id, { revision: draft.revision, ...document });
    return legacy;
  }
  getPublished() { return flowRepository.findPublished(); }
  async getDraft() { const draft = await flowRepository.findDraft(); if (draft) return draft; const published = await flowRepository.findPublished(); return published ? flowRepository.createDraftFrom() : this.createDraft(); }
  async createDraft() { try { return await flowRepository.createDraftFrom(); } catch (error) { if (!(error instanceof Error) || error.message !== "FLOW_NOT_FOUND") throw error; const { revision, legacy } = await flowRepository.createDraftFromLegacy(); const legacyOptions = Array.isArray(legacy.options) ? legacy.options : []; const document = legacyToDocument({ name: legacy.name, greeting: legacy.greeting, menuMessage: legacy.menuMessage, options: legacyOptions as UpdateFlowBody["options"] }); return (await flowRepository.saveDraft(revision.id, { revision: revision.revision, ...document })); } }
  private async validateDepartments(nodes: FlowNodeInput[]) { const departmentIds = [...new Set(nodes.filter((node) => (node.type === "HANDOFF" || node.type === "ROUTE") && node.departmentId).map((node) => node.departmentId!))]; const departments = await flowRepository.findDepartments(departmentIds); const found = new Set(departments.map((item) => item.id)); return nodes.filter((node) => node.departmentId && !found.has(node.departmentId)).map((node) => ({ code: "DEPARTMENT_NOT_FOUND", message: "Departamento referenciado não existe.", nodeId: node.id } satisfies FlowValidationIssue)); }
  async saveDraft(id: string, data: SaveDraftBody) { const issues = [...validateFlowDocument(data.nodes, data.transitions), ...await this.validateDepartments(data.nodes)]; if (issues.length) return { valid: false as const, issues }; return { valid: true as const, flow: await flowRepository.saveDraft(id, data) }; }
  async validateDraft(id: string) { const draft = await flowRepository.findRevision(id); if (!draft || draft.status !== "DRAFT") throw new Error("DRAFT_NOT_FOUND"); const nodes = draft.nodes as FlowNodeInput[]; const issues = [...validateFlowDocument(nodes, draft.transitions as FlowTransitionInput[]), ...await this.validateDepartments(nodes)]; return { valid: issues.length === 0, issues }; }
  async publish(id: string, actorId: string) { const validation = await this.validateDraft(id); if (!validation.valid) return validation; const flow = await flowRepository.publish(id, actorId); logger.info({ flowRevisionId: id, actorId }, "Revisão do fluxo publicada"); return { valid: true, flow }; }
  listRevisions() { return flowRepository.listRevisions(); }
  restore(id: string) { return flowRepository.createDraftFrom(id); }
}
export const flowService = new FlowService();
