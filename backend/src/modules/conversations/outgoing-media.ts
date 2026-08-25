import { extname } from "node:path";
import type { MultipartFile } from "../../shared/multipart.js";

export type OutgoingMediaKind = "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";

export class OutgoingMediaValidationError extends Error {
  constructor(public readonly code: "FILE_REQUIRED" | "TYPE_NOT_ALLOWED" | "SIZE_LIMIT" | "SIGNATURE_INVALID" | "NAME_INVALID" | "CAPTION_INVALID" | "CLIENT_MESSAGE_INVALID") {
    super(code);
    this.name = "OutgoingMediaValidationError";
  }
}

const MIME_TYPES: Record<OutgoingMediaKind, Set<string>> = {
  IMAGE: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  AUDIO: new Set(["audio/ogg", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/x-wav", "audio/webm"]),
  VIDEO: new Set(["video/mp4", "video/webm", "video/3gpp"]),
  DOCUMENT: new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ]),
};

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
};

function envLimit(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function outboundMediaBodyLimit(): number {
  const limits = [
    envLimit("OUTBOUND_MEDIA_MAX_IMAGE_BYTES", 8 * 1024 * 1024),
    // Z-API accepts videos up to 100 MB. Keep a 64 MB default so a single
    // upload remains bounded in memory (multipart buffer + Base64 payload),
    // while installations that need the provider maximum can opt in through
    // OUTBOUND_MEDIA_MAX_VIDEO_BYTES.
    envLimit("OUTBOUND_MEDIA_MAX_VIDEO_BYTES", 64 * 1024 * 1024),
    envLimit("OUTBOUND_MEDIA_MAX_AUDIO_BYTES", 8 * 1024 * 1024),
    envLimit("OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES", 16 * 1024 * 1024),
  ];
  const calculated = Math.max(...limits) + 512 * 1024;
  const configured = Number(process.env.OUTBOUND_MEDIA_BODY_LIMIT_BYTES ?? calculated);
  return Number.isFinite(configured) && configured > 0 ? Math.min(calculated, Math.floor(configured)) : calculated;
}

function kindForMime(mimeType: string): OutgoingMediaKind | null {
  for (const [kind, allowed] of Object.entries(MIME_TYPES) as Array<[OutgoingMediaKind, Set<string>]>) {
    if (allowed.has(mimeType)) return kind;
  }
  return null;
}

function hasPrefix(buffer: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((value, index) => buffer[offset + index] === value);
}

function hasAscii(buffer: Buffer, value: string, offset = 0): boolean {
  return buffer.subarray(offset, offset + value.length).toString("ascii") === value;
}

function validSignature(kind: OutgoingMediaKind, mimeType: string, buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  if (kind === "IMAGE") {
    if (mimeType === "image/jpeg") return hasPrefix(buffer, [0xff, 0xd8, 0xff]);
    if (mimeType === "image/png") return hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (mimeType === "image/webp") return hasAscii(buffer, "RIFF") && hasAscii(buffer, "WEBP", 8);
    if (mimeType === "image/gif") return hasAscii(buffer, "GIF8");
  }
  if (kind === "VIDEO") {
    if (mimeType === "video/mp4") return hasAscii(buffer, "ftyp", 4);
    if (mimeType === "video/webm") return hasAscii(buffer, "\x1a\x45\xdf\xa3");
    if (mimeType === "video/3gpp") return hasAscii(buffer, "ftyp", 4) || hasAscii(buffer, "3gp", 4);
  }
  if (kind === "AUDIO") {
    if (mimeType === "audio/ogg") return hasAscii(buffer, "OggS");
    if (mimeType === "audio/wav" || mimeType === "audio/x-wav") return hasAscii(buffer, "RIFF") && hasAscii(buffer, "WAVE", 8);
    if (mimeType === "audio/mpeg" || mimeType === "audio/mp3") return hasAscii(buffer, "ID3") || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
    if (mimeType === "audio/mp4") return hasAscii(buffer, "ftyp", 4);
    if (mimeType === "audio/webm") return hasAscii(buffer, "\x1a\x45\xdf\xa3");
  }
  if (kind === "DOCUMENT") {
    if (mimeType === "application/pdf") return hasAscii(buffer, "%PDF");
    if (mimeType === "text/plain") return true;
    // Office Open XML and legacy Office formats are ZIP/OLE containers.
    return hasPrefix(buffer, [0x50, 0x4b, 0x03, 0x04]) || hasPrefix(buffer, [0xd0, 0xcf, 0x11, 0xe0]);
  }
  return false;
}

function safeFileName(fileName: string, mimeType: string): string {
  const base = fileName.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f\u007f]/g, "").trim() ?? "";
  const normalized = base.replace(/[^a-zA-Z0-9._()\- áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g, "_").slice(0, 180);
  const extension = EXTENSIONS[mimeType] ?? extname(normalized).replace(".", "").toLowerCase();
  if (!normalized || normalized === "." || normalized === ".." || !extension) throw new OutgoingMediaValidationError("NAME_INVALID");
  if (extname(normalized)) return normalized;
  return `${normalized}.${extension}`;
}

export function validateOutgoingMedia(file: MultipartFile | null, caption: string, clientMessageId: string) {
  if (!file || !file.buffer.length) throw new OutgoingMediaValidationError("FILE_REQUIRED");
  const mimeType = file.mimeType.split(";")[0].trim().toLowerCase();
  const kind = kindForMime(mimeType);
  if (!kind) throw new OutgoingMediaValidationError("TYPE_NOT_ALLOWED");

  const limitName = `OUTBOUND_MEDIA_MAX_${kind}_BYTES`;
  const fallback = kind === "VIDEO" ? 64 * 1024 * 1024 : kind === "DOCUMENT" ? 16 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.buffer.length > envLimit(limitName, fallback)) throw new OutgoingMediaValidationError("SIZE_LIMIT");
  if (!validSignature(kind, mimeType, file.buffer)) throw new OutgoingMediaValidationError("SIGNATURE_INVALID");
  if (caption.length > 2000) throw new OutgoingMediaValidationError("CAPTION_INVALID");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientMessageId)) {
    throw new OutgoingMediaValidationError("CLIENT_MESSAGE_INVALID");
  }

  return {
    type: kind,
    mimeType,
    fileName: safeFileName(file.fileName, mimeType),
    sizeBytes: file.buffer.length,
  };
}
