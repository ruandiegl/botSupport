import dns from "node:dns/promises";
import net from "node:net";
import { once } from "node:events";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { logger } from "../../shared/logger.js";
import { mediaCryptoService, type MediaAccessPurpose } from "./media-crypto.service.js";
import { mediaRepository } from "./media.repository.js";

export class MediaHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}

const activeStreamsByAgent = new Map<string, number>();

function acquireStream(agentId: string) {
  const maximum = Math.min(
    20,
    Math.max(1, Number(process.env.MEDIA_MAX_CONCURRENT_STREAMS_PER_AGENT ?? "3") || 3),
  );
  const active = activeStreamsByAgent.get(agentId) ?? 0;
  if (active >= maximum) {
    throw new MediaHttpError(429, "Há muitas mídias sendo carregadas simultaneamente.");
  }
  activeStreamsByAgent.set(agentId, active + 1);
  return () => {
    const next = (activeStreamsByAgent.get(agentId) ?? 1) - 1;
    if (next <= 0) activeStreamsByAgent.delete(agentId);
    else activeStreamsByAgent.set(agentId, next);
  };
}

function hasUnsafeActivePrefix(chunk: Buffer): boolean {
  const prefix = chunk.subarray(0, 256).toString("utf8").trimStart().toLowerCase();
  return prefix.startsWith("<svg") || prefix.startsWith("<html") || prefix.startsWith("<!doctype html");
}

function canAccess(conversation: any, user?: AuthenticatedRequest["user"]): boolean {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "SUPERVISOR") return true;
  // Group monitor conversations are intentionally kept as DRAFT so they can
  // collect the complete group transcript without opening a ticket. Their
  // messages (including protected media) are still shared with attendants who
  // can view groups, so do not apply the private-ticket assignment gate here.
  if (conversation.channel === "GROUP" || conversation.groupChatId || conversation.groupChatName) return true;
  if (user.role !== "AGENT") return true;
  if (conversation.assignedAgentId === user.id) return true;
  return Boolean(
    conversation.status === "QUEUED" &&
      user.departmentId &&
      conversation.departmentId === user.departmentId,
  );
}

function sanitizeFileName(value?: string | null): string {
  const clean = (value || "arquivo")
    .replace(/[\r\n\\/\0]/g, "_")
    .replace(/[<>:"|?*]/g, "_")
    .trim()
    .slice(0, 160);
  return clean || "arquivo";
}

function mediaExtension(type: string, mimeType?: string | null): string {
  const mime = (mimeType || "").split(";")[0].trim().toLowerCase();
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/3gpp": "3gp",
    "video/quicktime": "mov",
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/webm": "webm",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/zip": "zip",
  };
  return extensions[mime] || (type === "VIDEO" ? "mp4" : type === "AUDIO" ? "ogg" : type === "IMAGE" ? "jpg" : "bin");
}

function fileNameWithExtension(value: string, type: string, mimeType?: string | null): string {
  if (/\.[a-z0-9]{1,8}$/i.test(value)) return value;
  return `${value}.${mediaExtension(type, mimeType)}`;
}

function isBlockedIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedAddress(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0];
  if (net.isIPv4(normalized)) return isBlockedIpv4(normalized);
  if (!net.isIPv6(normalized)) return true;
  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("ff")
  ) {
    return true;
  }
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isBlockedIpv4(mapped[1]) : false;
}

