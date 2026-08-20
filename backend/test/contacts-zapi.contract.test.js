import assert from "node:assert/strict";
import test from "node:test";
import { parseIncomingMessage, parseSharedContact } from "../dist/modules/zapi/zapi.service.js";
import { ZApiReceivedWebhookSchema } from "../dist/modules/zapi/zapi.schemas.js";

const common = {
  messageId: "zapi-contact-message-1",
  phone: "5511999999999",
  momment: Date.now(),
  fromMe: false,
  type: "ReceivedCallback",
};

test("interpreta contato compartilhado pela estrutura oficial da Z-API", () => {
  const payload = {
    ...common,
    contact: {
      displayName: "Maria da Silva",
      vCard: "BEGIN:VCARD\nVERSION:3.0\nFN:Maria da Silva\nTEL;type=CELL;waid=5511987654321:+55 11 98765-4321\nEMAIL:maria@example.com\nORG:Grupo GTF\nNOTE:Suporte\nEND:VCARD",
      phones: [{ phone: "5511987654321", type: "CELL" }],
    },
  };

  assert.equal(ZApiReceivedWebhookSchema.safeParse(payload).success, true);
  const parsed = parseIncomingMessage(payload);
  assert.equal(parsed?.messageType, "CONTACT");
  assert.equal(parsed?.externalEventId, common.messageId);
  assert.equal(parsed?.contactShare?.displayName, "Maria da Silva");
  assert.deepEqual(parsed?.contactShare?.phones, ["5511987654321"]);
  assert.equal(parsed?.contactShare?.email, "maria@example.com");
  assert.equal(parsed?.contactShare?.organization, "Grupo GTF");
  assert.equal(parsed?.content, "Contato compartilhado: Maria da Silva");
  assert.equal("vCard" in (parsed?.contactShare ?? {}), false);
});

test("aceita vcard minúsculo, remove duplicatas e não cria cartão vazio", () => {
  const shared = parseSharedContact({
    displayName: "João",
    vcard: "BEGIN:VCARD\nFN:João\nTEL:+55 (24) 99999-1111\nTEL:+5524999991111\nEND:VCARD",
  });
  assert.deepEqual(shared?.phones, ["5524999991111"]);
  assert.equal(parseSharedContact({}), null);
});

test("payload sem contato continua seguindo o parser de texto legado", () => {
  const parsed = parseIncomingMessage({
    ...common,
    text: { message: "Olá" },
  });
  assert.equal(parsed?.messageType, undefined);
  assert.equal(parsed?.content, "Olá");
  assert.equal(parsed?.contactShare, undefined);
});
