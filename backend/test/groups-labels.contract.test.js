import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { buildGroupAlreadyOpenMessage, isInstanceMentioned, parseIncomingMessage } from "../dist/modules/zapi/zapi.service.js";
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
  assert.equal(ZApiReceivedWebhookSchema.safeParse({ ...groupPayload, mentioned: "5511888888888@s.whatsapp.net" }).success, true);
  assert.equal(ZApiReceivedWebhookSchema.safeParse({ ...groupPayload, mentions: { jid: "5511888888888@s.whatsapp.net" } }).success, true);
  assert.equal(ZApiReceivedWebhookSchema.safeParse({ ...groupPayload, mentionedJids: Array.from({ length: 101 }, (_, index) => String(index)) }).success, false);
});

test("parser vincula a conversa ao participante, não ao JID do grupo", () => {
  const parsed = parseIncomingMessage(groupPayload);
  assert.equal(parsed?.phone, "5511999999999");
  assert.equal(parsed?.senderName, "Participante");
  assert.equal(parsed?.group?.name, "Suporte técnico");
  assert.equal(parsed?.group?.jid, groupPayload.phone);
});

test("parser prioriza o nome do participante e nunca o nome do grupo", () => {
  const parsed = parseIncomingMessage({
    ...groupPayload,
    senderName: "João Valente",
  });
  assert.equal(parsed?.senderName, "João Valente");

  const malformed = parseIncomingMessage({
    ...groupPayload,
    senderName: groupPayload.chatName,
  });
  assert.equal(malformed?.senderName, "Participante");
});

test("aviso de chamado já aberto identifica quem mencionou o bot", () => {
  const message = buildGroupAlreadyOpenMessage("João Valente");
  assert.match(message, /João Valente/);
  assert.match(message, /já existe um chamado aberto neste grupo/i);
  assert.doesNotMatch(message, /Suporte técnico/);
});

test("modo unificado não envia a confirmação legada de redirecionamento ao privado", async () => {
  const service = await readFile(new URL("../src/modules/zapi/zapi.service.ts", import.meta.url), "utf8");
  assert.match(service, /config\.groupConversationMode !== "IN_GROUP" && \(isNewConversation \|\| groupMentioned\)/);
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

test("reconhece JID de grupo mesmo sem isGroup e sem o sufixo @g.us", () => {
  const payload = {
    ...groupPayload,
    isGroup: undefined,
    phone: "120363000000000000-1234567890",
  };
  const parsed = parseIncomingMessage(payload);
  assert.equal(parsed?.phone, "5511999999999");
  assert.equal(parsed?.group?.jid, payload.phone);
});

test("somente a menção da própria instância ativa o bot no grupo", () => {
  const instancePhone = "5511966666666";
  const instanceLid = "81896604192873@lid";
  assert.equal(isInstanceMentioned({ mentioned: [instancePhone] }, instancePhone), true);
  assert.equal(isInstanceMentioned({ mentionedJids: [`${instancePhone}@s.whatsapp.net`] }, instancePhone), true);
  assert.equal(isInstanceMentioned({ text: { contextInfo: { mentionedJid: [`${instancePhone}@s.whatsapp.net`] } } }, instancePhone), true);
  assert.equal(isInstanceMentioned({ mentioned: ["5511777777777"], text: { message: "@Letícia, pode ajudar?" } }, instancePhone), false);
  assert.equal(isInstanceMentioned({ text: { message: "@Letícia, pode ajudar?" } }, instancePhone), false);
  assert.equal(isInstanceMentioned({ text: { message: `@${instancePhone} preciso de suporte` } }, instancePhone), true);
  assert.equal(isInstanceMentioned({ text: { message: "@551166666666 preciso de suporte" } }, instancePhone), true);
  assert.equal(isInstanceMentioned({ text: { message: "@~Suporte Técnico preciso de ajuda" } }, instancePhone, ["Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ text: "@~Suporte Técnico" }, instancePhone, ["Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ messageData: { extendedText: { body: "@~Suporte Técnico" } } }, instancePhone, ["Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ messageData: { contextInfo: { mentioned: { jid: `${instancePhone}@s.whatsapp.net` } } } }, instancePhone), true);
  assert.equal(isInstanceMentioned({ text: { message: "@\u2068~Suporte Técnico\u2069" } }, instancePhone, ["Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ text: { message: "@~Suporte Técnico" } }, "", ["Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ text: { message: "Suporte Técnico" } }, instancePhone, ["Suporte Técnico"]), false);
  assert.equal(isInstanceMentioned({ text: { message: "@~ Suporte Técnico" } }, instancePhone, ["@~Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ text: { message: "@Suporte-Técnico" } }, instancePhone, ["Suporte Técnico"]), true);
  assert.equal(isInstanceMentioned({ text: { message: "@Letícia" }, quotedMessage: { text: "@~Suporte Técnico" } }, instancePhone, ["Suporte Técnico"]), false);
  assert.equal(isInstanceMentioned({ mentioned: ["5511777777777"], text: { message: "@~Suporte Técnico" } }, instancePhone, ["Suporte Técnico"]), false);
  assert.equal(isInstanceMentioned({ mentioned: [instanceLid], text: { message: "@81896604192873" } }, instancePhone, ["Suporte Técnico"], [instanceLid]), true);
  assert.equal(isInstanceMentioned({ text: { message: "@81896604192873" } }, instancePhone, ["Suporte Técnico"], [instanceLid]), true);
  assert.equal(isInstanceMentioned({ text: { message: "@~Suporte Técnico" } }, instancePhone, ["Suporte Técnico"], [instanceLid]), false);
  assert.equal(isInstanceMentioned({ mentioned: ["77777777777777@lid"], text: { message: "@~Suporte Técnico" } }, instancePhone, ["Suporte Técnico"], [instanceLid]), false);
  assert.equal(isInstanceMentioned({ text: { message: "@77777777777777" } }, instancePhone, ["Suporte Técnico"], [instanceLid]), false);
});

test("migration da identidade LID da instância é aditiva", async () => {
  const sql = await readFile(new URL("../prisma/migrations/20260819110000_add_zapi_instance_lid/migration.sql", import.meta.url), "utf8");
  assert.match(sql, /ADD COLUMN IF NOT EXISTS "instance_lid" TEXT/);
  assert.doesNotMatch(sql, /DROP TABLE|DROP COLUMN|TRUNCATE/i);
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
