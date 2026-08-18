import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { isInstanceMentioned, parseIncomingMessage } from "../dist/modules/zapi/zapi.service.js";
import { UpdateZApiConfigSchema, ZApiReceivedWebhookSchema } from "../dist/modules/zapi/zapi.schemas.js";
import { ListConversationsQuerySchema } from "../dist/modules/conversations/conversations.schemas.js";

const groupPayload = {
  messageId: "group-message-1",
  phone: "120363000000000000@g.us",
  participant: "5511999999999@s.whatsapp.net",
  mentionedJids: ["5511888888888@s.whatsapp.net"],
  momment: Date.now(),
  fromMe: false,
  type: "ReceivedCallback",
  isGroup: true,
  chatName: "Suporte técnico",
  text: { message: "Preciso de ajuda" },
};

test("callback de grupo valida participante e até 100 menções", () => {
  assert.equal(ZApiReceivedWebhookSchema.safeParse(groupPayload).success, true);
  assert.equal(ZApiReceivedWebhookSchema.safeParse({ ...groupPayload, mentionedJids: Array.from({ length: 101 }, (_, index) => String(index)) }).success, false);
});

test("parser vincula a conversa ao participante, não ao JID do grupo", () => {
  const parsed = parseIncomingMessage(groupPayload);
  assert.equal(parsed?.phone, "5511999999999");
  assert.equal(parsed?.group?.name, "Suporte técnico");
  assert.equal(parsed?.group?.jid, groupPayload.phone);
});

test("aceita o formato oficial da Z-API para participante e telefone conectado", () => {
  const payload = {
    ...groupPayload,
    participant: undefined,
    participantPhone: "5511777777777",
    participantLid: "81896604192873@lid",
    connectedPhone: "5511666666666",
  };
  assert.equal(ZApiReceivedWebhookSchema.safeParse(payload).success, true);
  assert.equal(parseIncomingMessage(payload)?.phone, "5511777777777");
});

test("somente a menção da própria instância ativa o bot no grupo", () => {
  const instancePhone = "5511666666666";
  assert.equal(isInstanceMentioned({ mentioned: [instancePhone] }, instancePhone), true);
  assert.equal(isInstanceMentioned({ mentionedJids: [`${instancePhone}@s.whatsapp.net`] }, instancePhone), true);
  assert.equal(isInstanceMentioned({ text: { contextInfo: { mentionedJid: [`${instancePhone}@s.whatsapp.net`] } } }, instancePhone), true);
  assert.equal(isInstanceMentioned({ mentioned: ["5511777777777"], text: { message: "@Letícia, pode ajudar?" } }, instancePhone), false);
  assert.equal(isInstanceMentioned({ text: { message: "@Letícia, pode ajudar?" } }, instancePhone), false);
  assert.equal(isInstanceMentioned({ text: { message: `@${instancePhone} preciso de suporte` } }, instancePhone), true);
});

test("configuração de grupos valida cooldown e variáveis permitidas", () => {
  const base = { instanceId: "instance", token: "token", groupsEnabled: true };
  assert.equal(UpdateZApiConfigSchema.safeParse({ ...base, groupCooldownSeconds: 60, groupConfirmMessage: "Olá {{nome}}, grupo {{grupo}}" }).success, true);
  assert.equal(UpdateZApiConfigSchema.safeParse({ ...base, groupCooldownSeconds: 2 }).success, false);
  assert.equal(UpdateZApiConfigSchema.safeParse({ ...base, groupConfirmMessage: "Token {{segredo}}" }).success, false);
});

test("fila aceita etiquetas como UUIDs e rejeita identificadores inválidos", () => {
  const first = "0f81cf55-9aec-4d0c-b3a1-95b2d538a21c";
  const second = "1208f635-874c-4394-aee4-fb1fd274de6f";
  const valid = ListConversationsQuerySchema.parse({ labelIds: `${first},${second}` });
  assert.deepEqual(valid.labelIds, [first, second]);
  assert.equal(ListConversationsQuerySchema.safeParse({ labelIds: "label-system-group" }).success, false);
});

test("migration de etiquetas é aditiva, idempotente no seed e protege o cooldown", async () => {
  const sql = await readFile(new URL("../prisma/migrations/20260817090000_add_group_mentions_and_labels/migration.sql", import.meta.url), "utf8");
  assert.match(sql, /CREATE TABLE "gtf_labels"/);
  assert.match(sql, /CREATE TABLE "gtf_conversation_labels"/);
  assert.match(sql, /CREATE TABLE "gtf_group_mention_cooldowns"/);
  assert.match(sql, /ON CONFLICT \("slug"\) DO NOTHING/);
  assert.match(sql, /BETWEEN 5 AND 3600/);
  assert.doesNotMatch(sql, /DROP TABLE|DROP COLUMN|TRUNCATE/i);
});
