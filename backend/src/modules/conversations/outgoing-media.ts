import { extname } from "node:path";
import type { MultipartFile } from "../../shared/multipart.js";

export type OutgoingMediaKind = "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";

export type OutgoingMediaValidationCode =
  | "FILE_REQUIRED"
  | "TYPE_NOT_ALLOWED"
  | "SIZE_LIMIT"
  | "SIGNATURE_INVALID"
  | "NAME_INVALID"
  | "EXTENSION_INVALID"
  | "CAPTION_INVALID"
  | "CLIENT_MESSAGE_INVALID";

export type OutgoingMediaValidationDetails = {
  kind?: OutgoingMediaKind;
  mimeType?: string;
  sizeBytes?: number;
  limitBytes?: number;
};

export class OutgoingMediaValidationError extends Error {
  constructor(
    public readonly code: OutgoingMediaValidationCode,
    public readonly details: OutgoingMediaValidationDetails = {},
  ) {
    super(code);
    this.name = "OutgoingMediaValidationError";
  }
}

const MIME_TYPES: Record<OutgoingMediaKind, Set<string>> = {
  IMAGE: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  AUDIO: new Set(["audio/ogg", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/x-wav", "audio/webm"]),
  VIDEO: new Set(["video/mp4", "video/webm", "video/3gpp", "video/quicktime"]),
  DOCUMENT: new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    // Chromium on Windows may report ZIP files with this legacy MIME value.
    // It is canonicalized to application/zip before persistence and delivery.
    "application/x-zip-compressed",
    "multipart/x-zip",
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
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "multipart/x-zip": "zip",
  "text/plain": "txt",
};

const MIME_ALIASES: Record<string, string> = {
  "application/x-zip-compressed": "application/zip",
  "multipart/x-zip": "application/zip",
};

function envLimit(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function outboundMediaBodyLimit(): number {
  const limits = [
    outboundMediaLimit("IMAGE"),
    // Z-API accepts videos up to 100 MB. Keep a 64 MB default so a single
    // upload remains bounded in memory (multipart buffer + Base64 payload),
    // while installations that need the provider maximum can opt in through
    // OUTBOUND_MEDIA_MAX_VIDEO_BYTES.
    outboundMediaLimit("VIDEO"),
    outboundMediaLimit("AUDIO"),
    outboundMediaLimit("DOCUMENT"),
  ];
  const calculated = Math.max(...limits) + 512 * 1024;
  const configured = Number(process.env.OUTBOUND_MEDIA_BODY_LIMIT_BYTES ?? calculated);
  return Number.isFinite(configured) && configured > 0 ? Math.min(calculated, Math.floor(configured)) : calculated;
}

/**
 * Returns the effective per-kind limit used by both multipart parsing and
 * media validation. Keeping this in one place prevents the API from showing
 * a limit different from the one it actually enforces.
 */
export function outboundMediaLimit(kind: OutgoingMediaKind): number {
  const fallback = kind === "VIDEO"
    ? 64 * 1024 * 1024
    : kind === "DOCUMENT"
    ? 16 * 1024 * 1024
    : 8 * 1024 * 1024;
  return envLimit(`OUTBOUND_MEDIA_MAX_${kind}_BYTES`, fallback);
}

function formatBytes(bytes: number): string {
  const mebibytes = bytes / (1024 * 1024);
  if (mebibytes >= 1) {
    const rounded = Math.round(mebibytes * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Keeps user-facing upload errors consistent for private and group routes.
 * The limit comes from the same environment variable used by validation.
 */
export function outboundMediaValidationMessage(
  code: OutgoingMediaValidationCode | string,
  details: OutgoingMediaValidationDetails = {},
): string {
  if (code === "FILE_REQUIRED") return "Selecione um arquivo antes de enviar.";
  if (code === "TYPE_NOT_ALLOWED") {
    return "Este formato não é aceito. Envie uma imagem, vídeo, áudio, documento compatível ou arquivo ZIP.";
  }
  if (code === "EXTENSION_INVALID") {
    return "A extensão não corresponde ao formato do arquivo. Para enviar um ZIP, selecione um arquivo com final .zip.";
  }
  if (code === "SIZE_LIMIT") {
    const size = details.sizeBytes ? ` (${formatBytes(details.sizeBytes)})` : "";
    const limit = details.limitBytes ? formatBytes(details.limitBytes) : "o limite configurado";
    if (details.kind === "DOCUMENT" && details.mimeType === "application/zip") {
      return `Este arquivo ZIP${size} está maior que o limite de documentos de ${limit}. A compactação não ultrapassa o limite do WhatsApp. Tente dividir o arquivo em partes menores ou reduzir o conteúdo e envie novamente.`;
    }
    if (details.kind === "DOCUMENT") {
      return `Este documento${size} está maior que o limite de ${limit}. Reduza o tamanho, divida o conteúdo em partes menores e tente novamente.`;
    }
    if (details.kind === "VIDEO") {
      return `Este vídeo${size} está maior que o limite de ${limit}. Corte ou comprima o vídeo e tente novamente.`;
    }
    return `Este arquivo${size} está maior que o limite de ${limit}. Reduza o tamanho e tente novamente.`;
  }
  if (code === "SIGNATURE_INVALID") {
    return "Não conseguimos confirmar o formato deste arquivo. Para ZIP, selecione um .zip válido e tente novamente.";
  }
  if (code === "NAME_INVALID") return "O nome do arquivo é inválido.";
  if (code === "CAPTION_INVALID") return "A legenda excede o limite permitido.";
  if (code === "CLIENT_MESSAGE_INVALID") return "Identificador de envio inválido.";
  return "Arquivo inválido.";
}

export function outboundMediaMultipartLimitMessage(): string {
  return `O arquivo excede o limite máximo de upload configurado. Limites atuais: imagens e áudios até ${formatBytes(outboundMediaLimit("IMAGE"))}, documentos e ZIPs até ${formatBytes(outboundMediaLimit("DOCUMENT"))}, vídeos até ${formatBytes(outboundMediaLimit("VIDEO"))}. Reduza o tamanho ou divida o conteúdo e tente novamente.`;
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

function hasAsciiWithin(buffer: Buffer, value: string, maxOffset = 4096): boolean {
  const needle = Buffer.from(value, "ascii");
  const lastOffset = Math.min(Math.max(0, buffer.length - needle.length), maxOffset);
  for (let offset = 0; offset <= lastOffset; offset += 1) {
    if (buffer.subarray(offset, offset + needle.length).equals(needle)) return true;
  }
  return false;
}

/**
 * Browsers can preserve a stale/incorrect MIME value when a video comes from
 * a download or from MediaRecorder. Normalize the provider MIME from the
 * container signature before rejecting the upload. This keeps validation
 * strict while accepting a valid MP4/WebM whose declared type is wrong.
 */
function mimeFromSignature(kind: OutgoingMediaKind, buffer: Buffer): string | null {
  if (kind === "IMAGE") {
    if (hasPrefix(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
    if (hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
    if (hasAscii(buffer, "RIFF") && hasAscii(buffer, "WEBP", 8)) return "image/webp";
    if (hasAscii(buffer, "GIF8")) return "image/gif";
  }
  if (kind === "VIDEO") {
    if (hasAsciiWithin(buffer, "\x1a\x45\xdf\xa3", 32)) return "video/webm";
    if (hasAsciiWithin(buffer, "ftyp", 4096)) return "video/mp4";
  }
  if (kind === "AUDIO") {
    if (hasAscii(buffer, "OggS")) return "audio/ogg";
    if (hasAscii(buffer, "RIFF") && hasAscii(buffer, "WAVE", 8)) return "audio/wav";
    if (hasAscii(buffer, "ID3") || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)) return "audio/mpeg";
    if (hasAsciiWithin(buffer, "\x1a\x45\xdf\xa3", 32)) return "audio/webm";
    if (hasAsciiWithin(buffer, "ftyp", 4096)) return "audio/mp4";
  }
  return null;
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
    if (mimeType === "video/mp4" || mimeType === "video/quicktime") return hasAsciiWithin(buffer, "ftyp", 4096);
    if (mimeType === "video/webm") return hasAsciiWithin(buffer, "\x1a\x45\xdf\xa3", 32);
    if (mimeType === "video/3gpp") return hasAsciiWithin(buffer, "ftyp", 4096) || hasAsciiWithin(buffer, "3gp", 64);
  }
  if (kind === "AUDIO") {
    if (mimeType === "audio/ogg") return hasAscii(buffer, "OggS");
    if (mimeType === "audio/wav" || mimeType === "audio/x-wav") return hasAscii(buffer, "RIFF") && hasAscii(buffer, "WAVE", 8);
    if (mimeType === "audio/mpeg" || mimeType === "audio/mp3") return hasAscii(buffer, "ID3") || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
    if (mimeType === "audio/mp4") return hasAscii(buffer, "ftyp", 4);
    if (mimeType === "audio/webm") return hasAscii(buffer, "\x1a\x45\xdf\xa3");
  }
  if (kind === "DOCUMENT") {
    if (mimeType === "application/zip") {
      // Local-file, empty archive and spanning-archive signatures. A ZIP is
      // never accepted solely because its extension or declared MIME matches.
      return (
        hasPrefix(buffer, [0x50, 0x4b, 0x03, 0x04])
        || hasPrefix(buffer, [0x50, 0x4b, 0x05, 0x06])
        || hasPrefix(buffer, [0x50, 0x4b, 0x07, 0x08])
      );
    }
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
  const declaredMimeType = file.mimeType.split(";")[0].trim().toLowerCase();
  let mimeType = MIME_ALIASES[declaredMimeType] ?? declaredMimeType;
  const kind = kindForMime(mimeType);
  if (!kind) throw new OutgoingMediaValidationError("TYPE_NOT_ALLOWED");

  const detectedMime = mimeFromSignature(kind, file.buffer);
  if (detectedMime && kindForMime(detectedMime) === kind) mimeType = detectedMime;

  const limitBytes = outboundMediaLimit(kind);
  if (file.buffer.length > limitBytes) {
    throw new OutgoingMediaValidationError("SIZE_LIMIT", {
      kind,
      mimeType,
      sizeBytes: file.buffer.length,
      limitBytes,
    });
  }
  if (!validSignature(kind, mimeType, file.buffer)) throw new OutgoingMediaValidationError("SIGNATURE_INVALID");
  const originalBaseName = file.fileName.split(/[\\/]/).pop()?.trim() ?? "";
  if (mimeType === "application/zip" && extname(originalBaseName).toLowerCase() !== ".zip") {
    throw new OutgoingMediaValidationError("EXTENSION_INVALID", { kind, mimeType });
  }
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
