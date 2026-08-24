import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePolicy, renderBusinessHoursTemplate } from "../dist/modules/business-hours/business-hours.clock.js";

const policy = {
  enabled: true,
  mode: "SCHEDULE_AND_ONLINE",
  timezone: "America/Sao_Paulo",
  intervals: [{ weekday: 1, startMinute: 8 * 60, endMinute: 18 * 60 }],
  exceptions: [],
};

test("identifica janela fora do horário e respeita atendente online", () => {
  const mondayBeforeOpening = new Date("2026-08-17T10:00:00.000Z");
  const closed = evaluatePolicy(policy, mondayBeforeOpening, true);
  assert.equal(closed.reason, "OUTSIDE_HOURS");

  const mondayDuringOpening = new Date("2026-08-17T15:00:00.000Z");
  assert.equal(evaluatePolicy(policy, mondayDuringOpening, true).isOpen, true);
  assert.equal(evaluatePolicy(policy, mondayDuringOpening, false).reason, "NO_AGENT_ONLINE");
});

test("exceção fechada prevalece sobre o intervalo semanal", () => {
  const exceptionPolicy = { ...policy, exceptions: [{ localDate: "2026-08-17", kind: "CLOSED", intervalsJson: null }] };
  const result = evaluatePolicy(exceptionPolicy, new Date("2026-08-17T15:00:00.000Z"), true);
  assert.equal(result.reason, "OUTSIDE_HOURS");
});

test("renderiza somente variáveis suportadas", () => {
  assert.equal(renderBusinessHoursTemplate("Olá {{nome}}, abrimos {{proximaAbertura}}.", { nome: "Ruan", proximaAbertura: "amanhã às 08:00" }), "Olá Ruan, abrimos amanhã às 08:00.");
});
