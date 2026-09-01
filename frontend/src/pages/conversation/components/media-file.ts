/**
 * Shared rules for files selected through the attachment picker, pasted from
 * the clipboard, or dropped onto a composer. Keeping the MIME/extension map
 * here prevents a ZIP from taking a different path depending on how it was
 * attached (Windows commonly reports ZIPs as application/x-zip-compressed).
 */

export type MediaFileKind = "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";

export const MEDIA_ACCEPT = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/3gpp", "video/quicktime",
  "audio/ogg", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/webm",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip", "application/x-zip-compressed", "multipart/x-zip", "text/plain",
  ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".mp4", ".webm", ".3gp", ".mov",
  ".ogg", ".mp3", ".m4a", ".wav",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".txt",
].join(",");

/** Defaults match OUTBOUND_MEDIA_MAX_* in backend/src/modules/conversations/outgoing-media.ts. */
export const MEDIA_MAX_BYTES: Record<MediaFileKind, number> = {
  IMAGE: 8 * 1024 * 1024,
  VIDEO: 64 * 1024 * 1024,
  AUDIO: 8 * 1024 * 1024,
  DOCUMENT: 16 * 1024 * 1024,
};

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  png: "image/png",
  mp4: "video/mp4",
  webm: "video/webm",
  "3gp": "video/3gpp",
  mov: "video/quicktime",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  mp3: "audio/mpeg",
  mpeg: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
  txt: "text/plain",
};

const EXTENSION_BY_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_BY_EXTENSION).map(([extension, mime]) => [mime, extension]),
);

function normalizedMime(type: string | undefined) {
  const mime = type?.split(";")[0].trim().toLowerCase() || "";
  if (mime === "application/x-zip-compressed" || mime === "multipart/x-zip") return "application/zip";
  return mime;
}

function fileExtension(name: string | undefined) {
  return name?.split(".").pop()?.trim().toLowerCase() || "";
}

export function mediaMimeType(file: Pick<File, "name" | "type">) {
  const declaredMime = normalizedMime(file.type);
  const inferredMime = MIME_BY_EXTENSION[fileExtension(file.name)];
  // A missing/octet-stream MIME is common when a document is pasted. The
  // extension is more reliable in that case and keeps ZIPs as documents.
  return declaredMime && declaredMime !== "application/octet-stream"
    ? declaredMime
    : inferredMime || declaredMime || "application/octet-stream";
}

export function mediaFileKind(file: Pick<File, "name" | "type">): MediaFileKind | null {
  const mime = mediaMimeType(file);
  if (mime.startsWith("image/") && mime !== "image/svg+xml") return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (DOCUMENT_MIME_TYPES.has(mime)) return "DOCUMENT";
  return null;
}

export function normalizeMediaFile(file: File) {
  const name = file.name?.trim();
  const mimeType = mediaMimeType(file);
  const declaredMime = file.type?.split(";")[0].trim().toLowerCase() || "";
  // Keep the original object when it already carries the canonical MIME.
  // Aliases such as application/x-zip-compressed must be rewritten to
  // application/zip so the outgoing-media validator sees a document.
  if (name && declaredMime === mimeType) return file;

  const extension = EXTENSION_BY_MIME[mimeType] || fileExtension(name) || "bin";
  const fallbackName = mimeType.startsWith("image/") ? "captura" : "arquivo";
  return new File(
    [file],
    name || `${fallbackName}-${Date.now()}.${extension}`,
    { type: mimeType, lastModified: file.lastModified || Date.now() },
  );
}

export function formatMediaBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mediaSizeError(file: Pick<File, "name" | "type" | "size"> | null) {
  if (!file) return null;
  const kind = mediaFileKind(file);
  if (!kind || file.size <= MEDIA_MAX_BYTES[kind]) return null;

  const label = kind === "VIDEO" ? "vídeo" : kind === "IMAGE" ? "imagem" : kind === "AUDIO" ? "áudio" : "documento";
  const guidance = kind === "VIDEO"
    ? "Corte ou comprima o vídeo e tente novamente."
    : kind === "DOCUMENT"
      ? "Divida o arquivo ou reduza o conteúdo e tente novamente. Um ZIP também precisa respeitar esse limite."
      : "Reduza o tamanho e tente novamente.";
  return `Este ${label} é grande demais para enviar (${formatMediaBytes(file.size)}). O limite é ${formatMediaBytes(MEDIA_MAX_BYTES[kind])}. ${guidance}`;
}
