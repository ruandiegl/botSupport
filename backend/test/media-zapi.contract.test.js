import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { mediaCryptoService } from "../dist/modules/media/media-crypto.service.js";
import { mediaService } from "../dist/modules/media/media.service.js";
import { ZApiReceivedWebhookSchema } from "../dist/modules/zapi/zapi.schemas.js";
import { parseIncomingMessage } from "../dist/modules/zapi/zapi.service.js";

const schema = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");
const migration = readFileSync(
  join(process.cwd(), "prisma", "migrations", "20260814150000_add_zapi_conversation_media", "migration.sql"),
  "utf8",
);
const serviceSource = readFileSync(join(process.cwd(), "src", "modules", "media", "media.service.ts"), "utf8");

const common = {
  messageId: "zapi-message-123",
  phone: "5511999999999",
  momment: Date.now(),
  fromMe: false,
  type: "ReceivedCallback",
};

test("aceita os quatro tipos de mídia da Z-API e mantém a URL fora do DTO público", () => {
  const payloads = [
    { image: { mimeType: "image/jpeg", imageUrl: "https://cdn.example.com/a.jpg", thumbnailUrl: "https://cdn.example.com/a-thumb.jpg", caption: "Foto", width: 800, height: 600 } },
    { audio: { mimeType: "audio/ogg; codecs=opus", audioUrl: "https://cdn.example.com/a.ogg", ptt: true, seconds: 12 } },
    { video: { mimeType: "video/mp4", videoUrl: "https://cdn.example.com/a.mp4", caption: "Vídeo", seconds: 8 } },
    { document: { mimeType: "application/pdf", documentUrl: "https://cdn.example.com/a.pdf", fileName: "manual.pdf", pageCount: 3 } },
  ];
  for (const media of payloads) {
    assert.equal(ZApiReceivedWebhookSchema.safeParse({ ...common, ...media }).success, true);
  }
  const publicDto = mediaService.toPublic({
    id: "media-1",
    type: "IMAGE",
    status: "AVAILABLE",
    mimeType: "image/jpeg",
    sourceUrlCiphertext: "encrypted-origin",
    thumbnailUrlCiphertext: "encrypted-thumbnail",
    expiresAt: new Date(Date.now() + 60_000),
  });
  assert.equal(publicDto.hasThumbnail, true);
  assert.equal("sourceUrlCiphertext" in publicDto, false);
  assert.equal("thumbnailUrlCiphertext" in publicDto, false);
});

test("rejeita HTTP e múltiplas mídias no mesmo callback", () => {
  assert.equal(ZApiReceivedWebhookSchema.safeParse({
    ...common,
    image: { mimeType: "image/jpeg", imageUrl: "http://inseguro.example/a.jpg" },
  }).success, false);
  assert.equal(ZApiReceivedWebhookSchema.safeParse({
    ...common,
    image: { mimeType: "image/jpeg", imageUrl: "https://cdn.example/a.jpg" },
    audio: { mimeType: "audio/ogg", audioUrl: "https://cdn.example/a.ogg" },
  }).success, false);
  assert.equal(ZApiReceivedWebhookSchema.safeParse({
    ...common,
    image: { mimeType: "text/html", imageUrl: "https://cdn.example/a.jpg" },
  }).success, false);
});

test("downloadError registra imagem indisponível sem exigir URL", () => {
  const parsed = ZApiReceivedWebhookSchema.safeParse({
    ...common,
    image: { mimeType: "image/jpeg", downloadError: "download failed" },
  });
  assert.equal(parsed.success, true);
});

test("parser normaliza metadados e usa messageId como evento externo", () => {
  const parsed = parseIncomingMessage({
    ...common,
    image: {
      mimeType: "image/jpeg",
      imageUrl: "https://cdn.example/a.jpg",
      caption: "Painel com erro",
      width: 1280,
      height: 720,
      viewOnce: false,
    },
  });
  assert.equal(parsed?.content, "Painel com erro");
  assert.equal(parsed?.externalEventId, common.messageId);
  assert.equal(parsed?.media?.type, "IMAGE");
  assert.equal(parsed?.media?.sourceUrl, "https://cdn.example/a.jpg");
});

test("URL de origem usa AES-GCM e ticket assinado rejeita adulteração", () => {
  process.env.MEDIA_URL_ENCRYPTION_KEY = "test-media-url-encryption-key-32-bytes";
  process.env.MEDIA_ACCESS_TICKET_SECRET = "test-media-ticket-secret-32-bytes";
  const original = "https://cdn.example.com/private/file.pdf?signature=secret";
  const encrypted = mediaCryptoService.encryptUrl(original);
  assert.notEqual(encrypted, original);
  assert.equal(mediaCryptoService.decryptUrl(encrypted, mediaCryptoService.encryptionKeyVersion()), original);

  const issued = mediaCryptoService.issueAccessTicket("media-1", "agent-1", "download");
  assert.deepEqual(mediaCryptoService.verifyAccessTicket(issued.ticket), {
    v: 1,
    mediaId: "media-1",
    agentId: "agent-1",
    purpose: "download",
    exp: Math.floor(new Date(issued.expiresAt).getTime() / 1000),
  });
  assert.throws(() => mediaCryptoService.verifyAccessTicket(`${issued.ticket}x`));
});

test("schema e migração garantem idempotência, relações e limpeza aditiva", () => {
  assert.match(schema, /model ConversationMedia \{/);
  assert.match(schema, /whatsappMessageId\s+String\s+@unique/);
  assert.match(schema, /externalMessageId\s+String\?\s+@unique/);
  assert.match(migration, /gtf_conversation_media_whatsapp_message_id_key/);
  assert.match(migration, /gtf_messages_external_message_id_key/);
  assert.doesNotMatch(migration, /DROP\s+(TABLE|COLUMN|TYPE)|TRUNCATE/i);
  assert.match(serviceSource, /Cache-Control", "private, no-store"/);
  assert.match(serviceSource, /assertSafeSourceUrl/);
  assert.match(serviceSource, /MEDIA_ALLOWED_SOURCE_HOSTS/);
});
