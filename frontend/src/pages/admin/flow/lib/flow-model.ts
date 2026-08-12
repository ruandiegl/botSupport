import type {
  FlowDefinition,
  FlowNode,
  FlowNodeType,
  FlowRevision,
  FlowTransition,
  FlowValidationIssue,
  FlowValidationResult,
} from "@/types";

export const SUPPORT_TRIAGE = `Você selecionou a equipe Suporte.
Por favor, informe-nos os dados abaixo para que possamos entrar em contato com você em breve:

Seu nome
Sua emissora
Sua cidade/UF
Sua necessidade de suporte`;

const uuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (Number(character) ^ (Math.random() * 16 >> Number(character) / 4)).toString(16));
};

const stableKey = (prefix: string) => `${prefix}-${uuid()}`;

export function createNode(
  type: FlowNodeType,
  overrides: Partial<FlowNode> = {},
): FlowNode {
  const defaults: Record<FlowNodeType, Pick<FlowNode, "name" | "content">> = {
    ENTRY: { name: "Entrada", content: "Olá! Como podemos ajudar?" },
    MESSAGE: { name: "Nova mensagem", content: "Digite a mensagem enviada ao contato." },
    DECISION: { name: "Escolha de equipe", content: "Escolha uma equipe para iniciar o atendimento:" },
    ROUTE: { name: "Nova rota", content: "" },
    TRIAGE: { name: "Triagem", content: "Informe os dados necessários para o atendimento." },
    HANDOFF: { name: "Encaminhar para fila", content: "Seu atendimento será encaminhado para nossa equipe." },
    END: { name: "Finalizar automação", content: "Atendimento automático finalizado." },
  };
  const id = overrides.id ?? uuid();
  return {
    id,
    stableKey: overrides.stableKey ?? stableKey(type.toLowerCase()),
    type,
    name: overrides.name ?? defaults[type].name,
    content: overrides.content ?? defaults[type].content,
    sortOrder: overrides.sortOrder ?? 0,
    config: overrides.config ?? {},
    departmentId: overrides.departmentId ?? null,
  };
}

export function createTransition(
  fromNodeId: string,
  toNodeId: string,
  overrides: Partial<FlowTransition> = {},
): FlowTransition {
  return {
    id: overrides.id ?? uuid(),
    fromNodeId,
    toNodeId,
    optionKey: overrides.optionKey ?? null,
    label: overrides.label ?? null,
    sortOrder: overrides.sortOrder ?? 0,
  };
}

export function legacyToRevision(flow: FlowDefinition): FlowRevision {
  const entry = createNode("ENTRY", {
    id: `legacy-entry-${flow.id}`,
    stableKey: "entry",
    name: "Boas-vindas",
    content: flow.greeting,
    sortOrder: 0,
  });
  const decision = createNode("DECISION", {
    id: `legacy-decision-${flow.id}`,
    stableKey: "main-decision",
    name: "Menu principal",
    content: flow.menuMessage,
    sortOrder: 1,
  });
  const nodes: FlowNode[] = [entry, decision];
  const transitions: FlowTransition[] = [createTransition(entry.id, decision.id)];

  flow.options.forEach((option, index) => {
    const route = createNode("ROUTE", {
      id: `legacy-route-${flow.id}-${index}`,
      stableKey: `route-${index + 1}`,
      name: option.label || `Rota ${index + 1}`,
      content: "",
      sortOrder: index,
      departmentId: option.departmentId || null,
      config: { optionKey: `route-${index + 1}`, legacyOptionIndex: index },
    });
    const triage = createNode("TRIAGE", {
      id: `legacy-triage-${flow.id}-${index}`,
      stableKey: `triage-${index + 1}`,
      name: "Triagem da equipe",
      content: option.procedureMessage || (option.label.toLowerCase().includes("suporte") ? SUPPORT_TRIAGE : "Informe os dados necessários para o atendimento."),
      sortOrder: 0,
      departmentId: option.departmentId || null,
      config: { parentRouteId: route.id, responseKey: option.label.toLowerCase().includes("suporte") ? "supportDetails" : `route${index + 1}Details` },
    });
    const handoff = createNode("HANDOFF", {
      id: `legacy-handoff-${flow.id}-${index}`,
      stableKey: `handoff-${index + 1}`,
      name: "Encaminhar para fila",
      content: "Obrigado! Vou encaminhar você para a equipe responsável.",
      sortOrder: 1,
      departmentId: option.departmentId || null,
      config: { parentRouteId: route.id },
    });
    nodes.push(route, triage, handoff);
    transitions.push(
      createTransition(decision.id, route.id, {
        optionKey: String(route.config.optionKey),
        label: route.name,
        sortOrder: index,
      }),
      createTransition(route.id, triage.id),
      createTransition(triage.id, handoff.id),
    );
  });

  return {
    id: `legacy-draft-${flow.id}`,
    flowDefinitionId: flow.id,
    name: flow.name,
    version: 1,
    status: "PUBLISHED",
    schemaVersion: 2,
    revision: 0,
    nodes,
    transitions,
    updatedAt: flow.updatedAt,
    legacyDefinition: flow,
  };
}

