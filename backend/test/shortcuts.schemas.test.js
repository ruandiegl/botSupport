import assert from "node:assert/strict";
import test from "node:test";
import { CreateShortcutBodySchema } from "../dist/modules/shortcuts/shortcuts.schemas.js";

const valid = {
  title: "Saudação inicial",
  message: "Olá, como posso ajudar?",
  type: "GREETING",
  scope: "GLOBAL",
};

test("aceita um atalho global válido", () => {
  assert.equal(CreateShortcutBodySchema.safeParse(valid).success, true);
});

test("rejeita título e mensagem fora dos limites", () => {
  assert.equal(CreateShortcutBodySchema.safeParse({ ...valid, title: "A" }).success, false);
  assert.equal(CreateShortcutBodySchema.safeParse({ ...valid, message: "" }).success, false);
});

test("exige departamento no escopo de departamento", () => {
  const result = CreateShortcutBodySchema.safeParse({ ...valid, type: "DEPARTMENT", scope: "DEPARTMENT" });
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.error.flatten().fieldErrors.departmentId);
});
