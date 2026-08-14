import crypto from "node:crypto";

export type MediaAccessPurpose = "content" | "thumbnail" | "download";

type MediaAccessTicketPayload = {
  v: 1;
  mediaId: string;
  agentId: string;
  purpose: MediaAccessPurpose;
  exp: number;
};

export class MediaConfigurationError extends Error {}

function getRequiredSecret(name: string, developmentFallback: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new MediaConfigurationError(`${name} não foi configurado.`);
  }
  return developmentFallback;
}

function getEncryptionKey(): Buffer {
  const material = getRequiredSecret(
    "MEDIA_URL_ENCRYPTION_KEY",
    "gtfbot-development-media-url-key-change-me",
  );
  return crypto.createHash("sha256").update(material, "utf8").digest();
}

function getTicketKey(): Buffer {
  const material = getRequiredSecret(
    "MEDIA_ACCESS_TICKET_SECRET",
    "gtfbot-development-media-ticket-key-change-me",
  );
  return crypto.createHash("sha256").update(material, "utf8").digest();
}

function encode(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export const mediaCryptoService = {
  encryptionKeyVersion(): number {
    const parsed = Number(process.env.MEDIA_URL_ENCRYPTION_KEY_VERSION ?? "1");
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  },

  encryptUrl(url: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(url, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1.${encode(iv)}.${encode(tag)}.${encode(encrypted)}`;
  },

  decryptUrl(ciphertext: string, keyVersion: number): string {
    if (keyVersion !== this.encryptionKeyVersion()) {
      throw new MediaConfigurationError(
        `Versão de chave de mídia ${keyVersion} não está disponível.`,
      );
    }
    const [format, ivRaw, tagRaw, encryptedRaw] = ciphertext.split(".");
    if (format !== "v1" || !ivRaw || !tagRaw || !encryptedRaw) {
      throw new Error("Envelope cifrado de mídia inválido.");
    }
    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), decode(ivRaw));
    decipher.setAuthTag(decode(tagRaw));
    return Buffer.concat([decipher.update(decode(encryptedRaw)), decipher.final()]).toString("utf8");
  },

  issueAccessTicket(mediaId: string, agentId: string, purpose: MediaAccessPurpose): {
    ticket: string;
    expiresAt: string;
  } {
    const ttlSeconds = Math.min(
      300,
      Math.max(30, Number(process.env.MEDIA_ACCESS_TICKET_TTL_SECONDS ?? "120") || 120),
    );
    const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
    const payload: MediaAccessTicketPayload = { v: 1, mediaId, agentId, purpose, exp };
    const encodedPayload = encode(JSON.stringify(payload));
    const signature = crypto.createHmac("sha256", getTicketKey()).update(encodedPayload).digest();
    return {
      ticket: `${encodedPayload}.${encode(signature)}`,
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  },

  verifyAccessTicket(ticket: string): MediaAccessTicketPayload {
    const [encodedPayload, encodedSignature] = ticket.split(".");
    if (!encodedPayload || !encodedSignature) throw new Error("Ticket de mídia inválido.");
    const expected = crypto.createHmac("sha256", getTicketKey()).update(encodedPayload).digest();
    const received = decode(encodedSignature);
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      throw new Error("Assinatura do ticket de mídia inválida.");
    }
    const payload = JSON.parse(decode(encodedPayload).toString("utf8")) as MediaAccessTicketPayload;
    if (
      payload.v !== 1 ||
      !payload.mediaId ||
      !payload.agentId ||
      !["content", "thumbnail", "download"].includes(payload.purpose) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw new Error("Ticket de mídia expirado ou inválido.");
    }
    return payload;
  },
};
