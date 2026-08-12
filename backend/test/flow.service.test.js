import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { legacyToDocument, validateFlowDocument } from "../dist/modules/flow/flow.service.js";

test("converte fluxo legado em nós v2 com triagem editável e IDs estáveis", () => {
  const document = legacyToDocument({ name: "Fluxo", greeting: "Olá", menuMessage: "Escolha", options: [{ label: "Suporte", departmentId: randomUUID(), procedureMessage: "" }] });
  assert.equal(document.nodes.find((node) => node.type === "TRIAGE")?.content.includes("Sua emissora"), true);
  assert.equal(document.transitions.find((transition) => transition.optionKey)?.optionKey, "route-suporte-1");
  assert.deepEqual(validateFlowDocument(document.nodes, document.transitions), []);
});

test("rejeita triagem sem chave de resposta e handoff sem departamento", () => {
  const entry = { id: randomUUID(), stableKey: "entry", type: "ENTRY", name: "Entrada", content: "", sortOrder: 0 };
  const triage = { id: randomUUID(), stableKey: "triage", type: "TRIAGE", name: "Triagem", content: "Pergunta", sortOrder: 1, config: {} };
  const handoff = { id: randomUUID(), stableKey: "handoff", type: "HANDOFF", name: "Fila", content: "", sortOrder: 2 };
  const transitions = [{ id: randomUUID(), fromNodeId: entry.id, toNodeId: triage.id, sortOrder: 0 }, { id: randomUUID(), fromNodeId: triage.id, toNodeId: handoff.id, sortOrder: 0 }];
  const codes = validateFlowDocument([entry, triage, handoff], transitions).map((issue) => issue.code);
  assert.equal(codes.includes("INVALID_TRIAGE"), true);
  assert.equal(codes.includes("HANDOFF_WITHOUT_DEPARTMENT"), true);
});

test("rejeita ciclos alcançáveis", () => {
  const entry = { id: randomUUID(), stableKey: "entry", type: "ENTRY", name: "Entrada", content: "", sortOrder: 0 };
  const message = { id: randomUUID(), stableKey: "message", type: "MESSAGE", name: "Mensagem", content: "Olá", sortOrder: 1 };
  const transitions = [{ id: randomUUID(), fromNodeId: entry.id, toNodeId: message.id, sortOrder: 0 }, { id: randomUUID(), fromNodeId: message.id, toNodeId: entry.id, sortOrder: 0 }];
  assert.equal(validateFlowDocument([entry, message], transitions).some((issue) => issue.code === "CYCLE"), true);
});

test("rejeita rota sem etapa terminal", () => {
  const entry = { id: randomUUID(), stableKey: "entry", type: "ENTRY", name: "Entrada", content: "", sortOrder: 0 };
  const route = { id: randomUUID(), stableKey: "route", type: "ROUTE", name: "Rota", content: "", sortOrder: 1 };
  const message = { id: randomUUID(), stableKey: "message", type: "MESSAGE", name: "Mensagem", content: "Olá", sortOrder: 2 };
  const transitions = [{ id: randomUUID(), fromNodeId: entry.id, toNodeId: route.id, sortOrder: 0 }, { id: randomUUID(), fromNodeId: route.id, toNodeId: message.id, sortOrder: 0 }];
  assert.equal(validateFlowDocument([entry, route, message], transitions).some((issue) => issue.code === "ROUTE_WITHOUT_TERMINAL"), true);
});
