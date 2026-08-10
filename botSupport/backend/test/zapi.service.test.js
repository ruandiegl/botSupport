import assert from "node:assert/strict";
import test from "node:test";
import {
  buildButtonListPayload,
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
    listResponseMessage: {
      selectedRowId: "3",
      title: "Áudio / Vídeo",
      message: "Equipe selecionada",
    },
  });

  assert.equal(message?.selectedOptionId, "3");
  assert.equal(findSelectedOption(options, message.content, message.selectedOptionId)?.departmentId, "av");
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
