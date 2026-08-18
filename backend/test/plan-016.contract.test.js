import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Plano 016 possui migration aditiva para identidade e auditoria", () => {
  const migration = read("prisma/migrations/20260818090000_add_message_sender_identity_and_assignments/migration.sql");
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "sender_contact_id"/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS "gtf_conversation_assignments"/);
  assert.match(migration, /sender_name_snapshot/);
  assert.match(migration, /ON DELETE SET NULL/);
  assert.match(migration, /array_append\("actions", 'delegate'\)/);
});

test("envio humano usa identidade do JWT e nunca o responsável como fallback", () => {
  const service = read("src/modules/conversations/conversations.service.ts");
  assert.match(service, /findAgentById\(user\.id\)/);
  assert.match(service, /senderNameSnapshot: agent\.name/);
  assert.doesNotMatch(service, /agent = await conversationsRepository\.findFirstAgent\(\)/);
});

test("delegação possui contrato, RBAC e notificação dedicada", () => {
  const routes = read("src/modules/conversations/conversations.routes.ts");
  const schemas = read("src/modules/conversations/conversations.schemas.ts");
  const rbac = read("src/modules/rbac/rbac.service.ts");
  const notifications = read("src/modules/notifications/notifications.service.ts");
  assert.match(routes, /\/conversations\/:id\/delegate/);
  assert.match(routes, /requirePermission\("conversations", "delegate"\)/);
  assert.match(schemas, /DelegateConversationBodySchema/);
  assert.match(rbac, /delegate/);
  assert.match(notifications, /CONVERSATION_DELEGATED/);
});

test("destinatário responde à delegação e o modal global usa Socket.IO", () => {
  const migration = read("prisma/migrations/20260818100000_add_delegation_response/migration.sql");
  const routes = read("src/modules/conversations/conversations.routes.ts");
  const repository = read("src/modules/conversations/conversations.repository.ts");
  const service = read("src/modules/conversations/conversations.service.ts");
  const notifications = read("src/modules/notifications/notifications.service.ts");
  const shell = read("../frontend/src/app/Shell.tsx");
  const modal = read("../frontend/src/components/DelegationAlertDialog.tsx");
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "response"/);
  assert.match(routes, /delegation-response/);
  assert.match(repository, /respondToDelegation/);
  assert.match(repository, /respondedAt: null, response: null/);
  assert.match(repository, /Atendimento assumido por/);
  assert.match(service, /notifyDelegationResponse/);
  assert.match(notifications, /DELEGATION_RESPONSE/);
  assert.match(notifications, /delegationAssignmentId/);
  assert.match(shell, /notification:new/);
  assert.match(modal, /button-accept-delegated-conversation/);
  assert.match(modal, /delegation-response/);
});

test("frontend renderiza o remetente por mensagem e oferece diálogo de delegação", () => {
  const page = read("../frontend/src/pages/conversation/index.tsx");
  const dialog = read("../frontend/src/pages/conversation/components/DelegationDialog.tsx");
  assert.match(page, /item\.senderName/);
  assert.match(page, /button-delegate-conversation/);
  assert.match(dialog, /SelectContent side="bottom"/);
  assert.match(dialog, /Delegar chamado/);
});
