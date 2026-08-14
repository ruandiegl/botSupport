import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { ListConversationsQuerySchema, ListMessagesQuerySchema } from "../dist/modules/conversations/conversations.schemas.js";
import {
  ListNotificationsQuerySchema,
  NotificationIdParamSchema,
  NotificationPreferenceSchema,
} from "../dist/modules/notifications/notifications.schemas.js";

const notificationsServiceSource = readFileSync(
  join(process.cwd(), "src", "modules", "notifications", "notifications.service.ts"),
  "utf8",
);
const notificationsRepositorySource = readFileSync(
  join(process.cwd(), "src", "modules", "notifications", "notifications.repository.ts"),
  "utf8",
);
const conversationsRepositorySource = readFileSync(
  join(process.cwd(), "src", "modules", "conversations", "conversations.repository.ts"),
  "utf8",
);

test("contrato da fila aceita paginação, ordenação e período UTC", () => {
  const parsed = ListConversationsQuerySchema.safeParse({
    status: "OPEN",
    departmentId: "00000000-0000-4000-8000-000000000001",
    assignedAgentId: "me",
    dateField: "lastActivityAt",
    from: "2026-08-12T00:00:00.000Z",
    to: "2026-08-13T00:00:00.000Z",
    sort: "operational",
    page: "2",
    limit: "5",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.page, 2);
    assert.equal(parsed.data.limit, 5);
    assert.equal(parsed.data.dateField, "lastActivityAt");
  }
});

test("contrato da fila aceita filtros dos cards operacionais", () => {
  const parsed = ListConversationsQuerySchema.safeParse({ openOnly: "true", unreadOnly: "false" });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.openOnly, true);
    assert.equal(parsed.data.unreadOnly, false);
  }
});

test("contrato do histórico aceita cursor e limites seguros", () => {
  assert.deepEqual(ListMessagesQuerySchema.parse({ limit: "50", before: "opaque-cursor" }), {
    limit: 50,
    before: "opaque-cursor",
  });
  assert.equal(ListMessagesQuerySchema.safeParse({ limit: "0" }).success, false);
  assert.equal(ListMessagesQuerySchema.safeParse({ limit: "101" }).success, false);
  assert.equal(ListMessagesQuerySchema.safeParse({ extra: "x" }).success, false);
});

test("fila usa projeção resumida e não carrega histórico por linha", () => {
  assert.match(conversationsRepositorySource, /isSummary: true/);
  assert.match(conversationsRepositorySource, /messages:\s*\{\s*take:\s*1/);
  assert.match(conversationsRepositorySource, /_count:\s*\{[\s\S]*direction:\s*"IN"/);
});

test("feed ativo de notificacoes nao reexibe itens dispensados", () => {
  assert.match(notificationsRepositorySource, /dismissedAt:\s*null/);
});

test("contrato da fila rejeita filtro desconhecido, limite inválido, UUID e intervalo invertido", () => {
  assert.equal(ListConversationsQuerySchema.safeParse({ unknownFilter: "x" }).success, false);
  assert.equal(ListConversationsQuerySchema.safeParse({ limit: "4" }).success, false);
  assert.equal(ListConversationsQuerySchema.safeParse({ limit: "101" }).success, false);
  assert.equal(ListConversationsQuerySchema.safeParse({ departmentId: "not-an-uuid" }).success, false);
  assert.equal(ListConversationsQuerySchema.safeParse({
    from: "2026-08-15T00:00:00.000Z",
    to: "2026-08-14T00:00:00.000Z",
  }).success, false);
  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(ListConversationsQuerySchema.safeParse({ to: future }).success, false);
});

test("contrato de notificações restringe paginação, ids e preferências", () => {
  const query = ListNotificationsQuerySchema.parse({ unreadOnly: "true", page: "1", limit: "30" });
  assert.deepEqual(query, { unreadOnly: true, page: 1, limit: 30 });
  assert.equal(ListNotificationsQuerySchema.safeParse({ limit: "101" }).success, false);
  assert.equal(ListNotificationsQuerySchema.safeParse({ extra: "x" }).success, false);
  assert.equal(NotificationIdParamSchema.safeParse({ id: "not-an-uuid" }).success, false);
  assert.equal(NotificationPreferenceSchema.safeParse({ unresolvedReminderMinutes: 4 }).success, false);
  assert.equal(NotificationPreferenceSchema.safeParse({ reminderRepeatMinutes: 1441 }).success, false);
  assert.equal(NotificationPreferenceSchema.safeParse({ soundEnabled: true, browserEnabled: false }).success, true);
});

test("serviço de notificações mantém deduplicação, leitura, descarte e worker de lembretes", () => {
  for (const marker of [
    "createManyIdempotent",
    "markRead",
    "markAllRead",
    "dismiss",
    "createUnresolvedReminders",
    "unresolvedRemindersEnabled",
    "UNRESOLVED_REMINDER",
  ]) {
    assert.match(notificationsServiceSource, new RegExp(marker));
  }
});
