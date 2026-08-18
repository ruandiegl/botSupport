import assert from "node:assert/strict";
import test from "node:test";
import { flowService, validateFlowDocument } from "../dist/modules/flow/flow.service.js";
import { flowRepository } from "../dist/modules/flow/flow.repository.js";
import { flowExecutionService } from "../dist/modules/flow-execution/flow-execution.service.js";
import { zApiRepository } from "../dist/modules/zapi/zapi.repository.js";
import { flowIntegrationRepository } from "./support/flow-integration.repository.js";

const ids = {
  entry: "00000000-0000-4000-8000-000000000001",
  decision: "00000000-0000-4000-8000-000000000002",
  route: "00000000-0000-4000-8000-000000000003",
  triage: "00000000-0000-4000-8000-000000000004",
  handoff: "00000000-0000-4000-8000-000000000005",
  department: "00000000-0000-4000-8000-000000000006",
};

function validDocument() {
  const nodes = [
    { id: ids.entry, stableKey: "entry", type: "ENTRY", name: "Entrada", content: "", sortOrder: 0 },
    { id: ids.decision, stableKey: "decision", type: "DECISION", name: "Escolha", content: "Escolha", sortOrder: 1 },
    { id: ids.route, stableKey: "support", type: "ROUTE", name: "Suporte", content: "", sortOrder: 0, departmentId: ids.department },
    { id: ids.triage, stableKey: "support-triage", type: "TRIAGE", name: "Triagem", content: "Informe os dados", sortOrder: 0, config: { responseKey: "supportDetails" } },
    { id: ids.handoff, stableKey: "support-handoff", type: "HANDOFF", name: "Encaminhar", content: "", sortOrder: 1, departmentId: ids.department },
  ];
  const transitions = [
    { id: "00000000-0000-4000-8000-000000000011", fromNodeId: ids.entry, toNodeId: ids.decision, sortOrder: 0 },
    { id: "00000000-0000-4000-8000-000000000012", fromNodeId: ids.decision, toNodeId: ids.route, optionKey: "support", label: "Suporte", sortOrder: 0 },
    { id: "00000000-0000-4000-8000-000000000013", fromNodeId: ids.route, toNodeId: ids.triage, sortOrder: 0 },
    { id: "00000000-0000-4000-8000-000000000014", fromNodeId: ids.triage, toNodeId: ids.handoff, sortOrder: 0 },
  ];
  return { revision: 1, nodes, transitions };
}

test("validador real rejeita chaves duplicadas, transição desconhecida e nó desconectado", () => {
  const document = validDocument();
  document.nodes.push({ ...document.nodes[2], id: "00000000-0000-4000-8000-000000000099" });
  document.transitions.push({ id: "00000000-0000-4000-8000-000000000098", fromNodeId: ids.decision, toNodeId: "00000000-0000-4000-8000-000000000097", optionKey: "support", sortOrder: 1 });
  const codes = validateFlowDocument(document.nodes, document.transitions).map((issue) => issue.code);
  for (const expected of ["DUPLICATE_STABLE_KEY", "DUPLICATE_OPTION_KEY", "UNKNOWN_NODE", "UNREACHABLE_NODE"]) assert.equal(codes.includes(expected), true);
});

test("salvamento rejeita HANDOFF ligado a departamento inexistente antes do PostgreSQL", async () => {
  const result = await flowService.saveDraft("00000000-0000-4000-8000-000000000090", validDocument());
  assert.equal(result.valid, false);
  assert.equal(result.issues.some((issue) => issue.code === "DEPARTMENT_NOT_FOUND"), true);
});

test("executor reserva externalEventId de forma idempotente sob callbacks concorrentes", async () => {
  const fixture = await flowIntegrationRepository.createFixture();
  try {
    const eventId = `flow-test-${Date.now()}-${Math.random()}`;
    const results = await Promise.all([zApiRepository.claimExternalEvent(fixture.conversation.id, eventId), zApiRepository.claimExternalEvent(fixture.conversation.id, eventId)]);
    assert.deepEqual(results.sort(), [false, true]);
  } finally { await flowIntegrationRepository.cleanup(fixture); }
});

test("conversa antiga permanece vinculada à revisão em que começou após nova publicação", async () => {
  const fixture = await flowIntegrationRepository.createFixture();
  try {
    const draft = await flowRepository.createDraftFrom(fixture.revision.id);
    await flowRepository.publish(draft.id, fixture.agent.id);
    const conversation = await flowIntegrationRepository.getConversation(fixture.conversation.id);
    assert.equal(conversation.flowRevisionId, fixture.revision.id);
  } finally { await flowIntegrationRepository.cleanup(fixture); }
});

test("rollback de falha de entrega restaura nó e contexto anteriores", async () => {
  const fixture = await flowIntegrationRepository.createFixture();
  try {
    await flowIntegrationRepository.updateConversation(fixture.conversation.id, { currentFlowNodeId: fixture.triage.id, flowContext: { transient: true } });
    await flowExecutionService.rollbackDelivery(fixture.conversation.id, fixture.decision.id, { original: true });
    const conversation = await flowIntegrationRepository.getConversation(fixture.conversation.id);
    assert.equal(conversation.currentFlowNodeId, fixture.decision.id);
    assert.deepEqual(conversation.flowContext, { original: true });
  } finally { await flowIntegrationRepository.cleanup(fixture); }
});

test("motor executa decisão, triagem editável e handoff sem transporte externo", async () => {
  const fixture = await flowIntegrationRepository.createFixture();
  try {
    const welcome = await flowExecutionService.execute({ conversationId: fixture.conversation.id, content: "Olá", isNewConversation: true });
    assert.equal(welcome.status, "waiting_decision");
    assert.equal(welcome.actions.some((action) => action.type === "SEND_OPTIONS" && action.options[0]?.optionKey === "support"), true);
    const textSelection = await flowExecutionService.inspectInput(fixture.conversation.id, "Suporte");
    assert.deepEqual(textSelection, { nodeType: "DECISION", isDecisionSelection: true });

    const selected = await flowExecutionService.execute({ conversationId: fixture.conversation.id, content: "Suporte", isNewConversation: false });
    assert.equal(selected.status, "waiting_triage");
    assert.equal(selected.actions.some((action) => action.type === "SEND_TEXT" && action.content === "Dados"), true);
    let conversation = await flowIntegrationRepository.getConversation(fixture.conversation.id);
    assert.equal(conversation.status, "OPEN");
    assert.equal(conversation.currentFlowNodeId, fixture.triage.id);

    const handoff = await flowExecutionService.execute({ conversationId: fixture.conversation.id, content: "Nome, emissora, cidade e necessidade", isNewConversation: false });
    assert.equal(handoff.status, "routed_to_department");
    conversation = await flowIntegrationRepository.getConversation(fixture.conversation.id);
    assert.equal(conversation.status, "OPEN");
    assert.equal(conversation.departmentId, fixture.department.id);
    assert.equal(conversation.flowContext.details, "Nome, emissora, cidade e necessidade");
  } finally { await flowIntegrationRepository.cleanup(fixture); }
});