async function assertSafeSourceUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new MediaHttpError(502, "A origem da mídia retornou uma URL inválida.", "SOURCE_URL_INVALID");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new MediaHttpError(502, "A origem da mídia não é segura.", "SOURCE_URL_UNSAFE");
  }

  const allowedHosts = (process.env.MEDIA_ALLOWED_SOURCE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (process.env.NODE_ENV === "production" && !allowedHosts.length) {
    throw new MediaHttpError(503, "A lista de origens de mídia não foi configurada.", "SOURCE_ALLOWLIST_MISSING");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    allowedHosts.length &&
    !allowedHosts.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`))
  ) {
    throw new MediaHttpError(502, "A origem da mídia não é permitida.", "SOURCE_HOST_NOT_ALLOWED");
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new MediaHttpError(502, "A origem da mídia foi bloqueada por segurança.", "SOURCE_DNS_BLOCKED");
  }
  return parsed;
}

function isZApiHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "z-api.io" || normalized.endsWith(".z-api.io");
}

function mediaMaxBytes(type: string): number {
  const defaults: Record<string, number> = {
    IMAGE: 20 * 1024 * 1024,
    AUDIO: 30 * 1024 * 1024,
    VIDEO: 100 * 1024 * 1024,
    DOCUMENT: 50 * 1024 * 1024,
  };
  const envName = `MEDIA_MAX_${type}_BYTES`;
  const parsed = Number(process.env[envName]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaults[type] ?? 20 * 1024 * 1024;
}

function mimeMatches(type: string, rawMime: string): boolean {
  const mime = rawMime.split(";")[0].trim().toLowerCase();
  if (type === "IMAGE") return mime.startsWith("image/") && mime !== "image/svg+xml";
  if (type === "AUDIO") return mime.startsWith("audio/");
  if (type === "VIDEO") return mime.startsWith("video/");
  if (type === "DOCUMENT") {
    return (
      mime === "application/pdf" ||
      mime === "application/msword" ||
      mime.startsWith("application/vnd.") ||
      mime === "text/plain" ||
      mime === "text/csv" ||
      mime === "application/zip"
    );
  }
  return false;
}

async function fetchSource(
  initialUrl: string,
  range: string | undefined,
  controller: AbortController,
): Promise<globalThis.Response> {
  const maxRedirects = Math.min(5, Math.max(0, Number(process.env.MEDIA_MAX_REDIRECTS ?? "2") || 2));
  let current = await assertSafeSourceUrl(initialUrl);
  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Accept: "*/*",
        "User-Agent": "GTFBot-MediaProxy/1.0",
        ...(isZApiHost(current.hostname) && process.env.ZAPI_CLIENT_TOKEN
          ? { "Client-Token": process.env.ZAPI_CLIENT_TOKEN }
          : {}),
        ...(range ? { Range: range } : {}),
      },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location || redirect === maxRedirects) {
      throw new MediaHttpError(502, "A origem da mídia excedeu o limite de redirecionamentos.", "SOURCE_REDIRECT_LIMIT");
    }
    current = await assertSafeSourceUrl(new URL(location, current).toString());
  }
  throw new MediaHttpError(502, "Não foi possível acessar a origem da mídia.", "SOURCE_FETCH_FAILED");
}

function publicMedia(media: any) {
  const expired = media.expiresAt.getTime() <= Date.now();
  const status = expired && media.status === "AVAILABLE" ? "EXPIRED" : media.status;
  return {
    id: media.id,
    type: media.type,
    status,
    mimeType: media.mimeType,
    caption: media.caption,
    fileName: media.originalFileName,
    title: media.title,
    ptt: media.ptt,
    seconds: media.seconds,
    width: media.width,
    height: media.height,
    pageCount: media.pageCount,
    viewOnce: media.viewOnce,
    hasThumbnail: Boolean(media.thumbnailUrlCiphertext),
    expiresAt: media.expiresAt.toISOString(),
    available: status === "AVAILABLE",
  };
}

export class MediaService {
  toPublic(media: any) {
    return publicMedia(media);
  }

  async issueAccess(
    conversationId: string,
    messageId: string,
    purpose: MediaAccessPurpose,
    user?: AuthenticatedRequest["user"],
  ) {
    if (process.env.MEDIA_ZAPI_DISPLAY_ENABLED === "false") {
      throw new MediaHttpError(503, "A exibição de mídia está temporariamente desativada.");
    }
    const media = await mediaRepository.findByMessage(conversationId, messageId);
    if (!media) throw new MediaHttpError(404, "Mídia não encontrada.");
    if (!canAccess(media.conversation, user)) throw new MediaHttpError(403, "Acesso negado à mídia.");
    if (media.expiresAt.getTime() <= Date.now()) {
      await mediaRepository.expireOne(media.id);
      throw new MediaHttpError(410, "Esta mídia expirou após 30 dias.");
    }
    if (media.status !== "AVAILABLE" || !media.sourceUrlCiphertext) {
      throw new MediaHttpError(422, "Esta mídia está indisponível.");
    }
    if (purpose === "thumbnail" && !media.thumbnailUrlCiphertext) {
      throw new MediaHttpError(422, "Miniatura indisponível.");
    }
    if (!user?.id) throw new MediaHttpError(401, "Não autenticado.");
    const access = mediaCryptoService.issueAccessTicket(media.id, user.id, purpose);
    const action = purpose === "download" ? "download" : purpose;
    return {
      mediaId: media.id,
      purpose,
      ticket: access.ticket,
      ticketExpiresAt: access.expiresAt,
      url: `/api/media/${media.id}/${action}?ticket=${encodeURIComponent(access.ticket)}`,
    };
  }

  async stream(
    mediaId: string,
    expectedPurpose: MediaAccessPurpose,
    ticket: string,
    req: ExpressRequest,
    res: ExpressResponse,
  ) {
    let ticketPayload;
    try {
      ticketPayload = mediaCryptoService.verifyAccessTicket(ticket);
    } catch {
      throw new MediaHttpError(401, "Ticket de mídia inválido ou expirado.");
    }
    if (ticketPayload.mediaId !== mediaId || ticketPayload.purpose !== expectedPurpose) {
      throw new MediaHttpError(403, "Ticket sem permissão para este conteúdo.");
    }

    const media = await mediaRepository.findById(mediaId);
    if (!media) throw new MediaHttpError(404, "Mídia não encontrada.");
    if (media.expiresAt.getTime() <= Date.now()) {
      await mediaRepository.expireOne(media.id);
      throw new MediaHttpError(410, "Esta mídia expirou após 30 dias.");
    }
    if (media.status !== "AVAILABLE") throw new MediaHttpError(422, "Esta mídia está indisponível.");

    const encryptedUrl =
      expectedPurpose === "thumbnail" ? media.thumbnailUrlCiphertext : media.sourceUrlCiphertext;
    if (!encryptedUrl) throw new MediaHttpError(422, "Conteúdo de mídia indisponível.");

    let sourceUrl: string;
    try {
      sourceUrl = mediaCryptoService.decryptUrl(encryptedUrl, media.encryptionKeyVersion);
    } catch (error) {
      logger.error({ error, mediaId }, "Falha ao descriptografar URL de mídia");
      throw new MediaHttpError(503, "Não foi possível liberar a mídia agora.");
    }

    const releaseStream = acquireStream(ticketPayload.agentId);
    const controller = new AbortController();
    const timeoutMs = Math.min(
      120_000,
      Math.max(2_000, Number(process.env.MEDIA_PROXY_TIMEOUT_MS ?? "30000") || 30_000),
    );
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const abortOnClose = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.once("close", abortOnClose);

    try {
      const requestedRange = req.headers.range;
      if (requestedRange && !/^bytes=\d*-\d*$/.test(requestedRange)) {
        throw new MediaHttpError(416, "Intervalo de bytes inválido.");
      }
      let upstream: globalThis.Response;
      try {
        upstream = await fetchSource(sourceUrl, requestedRange, controller);
      } catch (error) {
        const reason = error instanceof MediaHttpError ? error.code ?? `HTTP_${error.status}` : "UPSTREAM_FETCH_FAILED";
        let sourceHost = "invalid";
        try {
          sourceHost = new URL(sourceUrl).hostname.toLowerCase();
        } catch {
          // Never log the full URL or its query token.
        }
        logger.warn({ mediaId, sourceHost, reason }, "Falha ao acessar origem da mídia");
        throw error;
      }
      if (upstream.status === 404 || upstream.status === 410) {
        await mediaRepository.markUnavailable(media.id, "ZAPI_SOURCE_UNAVAILABLE");
        throw new MediaHttpError(410, "A mídia não está mais disponível na Z-API.");
      }
      if (!upstream.ok || !upstream.body) {
        logger.warn({ mediaId, reason: `ZAPI_HTTP_${upstream.status}` }, "Origem da mídia retornou erro");
        await mediaRepository.markAccessError(media.id, `ZAPI_HTTP_${upstream.status}`);
        throw new MediaHttpError(502, "A Z-API não conseguiu fornecer a mídia.");
      }

      const upstreamMime = upstream.headers.get("content-type") || media.mimeType;
      if (!mimeMatches(media.type, upstreamMime)) {
        await mediaRepository.markAccessError(media.id, "MIME_MISMATCH");
        throw new MediaHttpError(422, "O formato retornado para a mídia é inválido.");
      }

      const maxBytes = mediaMaxBytes(media.type);
      const length = Number(upstream.headers.get("content-length") || "0");
      const contentRange = upstream.headers.get("content-range");
      const totalFromRange = Number(contentRange?.match(/\/(\d+)$/)?.[1] || "0");
      if ((length && length > maxBytes) || (totalFromRange && totalFromRange > maxBytes)) {
        await mediaRepository.markAccessError(media.id, "MEDIA_TOO_LARGE");
        throw new MediaHttpError(413, "A mídia excede o tamanho permitido.");
      }

      const reader = upstream.body.getReader();
      const firstRead = await reader.read();
      const firstChunk = firstRead.done ? Buffer.alloc(0) : Buffer.from(firstRead.value);
      if (hasUnsafeActivePrefix(firstChunk)) {
        await mediaRepository.markAccessError(media.id, "ACTIVE_CONTENT_BLOCKED");
        throw new MediaHttpError(422, "O conteúdo ativo retornado pela origem foi bloqueado.");
      }

      res.status(upstream.status === 206 ? 206 : 200);
      res.setHeader("Content-Type", upstreamMime);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "no-referrer");
      if (length) res.setHeader("Content-Length", String(length));
      if (contentRange) res.setHeader("Content-Range", contentRange);
      const acceptRanges = upstream.headers.get("accept-ranges");
      if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

      const disposition = expectedPurpose === "download" || media.type === "DOCUMENT" ? "attachment" : "inline";
      const fileName = fileNameWithExtension(
        sanitizeFileName(media.originalFileName || media.title || `midia-${media.id}`),
        media.type,
        media.mimeType,
      );
      // Keep an ASCII fallback for browsers that do not support filename*;
      // the UTF-8 value preserves the original name where supported.
      const asciiFileName = fileName.replace(/[^\x20-\x7e]/g, "_");
      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      );

      let streamedBytes = 0;
      let chunk = firstChunk;
      while (chunk.length) {
        streamedBytes += chunk.length;
        if (streamedBytes > maxBytes) {
          controller.abort();
          throw new MediaHttpError(413, "A mídia excede o tamanho permitido.");
        }
        if (!res.write(chunk)) await once(res, "drain");
        const next = await reader.read();
        if (next.done) break;
        chunk = Buffer.from(next.value);
      }
      res.end();
      void mediaRepository.markAccessed(media.id).catch((error) =>
        logger.warn({ error, mediaId }, "Não foi possível registrar acesso à mídia"),
      );
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new MediaHttpError(504, "Tempo esgotado ao carregar a mídia.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      res.off("close", abortOnClose);
      releaseStream();
    }
  }
}

export const mediaService = new MediaService();
