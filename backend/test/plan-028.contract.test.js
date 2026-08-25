import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("plan 028 mantém migrations aditivas e separa auditoria de saída", async () => {
  const schema = await read("prisma/schema.prisma");
  const auditMigration = await read("prisma/migrations/20260825120000_add_group_chat_audit/migration.sql");
  const outboundMigration = await read("prisma/migrations/20260825123000_add_group_outbound_messages/migration.sql");
  assert.match(schema, /model GroupChat/);
  assert.match(schema, /model GroupMessage/);
  assert.match(schema, /model GroupOutboundMessage/);
  assert.match(auditMigration, /CREATE TABLE "gtf_group_chats"/);
  assert.match(auditMigration, /gtf_conversations_one_open_group_idx/);
  assert.doesNotMatch(auditMigration, /gtf_group_outbound_messages/);
  assert.match(outboundMigration, /CREATE TABLE "gtf_group_outbound_messages"/);
});

test("runtime preserva JID do grupo e usa o participante para exclusões", async () => {
  const service = await read("src/modules/zapi/zapi.service.ts");
  assert.match(service, /targetPhone/);
  assert.match(service, /formatTarget\(phone\)/);
  assert.match(service, /groupConversationMode === "IN_GROUP"/);
  assert.match(service, /sendDirectGroupMessage/);
  assert.match(service, /groupResponseMode === "ORIGIN_PARTICIPANT"/);
});

test("API e tela de grupos possuem catálogo, histórico e envio protegido", async () => {
  const routes = await read("src/modules/zapi/zapi.routes.ts");
  const page = await read("../frontend/src/pages/groups/index.tsx");
  const socket = await read("src/shared/socket.ts");
  const scroller = await read("../frontend/src/components/ui/chat-scroller.tsx");
  assert.match(routes, /router\.get\("\/zapi\/groups/);
  assert.match(routes, /router\.post\("\/zapi\/groups\/:groupId\/messages/);
  assert.match(routes, /router\.post\("\/zapi\/groups\/:groupId\/media/);
  assert.match(routes, /router\.post\("\/zapi\/groups\/:groupId\/read/);
  assert.match(socket, /group:join/);
  assert.match(socket, /group:typing:start/);
  assert.match(page, /\/zapi\/groups/);
  assert.match(page, /Enviar no grupo/);
  assert.match(page, /MediaAttachmentPicker/);
  assert.match(page, /ShortcutPicker/);
  assert.match(page, /MessageMedia/);
  assert.match(page, /ChatScroller/);
  assert.match(scroller, /Ir para a mensagem mais recente/);
});

test("mídias enviadas em grupos mantêm apenas metadados de auditoria", async () => {
  const schema = await read("prisma/schema.prisma");
  const migration = await read("prisma/migrations/20260825190000_group_chat_media/migration.sql");
  const service = await read("src/modules/zapi/zapi.service.ts");
  assert.match(schema, /messageType\s+String\s+@default\("TEXT"\)/);
  assert.match(schema, /mimeType\s+String\?/);
  assert.match(schema, /sizeBytes\s+Int\?/);
  assert.match(migration, /ADD COLUMN "message_type"/);
  assert.match(service, /sendDirectGroupMedia/);
  assert.match(service, /validateOutgoingMedia/);
});
