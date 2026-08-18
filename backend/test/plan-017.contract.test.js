import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("cooldown anti-spam de 15 minutos é configurável e server-side", () => {
  const service = read("src/modules/zapi/zapi.service.ts");
  const repository = read("src/modules/zapi/zapi.repository.ts");
  assert.match(service, /DEFAULT_BOT_REPLY_COOLDOWN_MINUTES = 15/);
  assert.match(service, /BOT_REPLY_COOLDOWN_MINUTES/);
  assert.match(service, /findLastBotMessageAt/);
  assert.match(service, /bot_cooldown/);
  assert.match(repository, /senderType: "BOT", direction: "OUT"/);
});

test("seleção explícita e estados de atendimento não repetem o fluxo", () => {
  const service = read("src/modules/zapi/zapi.service.ts");
  assert.match(service, /!incoming\.selectedOptionId/);
  assert.match(service, /currentStep === "QUEUED"/);
  assert.match(service, /currentStep === "AWAITING_DETAILS"/);
  assert.match(service, /waiting_for_agent/);
});

test("preview de imagem usa card ampliado, dialog e controles de zoom", () => {
  const media = read("../frontend/src/pages/conversation/components/MessageMedia.tsx");
  assert.match(media, /DialogContent/);
  assert.match(media, /Ampliar imagem/);
  assert.match(media, /zoom/);
  assert.match(media, /aspect-square/);
});
