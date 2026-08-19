import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { agentWorkloadQuerySchema } from "../dist/modules/agents/agents.schemas.js";

const read = (relative) => readFileSync(join(process.cwd(), relative), "utf8");

test("contrato de carga aceita escopo seguro e aplica defaults", () => {
  const parsed = agentWorkloadQuerySchema.parse({});
  assert.deepEqual(parsed, { includeOffline: true, limit: 100 });
  assert.deepEqual(
    agentWorkloadQuerySchema.parse({
      departmentId: "00000000-0000-4000-8000-000000000001",
      includeOffline: "false",
      limit: "25",
    }),
    {
      departmentId: "00000000-0000-4000-8000-000000000001",
      includeOffline: false,
      limit: 25,
    },
  );
  assert.equal(agentWorkloadQuerySchema.safeParse({ limit: "0" }).success, false);
  assert.equal(agentWorkloadQuerySchema.safeParse({ limit: "101" }).success, false);
  assert.equal(agentWorkloadQuerySchema.safeParse({ departmentId: "not-an-uuid" }).success, false);
  assert.equal(agentWorkloadQuerySchema.safeParse({ unknown: "x" }).success, false);
});

test("endpoint e consulta de carga filtram somente chamados em atendimento", () => {
  const routes = read("src/modules/agents/agents.routes.ts");
  const service = read("src/modules/agents/agents.service.ts");
  const repository = read("src/modules/agents/agents.repository.ts");
  assert.match(routes, /\/agents\/workload/);
  assert.match(routes, /requirePermission\("queue", "view_all"\)/);
  assert.match(service, /actor\.role === "AGENT"/);
  assert.match(service, /actor\.role === "SUPERVISOR"/);
  assert.match(repository, /where: \{ status: "IN_PROGRESS" \}/);
  assert.match(repository, /messages: \{ where: \{ direction: "IN", readAt: null \} \}/);
  assert.doesNotMatch(repository, /messages:\s*\{\s*take:/);
});

test("fila exibe carga acima do pulso e revalida com eventos operacionais", () => {
  const queue = read("../frontend/src/pages/queue/index.tsx");
  const workloadCard = read("../frontend/src/pages/queue/components/AgentWorkloadCard.tsx");
  const workloadHook = read("../frontend/src/hooks/use-agent-workload.ts");
  const agentsPage = read("../frontend/src/pages/admin/agents/index.tsx");
  const shell = read("../frontend/src/app/Shell.tsx");
  const api = read("../docs/API.md");
  assert.match(queue, /<AgentWorkloadCard/);
  assert.match(queue, /<QueueCard/);
  assert.ok(queue.indexOf("<AgentWorkloadCard") < queue.indexOf("<QueueCard"));
  assert.match(workloadCard, /Atendentes online/);
  assert.match(workloadCard, /Online/);
  assert.match(workloadCard, /Offline/);
  assert.match(workloadCard, /limit = 4/);
  assert.match(workloadCard, /Ver todos/);
  assert.match(workloadCard, /href="\/admin\/agents"/);
  assert.match(workloadCard, /\/conversation\/\$\{conversation\.id\}/);
  assert.match(workloadHook, /limit=\$\{limit\}/);
  assert.match(agentsPage, /Chamados ativos por atendente/);
  assert.match(agentsPage, /activeConversationCount/);
  assert.match(agentsPage, /layout="grid"/);
  assert.match(shell, /\["agent-workload"\]/);
  assert.match(api, /GET `?\/agents\/workload/);
});
