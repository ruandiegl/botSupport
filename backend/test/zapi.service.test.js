import assert from "node:assert/strict";
import test from "node:test";
import {
  buildButtonListPayload,
  buildOptionListPayload,
  findSelectedOption,
  parseIncomingMessage,
} from "../dist/modules/zapi/zapi.service.js";

const options = [
  { label: "Suporte", departmentId: "support" },
  { label: "Rede / Internet", departmentId: "network" },
  { label: "Áudio / Vídeo", departmentId: "av" },
];

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
