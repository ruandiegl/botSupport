import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  outboundMediaValidationMessage,
  validateOutgoingMedia,
} from "../dist/modules/conversations/outgoing-media.js";

const root = process.cwd();
const source = readFileSync(join(root, "src", "modules", "zapi", "zapi.service.ts"), "utf8");
const outgoingMediaSource = readFileSync(join(root, "src", "modules", "conversations", "outgoing-media.ts"), "utf8");
const schema = readFileSync(join(root, "prisma", "schema.prisma"), "utf8");
const migration = readFileSync(join(root, "prisma", "migrations", "20260824150000_add_outgoing_media_metadata", "migration.sql"), "utf8");
const routes = readFileSync(join(root, "src", "modules", "conversations", "conversations.routes.ts"), "utf8");
const zapiRoutes = readFileSync(join(root, "src", "modules", "zapi", "zapi.routes.ts"), "utf8");
const zapiController = readFileSync(join(root, "src", "modules", "zapi", "zapi.controller.ts"), "utf8");
const zapiService = readFileSync(join(root, "src", "modules", "zapi", "zapi.service.ts"), "utf8");

const id = "00000000-0000-4000-8000-000000000001";

test("valida assinatura e normaliza metadados sem armazenar conteúdo", () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from("fixture")]);
  const metadata = validateOutgoingMedia({ fieldName: "file", fileName: "../captura.png", mimeType: "image/png", buffer: png }, "", id);
  assert.equal(metadata.type, "IMAGE");
  assert.equal(metadata.fileName, "captura.png");
  assert.equal(metadata.sizeBytes, png.length);
  assert.equal("buffer" in metadata, false);
});

test("rejeita extensão/conteúdo incompatíveis e tipo não permitido", () => {
  assert.throws(
    () => validateOutgoingMedia({ fieldName: "file", fileName: "arquivo.png", mimeType: "image/png", buffer: Buffer.from("texto") }, "", id),
    /SIGNATURE_INVALID/,
  );
  assert.throws(
    () => validateOutgoingMedia({ fieldName: "file", fileName: "arquivo.exe", mimeType: "application/x-msdownload", buffer: Buffer.from("MZ") }, "", id),
    /TYPE_NOT_ALLOWED/,
  );
});

test("normaliza vídeos quando o MIME declarado não acompanha o container real", () => {
  const mp4 = Buffer.concat([Buffer.from("free000000000000"), Buffer.from("ftypisom")]);
  const mp4Metadata = validateOutgoingMedia({ fieldName: "file", fileName: "video.mp4", mimeType: "video/webm", buffer: mp4 }, "", id);
  assert.equal(mp4Metadata.type, "VIDEO");
  assert.equal(mp4Metadata.mimeType, "video/mp4");

  const webm = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.from("webm")]);
  const webmMetadata = validateOutgoingMedia({ fieldName: "file", fileName: "video.webm", mimeType: "video/mp4", buffer: webm }, "", id);
  assert.equal(webmMetadata.type, "VIDEO");
  assert.equal(webmMetadata.mimeType, "video/webm");
});

test("aceita ZIP válido como documento e normaliza o MIME reportado pelo Windows", () => {
  // PK\x05\x06 is the end-of-central-directory signature used by an empty
  // archive. The validator only needs the bounded magic bytes; it never
  // unpacks or persists the archive contents.
  const emptyZip = Buffer.from([
    0x50, 0x4b, 0x05, 0x06,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00,
  ]);
  const metadata = validateOutgoingMedia({
    fieldName: "file",
    fileName: "../relatorio.zip",
    mimeType: "application/x-zip-compressed",
    buffer: emptyZip,
  }, "", id);
  assert.equal(metadata.type, "DOCUMENT");
  assert.equal(metadata.mimeType, "application/zip");
  assert.equal(metadata.fileName, "relatorio.zip");
  assert.equal(metadata.sizeBytes, emptyZip.length);

  const multipartMetadata = validateOutgoingMedia({
    fieldName: "file",
    fileName: "relatorio-multipart.zip",
    mimeType: "multipart/x-zip",
    buffer: emptyZip,
  }, "", id);
  assert.equal(multipartMetadata.mimeType, "application/zip");
});

