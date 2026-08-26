import assert from "node:assert/strict";
import test from "node:test";
import {
  buildButtonListPayload,
  buildOptionListPayload,
  findSelectedOption,
  normalizeZApiTarget,
  parseIncomingMessage,
  parseZApiTimestamp,
} from "../dist/modules/zapi/zapi.service.js";
import { ZApiDeliveryWebhookSchema } from "../dist/modules/zapi/zapi.schemas.js";

const options = [
  { label: "Suporte", departmentId: "support" },
  { label: "Rede / Internet", departmentId: "network" },
  { label: "Áudio / Vídeo", departmentId: "av" },
];

test("normaliza timestamps numéricos retornados pela lista de grupos da Z-API", () => {
  assert.equal(parseZApiTimestamp("1730918668000")?.getTime(), 1730918668000);
  assert.equal(parseZApiTimestamp(1730918668)?.getTime(), 1730918668000);
  assert.equal(parseZApiTimestamp("not-a-date"), null);
});

test("normaliza destinos de grupo para o formato aceito pela Z-API", () => {
  assert.equal(normalizeZApiTarget("120363019502650977-group@g.us"), "120363019502650977-group");
  assert.equal(normalizeZApiTarget("5511999999999-1623275280@g.us"), "5511999999999-1623275280");
  assert.equal(normalizeZApiTarget("120363019502650977-group"), "120363019502650977-group");
  assert.equal(normalizeZApiTarget("99999999999@lid"), "99999999999@lid");
});

test("interpreta mensagem de texto recebida da Z-API", () => {
  const message = parseIncomingMessage({
    type: "ReceivedCallback",
    fromMe: false,
    isGroup: false,
    phone: "5511999999999",
    senderName: "Cliente",
    text: { message: "Olá" },
  });

  assert.deepEqual(message, {
    phone: "5511999999999",
    senderName: "Cliente",
    content: "Olá",
    selectedOptionId: undefined,
  });
});

test("interpreta a resposta de um botão", () => {
  const message = parseIncomingMessage({
    type: "ReceivedCallback",
    fromMe: false,
    phone: "5511999999999",
    buttonsResponseMessage: { buttonId: "2", message: "Rede / Internet" },
  });

  assert.equal(message?.selectedOptionId, "2");
  assert.equal(message?.content, "Rede / Internet");
  assert.equal(findSelectedOption(options, message.content, message.selectedOptionId)?.departmentId, "network");
});

test("interpreta a resposta de uma lista de opções", () => {
  const message = parseIncomingMessage({
    type: "ReceivedCallback",
    fromMe: false,
    phone: "5511999999999",
    referenceMessageId: "prompt-123",
    listResponseMessage: {
      selectedRowId: "3",
      title: "Áudio / Vídeo",
      message: "Equipe selecionada",
    },
  });

  assert.equal(message?.selectedOptionId, "3");
  assert.equal(message?.referenceMessageId, "prompt-123");
  assert.equal(findSelectedOption(options, message.content, message.selectedOptionId)?.departmentId, "av");
});

test("gera o payload oficial de lista de opções com ids estáveis", () => {
  const nested = [
    { optionKey: "support-password", label: "Acesso e senha", description: "Redefinição ou bloqueio", departmentId: "support" },
    { optionKey: "support-network", label: "Rede e Internet", departmentId: "support" },
  ];
  assert.deepEqual(buildOptionListPayload("5511999999999", "Qual é o assunto?", nested), {
    phone: "5511999999999",
    message: "Qual é o assunto?",
    optionList: {
      title: "Opções disponíveis",
      buttonLabel: "Ver opções",
      options: [
        { id: "support-password", title: "Acesso e senha", description: "Redefinição ou bloqueio" },
        { id: "support-network", title: "Rede e Internet" },
      ],
    },
  });
});

test("não duplica o título quando a descrição opcional está vazia", () => {
  const payload = buildOptionListPayload("5511999999999", "Qual é o assunto?", [
    { optionKey: "support", label: "Suporte", description: "   ", departmentId: "support" },
    { optionKey: "network", label: "Rede", description: "Conectividade", departmentId: "support" },
  ]);

  assert.deepEqual(payload.optionList.options, [
    { id: "support", title: "Suporte" },
    { id: "network", title: "Rede", description: "Conectividade" },
  ]);
});

test("ignora callbacks que não são mensagens de clientes", () => {
  assert.equal(parseIncomingMessage({ type: "DeliveryCallback", phone: "5511999999999" }), null);
  assert.equal(
    parseIncomingMessage({ type: "ReceivedCallback", phone: "5511999999999", fromMe: true }),
    null
  );
  assert.equal(
    parseIncomingMessage({
      type: "ReceivedCallback",
      phone: "5511999999999",
      notification: "CALL_VOICE",
    }),
    null
  );
});

test("valida callback de entrega com messageId ou zaapId", () => {
  assert.equal(ZApiDeliveryWebhookSchema.safeParse({
    type: "DeliveryCallback",
    phone: "5511999999999",
    messageId: "provider-message-1",
    momment: 1730918668000,
    error: null,
  }).success, true);
  assert.equal(ZApiDeliveryWebhookSchema.safeParse({
    type: "DeliveryCallback",
    phone: "5511999999999",
    zaapId: "provider-zaap-1",
    error: "media rejected",
  }).success, true);
  assert.equal(ZApiDeliveryWebhookSchema.safeParse({
    type: "DeliveryCallback",
    phone: "5511999999999",
  }).success, false);
});

test("gera o payload oficial de botões da Z-API", () => {
  assert.deepEqual(buildButtonListPayload("5511999999999", "Escolha uma equipe", options), {
    phone: "5511999999999",
    message: "Escolha uma equipe",
    buttonList: {
      buttons: [
        { id: "1", label: "Suporte" },
        { id: "2", label: "Rede / Internet" },
        { id: "3", label: "Áudio / Vídeo" },
      ],
    },
  });
});
