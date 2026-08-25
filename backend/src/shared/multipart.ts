import type { IncomingMessage } from "node:http";

export type MultipartFile = {
  fieldName: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
};

export type MultipartForm = {
  fields: Record<string, string>;
  file: MultipartFile | null;
  cleanup: () => void;
};

export class MultipartError extends Error {
  constructor(public readonly code: "CONTENT_TYPE" | "BOUNDARY" | "TOO_LARGE" | "MALFORMED" | "ABORTED") {
    super(code);
    this.name = "MultipartError";
  }
}

/**
 * Consume the rest of an oversized request before the controller writes the
 * response. Closing an HTTP/2 response while the browser is still uploading
 * the multipart body can surface as ERR_HTTP2_PROTOCOL_ERROR instead of the
 * intended 413 response.
 */
async function drainRequest(request: IncomingMessage): Promise<void> {
  if (request.readableEnded || request.destroyed) return;
  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    request.once("end", finish);
    request.once("close", finish);
    request.once("error", finish);
    request.resume();
  });
}

function dispositionValue(header: string, key: string): string | null {
  const match = header.match(new RegExp(`${key}="([^"]*)"`, "i"));
  return match?.[1] ?? null;
}

/**
 * Minimal, bounded multipart reader for a single in-memory attachment.
 * It deliberately never writes a temporary file. The caller must invoke
 * cleanup() in a finally block so the request buffer is released as soon as
 * the provider call finishes.
 */
export async function readMultipartForm(
  request: IncomingMessage,
  maxBytes: number,
): Promise<MultipartForm> {
  const contentType = String(request.headers["content-type"] ?? "");
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    throw new MultipartError("CONTENT_TYPE");
  }

  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = (boundaryMatch?.[1] ?? boundaryMatch?.[2] ?? "").trim();
  if (!boundary || boundary.length > 200) throw new MultipartError("BOUNDARY");

  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (declaredLength > maxBytes) {
    // Drain the request before returning so keep-alive/HTTP2 connections are
    // not poisoned by an unread body after an early 413 response.
    await drainRequest(request);
    throw new MultipartError("TOO_LARGE");
  }

  const chunks: Buffer[] = [];
  let received = 0;
  let settled = false;
  let tooLarge = false;
  const body = await new Promise<Buffer>((resolve, reject) => {
    const fail = (error: MultipartError) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    request.on("data", (chunk: Buffer | string) => {
      if (settled || tooLarge) return;
      const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      received += value.length;
      if (received > maxBytes) {
        tooLarge = true;
        chunks.length = 0;
        request.resume();
        return;
      }
      chunks.push(value);
    });
    request.once("end", () => {
      if (settled) return;
      if (tooLarge) {
        settled = true;
        reject(new MultipartError("TOO_LARGE"));
        return;
      }
      settled = true;
      resolve(Buffer.concat(chunks, received));
    });
    request.once("aborted", () => fail(new MultipartError("ABORTED")));
    request.once("error", () => fail(new MultipartError("ABORTED")));
  });

  let bodyBuffer = body;
  const delimiter = Buffer.from(`--${boundary}`);
  const fields: Record<string, string> = {};
  let file: MultipartFile | null = null;
  let cursor = bodyBuffer.indexOf(delimiter);

  while (cursor >= 0) {
    let partStart = cursor + delimiter.length;
    if (bodyBuffer.slice(partStart, partStart + 2).toString() === "--") break;
    if (bodyBuffer.slice(partStart, partStart + 2).toString() === "\r\n") partStart += 2;

    const headersEnd = bodyBuffer.indexOf(Buffer.from("\r\n\r\n"), partStart);
    if (headersEnd < 0) {
      bodyBuffer.fill(0);
      throw new MultipartError("MALFORMED");
    }
    const headers = bodyBuffer.slice(partStart, headersEnd).toString("utf8");
    const nextBoundary = bodyBuffer.indexOf(delimiter, headersEnd + 4);
    if (nextBoundary < 0) {
      bodyBuffer.fill(0);
      throw new MultipartError("MALFORMED");
    }
    const contentEnd = Math.max(headersEnd + 4, nextBoundary - 2);
    const content = bodyBuffer.subarray(headersEnd + 4, contentEnd);
    const disposition = headers.match(/^content-disposition:\s*([^\r\n]+)/im)?.[1] ?? "";
    const fieldName = dispositionValue(disposition, "name");
    if (!fieldName) {
      bodyBuffer.fill(0);
      throw new MultipartError("MALFORMED");
    }
    const fileName = dispositionValue(disposition, "filename");
    if (fileName !== null) {
      if (fieldName !== "file") {
        bodyBuffer.fill(0);
        throw new MultipartError("MALFORMED");
      }
      if (file) {
        bodyBuffer.fill(0);
        throw new MultipartError("MALFORMED");
      }
      const mimeType = headers.match(/^content-type:\s*([^\r\n]+)/im)?.[1]?.trim().toLowerCase() || "application/octet-stream";
      file = { fieldName, fileName, mimeType, buffer: content };
    } else {
      fields[fieldName] = content.toString("utf8").trim();
    }
    cursor = nextBoundary;
  }

  return {
    fields,
    file,
    cleanup: () => {
      bodyBuffer.fill(0);
      bodyBuffer = Buffer.alloc(0);
    },
  };
}
