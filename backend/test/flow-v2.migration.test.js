import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const schema = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");
const migration = readFileSync(
  join(
    process.cwd(),
    "prisma",
    "migrations",
    "20260812100000_add_versioned_flow_engine",
    "migration.sql"
  ),
  "utf8"
);

test("schema v2 declara revisões, nós, transições e eventos", () => {
  for (const model of ["FlowRevision", "FlowNode", "FlowTransition", "FlowExecutionEvent"]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }

  assert.match(schema, /enum FlowNodeType[\s\S]*ENTRY[\s\S]*MESSAGE[\s\S]*DECISION/);
  assert.match(schema, /enum FlowNodeType[\s\S]*ROUTE[\s\S]*TRIAGE[\s\S]*HANDOFF[\s\S]*END/);
});

test("conversa persiste revisão, nó atual e contexto sem remover currentStep", () => {
  assert.match(schema, /flowRevisionId\s+String\?/);
  assert.match(schema, /currentFlowNodeId\s+String\?/);
  assert.match(schema, /flowContext\s+Json\?/);
  assert.match(schema, /currentStep\s+String\?/);
});

test("migração é aditiva e preserva estruturas legadas", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "flow_revision_id"/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "current_flow_node_id"/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "flow_context"/);
  assert.doesNotMatch(migration, /DROP\s+(TABLE|COLUMN|TYPE)/i);
  assert.doesNotMatch(migration, /TRUNCATE/i);
});

test("banco garante uma publicação e chaves estáveis por revisão", () => {
  assert.match(
    migration,
    /CREATE UNIQUE INDEX IF NOT EXISTS "gtf_flow_one_published_per_definition"[\s\S]*WHERE "status" = 'PUBLISHED'/
  );
  assert.match(migration, /gtf_flow_nodes_revision_stable_key_key/);
  assert.match(migration, /gtf_flow_transitions_revision_option_key_key/);
  assert.match(migration, /gtf_flow_execution_events_external_event_id_key/);
});

test("backfill cria a jornada entry, greeting, decision, route, triage e handoff", () => {
  for (const type of ["ENTRY", "MESSAGE", "DECISION", "ROUTE", "TRIAGE", "HANDOFF"]) {
    assert.match(migration, new RegExp(`'${type}'`));
  }

  assert.match(migration, /legacy-entry-[\s\S]*legacy-greeting-/);
  assert.match(migration, /legacy-greeting-[\s\S]*legacy-decision-/);
  assert.match(migration, /legacy-decision-[\s\S]*legacy-route-/);
  assert.match(migration, /legacy-route-[\s\S]*legacy-triage-/);
  assert.match(migration, /legacy-triage-[\s\S]*legacy-handoff-/);
});

test("backfill inclui a triagem inicial solicitada e uma chave de resposta", () => {
  for (const field of [
    "Seu nome",
    "Sua emissora",
    "Sua cidade/UF",
    "Sua necessidade de suporte",
  ]) {
    assert.match(migration, new RegExp(field.replace("/", "\\/")));
  }

  assert.match(migration, /jsonb_build_object\('responseKey', 'triageDetails'\)/);
});

