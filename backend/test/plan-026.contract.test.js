import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { CreateContactBodySchema } from "../dist/modules/contacts/contacts.schemas.js";
import { ExecuteFlowInputSchema } from "../dist/modules/flow-execution/flow-execution.schemas.js";
import { FlowNodeConfigSchema } from "../dist/modules/flow/flow.schemas.js";
import { buildOptionListPayload, formatInteractiveFallback } from "../dist/modules/zapi/zapi.service.js";

const root = process.cwd();
const migration = readFileSync(join(root, "prisma", "migrations", "20260824113000_add_contact_profile_summary", "migration.sql"), "utf8");
const executionSource = readFileSync(join(root, "src", "modules", "flow-execution", "flow-execution.service.ts"), "utf8");
const zapiSource = readFileSync(join(root, "src", "modules", "zapi", "zapi.service.ts"), "utf8");

test("migração do perfil conhecido é aditiva e preserva organization", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "station"/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "city"/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "state" VARCHAR\(2\)/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "profile_confirmed_at"/);
  assert.match(migration, /SET "station" = "organization"/);
});

test("contrato do fluxo aceita categorias e resumo configurável", () => {
  const parsed = FlowNodeConfigSchema.safeParse({
    decisionMode: "CATEGORIES",
    decisionScope: "CATEGORY",
    decisionGroups: [{
      categoryKey: "infoaudio",
      label: "InfoAudio",
      items: [{ optionKey: "player", label: "Player", description: "Player do AR" }],
    }],
    knownContactSummary: {
      enabled: true,
      template: "Olá, {contactName}. {stationLine} {locationLine}",
      confirmLabel: "Sim, estão certos",
      updateLabel: "Atualizar meus dados",
      updateIntro: "Informe seu nome completo.",
    },
  });
  assert.equal(parsed.success, true);
});

test("cadastro valida emissora, cidade e UF", () => {
  const parsed = CreateContactBodySchema.safeParse({
    name: "Claiton Barbosa",
    phones: [{ phone: "5524999999999", isPrimary: true }],
    station: "FM 88 MHz",
    city: "Volta Redonda",
    state: "rj",
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.state, "RJ");
});

test("executor distingue grupo e persiste categoria e item escolhidos", () => {
  assert.equal(ExecuteFlowInputSchema.parse({ conversationId: "00000000-0000-4000-8000-000000000001", content: "Player", isNewConversation: false }).isGroup, false);
  assert.equal(ExecuteFlowInputSchema.parse({ conversationId: "00000000-0000-4000-8000-000000000001", content: "Player", isNewConversation: true, isGroup: true }).isGroup, true);
  assert.match(executionSource, /pendingCategoryKey/);
  assert.match(executionSource, /selectedCategoryKey/);
  assert.match(executionSource, /selectedItemKey/);
  assert.match(executionSource, /WAITING_ITEM/);
  assert.match(executionSource, /!input\.isGroup/);
  assert.match(zapiSource, /isGroup: Boolean\(incoming\.group\)/);
});

test("menu agrupado mantém a categoria no transporte e no fallback textual", () => {
  const options = [
    { optionKey: "player", label: "Player", categoryLabel: "InfoAudio", description: "Player do AR", departmentId: "" },
    { optionKey: "terminal", label: "Central de Aplicativos", categoryLabel: "InfoAudio", departmentId: "" },
    { optionKey: "manager", label: "Manager", categoryLabel: "InfoRadio", description: "Opec e financeiro", departmentId: "" },
  ];
  const payload = buildOptionListPayload("5511999999999", "Escolha uma opção", options);
  assert.deepEqual(payload.optionList.options.map((item) => item.id), ["player", "terminal", "manager"]);
  assert.equal(payload.optionList.options[0].description, "InfoAudio · Player do AR");
  const fallback = formatInteractiveFallback("Escolha uma opção", options);
  assert.match(fallback, /InfoAudio\n1\. Player — Player do AR[\s\S]*InfoRadio\n3\. Manager — Opec e financeiro/);
});
