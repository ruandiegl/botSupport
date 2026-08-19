import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  FlowNodeInputSchema,
  SaveDraftBodySchema,
} from "../dist/modules/flow/flow.schemas.js";

const serviceSource = readFileSync(join(process.cwd(), "src", "modules", "flow", "flow.service.ts"), "utf8");

const ids = {
  entry: "00000000-0000-4000-8000-000000000001",
  decision: "00000000-0000-4000-8000-000000000002",
  route: "00000000-0000-4000-8000-000000000003",
  triage: "00000000-0000-4000-8000-000000000004",
  handoff: "00000000-0000-4000-8000-000000000005",
  department: "00000000-0000-4000-8000-000000000006",
  t1: "00000000-0000-4000-8000-000000000011",
  t2: "00000000-0000-4000-8000-000000000012",
  t3: "00000000-0000-4000-8000-000000000013",
  t4: "00000000-0000-4000-8000-000000000014",
  submenu: "00000000-0000-4000-8000-000000000007",
  t5: "00000000-0000-4000-8000-000000000015",
};

function validDocument() {
  return {
    revision: 1,
    nodes: [
      { id: ids.entry, stableKey: "entry", type: "ENTRY", name: "Entrada", content: "", sortOrder: 0 },
      { id: ids.decision, stableKey: "decision", type: "DECISION", name: "Escolha", content: "Escolha", sortOrder: 1 },
      { id: ids.route, stableKey: "support", type: "ROUTE", name: "Suporte", content: "", sortOrder: 0, departmentId: ids.department },
      { id: ids.triage, stableKey: "support-triage", type: "TRIAGE", name: "Triagem", content: "Informe os dados", sortOrder: 0, config: { responseKey: "supportDetails" } },
      { id: ids.handoff, stableKey: "support-handoff", type: "HANDOFF", name: "Encaminhar", content: "", sortOrder: 1, departmentId: ids.department },
    ],
    transitions: [
      { id: ids.t1, fromNodeId: ids.entry, toNodeId: ids.decision, sortOrder: 0 },
      { id: ids.t2, fromNodeId: ids.decision, toNodeId: ids.route, optionKey: "support", label: "Suporte", sortOrder: 0 },
      { id: ids.t3, fromNodeId: ids.route, toNodeId: ids.triage, sortOrder: 0 },
      { id: ids.t4, fromNodeId: ids.triage, toNodeId: ids.handoff, sortOrder: 0 },
    ],
  };
}

test("aceita documento v2 com rota, triagem e handoff", () => {
  const parsed = SaveDraftBodySchema.safeParse(validDocument());
  assert.equal(parsed.success, true);
});

test("aceita submenu de botões com ids estáveis dentro da rota", () => {
  const document = validDocument();
  document.nodes.push({
    id: ids.submenu,
    stableKey: "support-submenu",
    type: "DECISION",
    name: "Assunto",
    content: "Qual é o assunto?",
    sortOrder: 0,
    config: {
      parentRouteId: ids.route,
      decisionScope: "ROUTE",
      decisionOptions: [
        { optionKey: "support-password", label: "Acesso e senha" },
        { optionKey: "support-network", label: "Rede e Internet", description: "Conectividade" },
      ],
    },
  });
  document.transitions = document.transitions.filter((transition) => transition.id !== ids.t3);
  document.transitions.push(
    { id: ids.t3, fromNodeId: ids.route, toNodeId: ids.submenu, sortOrder: 0 },
    { id: ids.t5, fromNodeId: ids.submenu, toNodeId: ids.triage, optionKey: "support-password", label: "Acesso e senha", sortOrder: 0 },
    { id: "00000000-0000-4000-8000-000000000016", fromNodeId: ids.submenu, toNodeId: ids.triage, optionKey: "support-network", label: "Rede e Internet", sortOrder: 1 },
  );
  assert.equal(SaveDraftBodySchema.safeParse(document).success, true);
});

test("rejeita UUID, texto e quantidade fora dos limites", () => {
  assert.equal(FlowNodeInputSchema.safeParse({
    id: "não-é-uuid",
    stableKey: "x",
    type: "MESSAGE",
    name: "Mensagem",
    content: "a".repeat(4001),
    sortOrder: 0,
  }).success, false);

  assert.equal(SaveDraftBodySchema.safeParse({ revision: 1, nodes: [], transitions: [] }).success, false);
  assert.equal(SaveDraftBodySchema.safeParse({ ...validDocument(), revision: 0 }).success, false);
});

test("serviço declara validações estruturais mínimas do grafo", () => {
  for (const code of [
    "ENTRY_COUNT",
    "DUPLICATE_STABLE_KEY",
    "INVALID_TRIAGE",
    "HANDOFF_WITHOUT_DEPARTMENT",
    "UNKNOWN_NODE",
    "DUPLICATE_OPTION_KEY",
    "DECISION_WITHOUT_OPTIONS",
    "DECISION_WITHOUT_OPTION_KEY",
    "DECISION_OPTIONS_MISMATCH",
    "DECISION_OPTION_WITHOUT_TERMINAL",
    "TRIAGE_NEXT",
    "UNREACHABLE_NODE",
    "CYCLE",
    "ROUTE_WITHOUT_TERMINAL",
  ]) {
    assert.match(serviceSource, new RegExp(`code: "${code}"`));
  }
});

test("adaptador legado contém a triagem inicial e ligação até o handoff", () => {
  assert.match(serviceSource, /Você selecionou a equipe Suporte/);
  assert.match(serviceSource, /Seu nome[\s\S]*Sua emissora[\s\S]*Sua cidade\/UF[\s\S]*Sua necessidade de suporte/);
  assert.match(serviceSource, /config: \{ responseKey: "triageDetails" \}/);
  assert.match(serviceSource, /fromNodeId: triage, toNodeId: handoff/);
});