test("exige extensão ZIP e assinatura PK para arquivos application/zip", () => {
  const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
  assert.throws(
    () => validateOutgoingMedia({ fieldName: "file", fileName: "arquivo.pdf", mimeType: "application/zip", buffer: zipHeader }, "", id),
    /EXTENSION_INVALID/,
  );
  assert.throws(
    () => validateOutgoingMedia({ fieldName: "file", fileName: "arquivo.zip", mimeType: "application/zip", buffer: Buffer.from("texto") }, "", id),
    /SIGNATURE_INVALID/,
  );
});

test("mostra limite efetivo e orientação específica para ZIP acima do limite", () => {
  const previous = process.env.OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES;
  process.env.OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES = String(4 * 1024 * 1024);
  try {
    assert.throws(
      () => validateOutgoingMedia({ fieldName: "file", fileName: "arquivo.zip", mimeType: "application/zip", buffer: Buffer.alloc(5 * 1024 * 1024, 0x50) }, "", id),
      /SIZE_LIMIT/,
    );
    assert.match(
      outboundMediaValidationMessage("SIZE_LIMIT", {
        kind: "DOCUMENT",
        mimeType: "application/zip",
        sizeBytes: 5 * 1024 * 1024,
        limitBytes: 4 * 1024 * 1024,
      }),
      /arquivo ZIP.*5 MB.*4 MB/i,
    );
  } finally {
    if (previous === undefined) delete process.env.OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES;
    else process.env.OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES = previous;
  }
});

test("contrato de saída usa endpoints específicos e migration somente aditiva", () => {
  assert.match(source, /send-image/);
  assert.match(source, /send-video/);
  assert.match(source, /send-audio/);
  assert.match(source, /send-document/);
  assert.match(outgoingMediaSource, /application\/zip/);
  assert.match(outgoingMediaSource, /application\/x-zip-compressed/);
  assert.match(source, /data:\$\{mimeType\};base64/);
  assert.match(source, /replyToMessageId/);
  assert.doesNotMatch(source, /messageId:\s*clientMessageId/);
  assert.doesNotMatch(source, /messageId:\s*input\.clientMessageId/);
  assert.match(source, /Z-API não confirmou o envio da mídia/);
  assert.match(routes, /conversations\/:id\/media/);
  assert.match(routes, /conversations", "send_media/);
  assert.match(schema, /model OutgoingMedia/);
  assert.match(schema, /clientMessageId\s+String\s+@unique/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS "gtf_outgoing_media"/);
  assert.doesNotMatch(migration, /DROP\s+(TABLE|COLUMN|TYPE)/i);
});

test("normaliza telefones privados formatados antes de enviar para a Z-API", () => {
  assert.match(zapiService, /private number may arrive formatted/);
  assert.match(zapiService, /\/\^\\d\{8,\}-\\d\+\$\/.test\(value\)/);
  assert.match(zapiService, /return this\.formatPhone\(value\)/);
});

test("confirmação de entrega da Z-API atualiza falhas de mídia sem nova tabela", () => {
  assert.match(zapiService, /update-webhook-delivery/);
  assert.match(zapiService, /handleDeliveryWebhook/);
  assert.match(zapiService, /markOutgoingMediaDeliveryFailed/);
  assert.match(zapiRoutes, /webhooks\/z-api\/delivery/);
  assert.match(zapiController, /ZApiDeliveryWebhookSchema/);
  assert.match(zapiController, /Webhook de entrega Z-API processado/);
});

test("registra callbacks de status e de mensagens enviadas pela própria instância", () => {
  assert.match(zapiService, /update-webhook-message-status/);
  assert.match(zapiService, /update-notify-sent-by-me/);
  assert.match(zapiRoutes, /webhooks\/z-api\/status/);
  assert.match(zapiController, /ZApiMessageStatusWebhookSchema/);
});

test("normaliza URLs antigas de webhook antes de registrar os callbacks", () => {
  assert.ok(zapiService.includes("Older deployments stored the receive callback"));
  assert.ok(zapiService.includes("parsed.pathname = parsed.pathname.replace"));
  assert.ok(zapiService.includes("/webhooks/z-api"));
});