export function normalizeRevision(input: FlowRevision): FlowRevision {
  const nodes = input.nodes.map((node) => ({
    ...node,
    config: node.config ?? {},
    departmentId: node.departmentId ?? null,
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const parentByNode = new Map<string, string>();
  const optionByRoute = new Map<string, string>();
  const routes = nodes.filter((node) => node.type === "ROUTE");
  for (const route of routes) {
    const incoming = input.transitions.find((transition) => transition.toNodeId === route.id && transition.optionKey);
    if (incoming?.optionKey) optionByRoute.set(route.id, incoming.optionKey);
    const visited = new Set<string>([route.id]);
    const queue = input.transitions.filter((transition) => transition.fromNodeId === route.id).map((transition) => transition.toNodeId);
    while (queue.length) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      const node = byId.get(nodeId);
      if (!node || node.type === "ROUTE" || node.type === "DECISION" || node.type === "ENTRY") continue;
      parentByNode.set(nodeId, route.id);
      input.transitions.filter((transition) => transition.fromNodeId === nodeId).forEach((transition) => queue.push(transition.toNodeId));
    }
  }
  return {
    ...input,
    nodes: nodes.map((node) => ({
      ...node,
      config: {
        ...node.config,
        ...(parentByNode.has(node.id) ? { parentRouteId: parentByNode.get(node.id) } : {}),
        ...(optionByRoute.has(node.id) ? { optionKey: optionByRoute.get(node.id) } : {}),
      },
    })),
  };
}

export function revisionToLegacy(revision: FlowRevision): FlowDefinition {
  const entry = revision.nodes.find((node) => node.type === "ENTRY");
  const decision = revision.nodes.find((node) => node.type === "DECISION");
  const routes = getRouteNodes(revision);
  const fallback = revision.legacyDefinition;
  return {
    id: fallback?.id ?? revision.flowDefinitionId,
    name: revision.name ?? fallback?.name ?? "Fluxo principal",
    greeting: entry?.content ?? fallback?.greeting ?? "",
    menuMessage: decision?.content ?? fallback?.menuMessage ?? "",
    options: routes.map((route) => {
      const triage = getBranchNodes(revision, route.id).find((node) => node.type === "TRIAGE");
      return {
        label: route.name,
        departmentId: route.departmentId ?? "",
        procedureMessage: triage?.content ?? "",
      };
    }),
    updatedAt: fallback?.updatedAt ?? revision.updatedAt ?? new Date().toISOString(),
  };
}

export function getMainNodes(revision: FlowRevision) {
  return revision.nodes
    .filter((node) => !node.config.parentRouteId && node.type !== "ROUTE")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getRouteNodes(revision: FlowRevision) {
  return revision.nodes.filter((node) => node.type === "ROUTE").sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getBranchNodes(revision: FlowRevision, routeId: string) {
  return revision.nodes
    .filter((node) => node.config.parentRouteId === routeId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function replaceNode(revision: FlowRevision, nextNode: FlowNode): FlowRevision {
  return { ...revision, nodes: revision.nodes.map((node) => node.id === nextNode.id ? nextNode : node) };
}

export function insertNode(
  revision: FlowRevision,
  node: FlowNode,
  parentRouteId?: string,
): FlowRevision {
  const container = parentRouteId ? getBranchNodes(revision, parentRouteId) : getMainNodes(revision);
  const parentRoute = parentRouteId ? revision.nodes.find((item) => item.id === parentRouteId) : undefined;
  const terminalIndex = container.findIndex((item) => item.type === "HANDOFF" || item.type === "END");
  const insertOrder = parentRouteId && terminalIndex >= 0 && node.type !== "HANDOFF" && node.type !== "END"
    ? terminalIndex
    : container.length;
  const shiftedNodes = revision.nodes.map((item) =>
    parentRouteId && item.config.parentRouteId === parentRouteId && item.sortOrder >= insertOrder
      ? { ...item, sortOrder: item.sortOrder + 1 }
      : item);
  const inserted = {
    ...node,
    sortOrder: insertOrder,
    config: { ...node.config, ...(parentRouteId ? { parentRouteId } : {}) },
    departmentId: node.type === "HANDOFF" ? parentRoute?.departmentId ?? null : node.departmentId,
  };
  return rebuildTransitions({ ...revision, nodes: [...shiftedNodes, inserted] });
}

export function addRoute(revision: FlowRevision): { revision: FlowRevision; routeId: string } {
  const routes = getRouteNodes(revision);
  const route = createNode("ROUTE", {
    name: `Nova rota ${routes.length + 1}`,
    sortOrder: routes.length,
    config: { optionKey: stableKey("option") },
  });
  const triage = createNode("TRIAGE", {
    content: SUPPORT_TRIAGE,
    config: { parentRouteId: route.id, responseKey: "supportDetails" },
    sortOrder: 0,
  });
  const handoff = createNode("HANDOFF", {
    config: { parentRouteId: route.id },
    sortOrder: 1,
  });
  return {
    revision: rebuildTransitions({ ...revision, nodes: [...revision.nodes, route, triage, handoff] }),
    routeId: route.id,
  };
}

export function duplicateNode(revision: FlowRevision, nodeId: string): { revision: FlowRevision; nodeId: string } {
  const source = revision.nodes.find((node) => node.id === nodeId);
  if (!source || source.type === "ENTRY" || source.type === "DECISION" || source.type === "HANDOFF") {
    return { revision, nodeId };
  }
  if (source.type === "ROUTE") {
    const route = createNode("ROUTE", {
      ...source,
      id: undefined,
      stableKey: undefined,
      name: `${source.name} (cópia)`,
      sortOrder: getRouteNodes(revision).length,
      config: { ...source.config, optionKey: stableKey("option") },
    });
    const branch = getBranchNodes(revision, source.id).map((node) => createNode(node.type, {
      ...node,
      id: undefined,
      stableKey: undefined,
      config: { ...node.config, parentRouteId: route.id },
    }));
    return { revision: rebuildTransitions({ ...revision, nodes: [...revision.nodes, route, ...branch] }), nodeId: route.id };
  }
  const copy = createNode(source.type, {
    ...source,
    id: undefined,
    stableKey: undefined,
    name: `${source.name} (cópia)`,
    sortOrder: source.sortOrder + 1,
  });
  const nodes = revision.nodes.map((node) => {
    if (node.config.parentRouteId === source.config.parentRouteId && node.sortOrder > source.sortOrder) return { ...node, sortOrder: node.sortOrder + 1 };
    return node;
  });
  return { revision: rebuildTransitions({ ...revision, nodes: [...nodes, copy] }), nodeId: copy.id };
}

export function removeNode(revision: FlowRevision, nodeId: string): FlowRevision {
  const source = revision.nodes.find((node) => node.id === nodeId);
  if (!source || source.type === "ENTRY" || source.type === "DECISION") return revision;
  const removedIds = new Set([nodeId]);
  if (source.type === "ROUTE") {
    revision.nodes.filter((node) => node.config.parentRouteId === nodeId).forEach((node) => removedIds.add(node.id));
  }
  return rebuildTransitions({ ...revision, nodes: revision.nodes.filter((node) => !removedIds.has(node.id)) });
}

export function reorderContainer(
  revision: FlowRevision,
  containerId: "main" | "routes" | string,
  activeId: string,
  overId: string,
): FlowRevision {
  const items = containerId === "main"
    ? getMainNodes(revision)
    : containerId === "routes"
      ? getRouteNodes(revision)
      : getBranchNodes(revision, containerId);
  const from = items.findIndex((node) => node.id === activeId);
  const to = items.findIndex((node) => node.id === overId);
  if (from < 0 || to < 0 || from === to) return revision;
  const reordered = [...items];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);
  const order = new Map(reordered.map((node, index) => [node.id, index]));
  return rebuildTransitions({
    ...revision,
    nodes: revision.nodes.map((node) => order.has(node.id) ? { ...node, sortOrder: order.get(node.id)! } : node),
  });
}

export function moveNode(
  revision: FlowRevision,
  nodeId: string,
  direction: -1 | 1,
): FlowRevision {
  const node = revision.nodes.find((item) => item.id === nodeId);
  if (!node) return revision;
  const containerId = node.type === "ROUTE" ? "routes" : node.config.parentRouteId ?? "main";
  const items = containerId === "main" ? getMainNodes(revision) : containerId === "routes" ? getRouteNodes(revision) : getBranchNodes(revision, containerId);
  const index = items.findIndex((item) => item.id === nodeId);
  const target = items[index + direction];
  return target ? reorderContainer(revision, containerId, nodeId, target.id) : revision;
}

export function rebuildTransitions(revision: FlowRevision): FlowRevision {
  const mainRaw = getMainNodes(revision);
  const entry = mainRaw.find((node) => node.type === "ENTRY");
  const mainDecision = mainRaw.find((node) => node.type === "DECISION");
  const middle = mainRaw.filter((node) => node.id !== entry?.id && node.id !== mainDecision?.id);
  const main = [entry, ...middle, mainDecision].filter((node): node is FlowNode => Boolean(node)).map((node, index) => ({ ...node, sortOrder: index }));
  const routes = getRouteNodes(revision).map((node, index) => ({ ...node, sortOrder: index }));
  const branchNodes = routes.flatMap((route) => getBranchNodes(revision, route.id).map((node, index) => ({ ...node, sortOrder: index })));
  const retained = revision.nodes.filter((node) => !main.some((item) => item.id === node.id) && !routes.some((item) => item.id === node.id) && !branchNodes.some((item) => item.id === node.id));
  const transitions: FlowTransition[] = [];
  main.forEach((node, index) => {
    const next = main[index + 1];
    if (next) transitions.push(createTransition(node.id, next.id, { sortOrder: index }));
  });
  const decision = [...main].reverse().find((node) => node.type === "DECISION");
  routes.forEach((route, routeIndex) => {
    if (decision) transitions.push(createTransition(decision.id, route.id, {
      optionKey: String(route.config.optionKey ?? route.stableKey),
      label: route.name,
      sortOrder: routeIndex,
    }));
    const branch = branchNodes.filter((node) => node.config.parentRouteId === route.id);
    if (branch[0]) transitions.push(createTransition(route.id, branch[0].id));
    branch.forEach((node, index) => {
      const next = branch[index + 1];
      if (next) transitions.push(createTransition(node.id, next.id, { sortOrder: index }));
    });
  });
  return { ...revision, nodes: [...main, ...routes, ...branchNodes, ...retained], transitions };
}

export function validateFlow(revision: FlowRevision): FlowValidationResult {
  const issues: FlowValidationIssue[] = [];
  const entries = revision.nodes.filter((node) => node.type === "ENTRY");
  const decisions = revision.nodes.filter((node) => node.type === "DECISION");
  const routes = getRouteNodes(revision);
  if (entries.length !== 1) issues.push({ message: "O fluxo precisa ter exatamente uma entrada." });
  if (!decisions.length) issues.push({ message: "Adicione uma etapa de decisão." });
  if (!routes.length) issues.push({ message: "Adicione pelo menos uma rota." });
  revision.nodes.forEach((node) => {
    if (!node.name.trim()) issues.push({ nodeId: node.id, field: "name", message: "Informe um nome para a etapa." });
    if (["MESSAGE", "DECISION", "TRIAGE"].includes(node.type) && !node.content.trim()) {
      issues.push({ nodeId: node.id, field: "content", message: "Informe a mensagem desta etapa." });
    }
    if (node.type === "TRIAGE" && !String(node.config.responseKey ?? "").trim()) {
      issues.push({ nodeId: node.id, field: "responseKey", message: "Informe a chave que guardará a resposta." });
    }
    if ((node.type === "ROUTE" || node.type === "HANDOFF") && !node.departmentId) {
      issues.push({ nodeId: node.id, field: "departmentId", message: "Selecione o departamento responsável." });
    }
  });
  routes.forEach((route) => {
    const branch = getBranchNodes(revision, route.id);
    const terminals = branch.filter((node) => node.type === "HANDOFF" || node.type === "END");
    if (!terminals.length) {
      issues.push({ nodeId: route.id, message: "A rota precisa terminar em encaminhamento ou finalização." });
    } else if (terminals.length > 1) {
      issues.push({ nodeId: route.id, message: "A rota deve possuir somente uma etapa terminal." });
    } else if (branch.at(-1)?.id !== terminals[0].id) {
      issues.push({ nodeId: terminals[0].id, message: "A etapa terminal precisa ser a última do ramo." });
    }
  });
  return { valid: issues.length === 0, issues };
}
