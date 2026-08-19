import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { CreateBotExclusionBodySchema, ListBotExclusionsQuerySchema, UpdateBotExclusionBodySchema } from "../dist/modules/bot-exclusions/bot-exclusions.schemas.js";
import { normalizeBotPhone } from "../dist/modules/bot-exclusions/bot-exclusions.service.js";

const zapiSource = readFileSync(join(process.cwd(), "src", "modules", "zapi", "zapi.service.ts"), "utf8");
const workerSource = readFileSync(join(process.cwd(), "src", "modules", "conversations", "inactivity.worker.ts"), "utf8");
const rbacSource = readFileSync(join(process.cwd(), "src", "modules", "rbac", "rbac.service.ts"), "utf8");

test("normaliza telefone de bloqueio sem expor ou alterar o histórico", () => {
  assert.equal(normalizeBotPhone("+55 (24) 99999-1234"), "5524999991234");
  assert.equal(CreateBotExclusionBodySchema.parse({ phone: "+55 (24) 99999-1234", label: "Bot de teste" }).phone, "5524999991234");
  assert.equal(CreateBotExclusionBodySchema.safeParse({ phone: "12" }).success, false);
  assert.equal(normalizeBotPhone("24999991234"), "5524999991234");
});

test("contrato de bloqueio valida paginação e atualização estrita", () => {
  assert.deepEqual(ListBotExclusionsQuerySchema.parse({ activeOnly: "true", page: "2", limit: "50" }), { activeOnly: true, page: 2, limit: 50 });
  assert.equal(ListBotExclusionsQuerySchema.parse({ activeOnly: "false" }).activeOnly, false);
  assert.equal(ListBotExclusionsQuerySchema.safeParse({ limit: "101" }).success, false);
  assert.equal(ListBotExclusionsQuerySchema.safeParse({ unknown: "x" }).success, false);
  assert.equal(UpdateBotExclusionBodySchema.safeParse({ isActive: false }).success, true);
  assert.equal(UpdateBotExclusionBodySchema.safeParse({}).success, false);
});

test("RBAC e rotas administrativas protegem o recurso de exclusões", () => {
  assert.match(rbacSource, /bot_exclusions/);
  assert.match(rbacSource, /\/admin\/bot-exclusions/);
  assert.match(readFileSync(join(process.cwd(), "src", "modules", "bot-exclusions", "bot-exclusions.routes.ts"), "utf8"), /requirePermission\("bot_exclusions", "delete"\)/);
  assert.match(readFileSync(join(process.cwd(), "src", "modules", "bot-exclusions", "bot-exclusions.controller.ts"), "utf8"), /remove\(params\.data\.id, req\.user\)/);
});

test("todo envio automático passa por guard e o worker não usa o canal humano", () => {
  assert.match(zapiSource, /async sendBotText/);
  assert.match(zapiSource, /async sendBotButtonList/);
  assert.match(zapiSource, /botExclusionsService\.isBlocked\(phone\)/);
  assert.match(zapiSource, /status: "bot_excluded"/);
  assert.match(workerSource, /zApiService\.sendBotText/);
  assert.doesNotMatch(workerSource, /zApiService\.sendText\(/);
});
