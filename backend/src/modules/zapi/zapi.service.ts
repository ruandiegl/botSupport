import { zApiRepository } from "./zapi.repository.js";
import { logger } from "../../shared/logger.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import { flowExecutionService } from "../flow-execution/flow-execution.service.js";
import type { ZApiReceivedWebhook } from "./zapi.schemas.js";
import { mediaCryptoService } from "../media/media-crypto.service.js";
import { mediaService } from "../media/media.service.js";
import { createHash } from "node:crypto";
import { labelsService } from "../labels/labels.service.js";

const DEFAULT_BOT_REPLY_COOLDOWN_MINUTES = 15;
const MAX_BOT_REPLY_COOLDOWN_MINUTES = 24 * 60;

function botReplyCooldownMs() {
  const configured = Number(process.env.BOT_REPLY_COOLDOWN_MINUTES ?? DEFAULT_BOT_REPLY_COOLDOWN_MINUTES);
  if (!Number.isFinite(configured)) return DEFAULT_BOT_REPLY_COOLDOWN_MINUTES * 60_000;
  return Math.min(MAX_BOT_REPLY_COOLDOWN_MINUTES, Math.max(0, configured)) * 60_000;
}

function parseZApiError(status: number, data: any): string {
  const rawMsg = data?.error || data?.message || data?.reason || "";
  
  if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("instance not found")) {
    return "Instância não encontrada na Z-API. Verifique se as credenciais configuradas no ambiente (.env) estão corretas e ativas no painel Z-API.";
  }
  if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("client-token")) {
    return "Client-Token da conta não configurado. Informe o Token de Segurança da Conta Z-API.";
  }
  if (typeof rawMsg === "string" && (rawMsg.toLowerCase().includes("token") || status === 401 || status === 403)) {
    return "Token de acesso inválido ou sem permissão.";
  }
  if (status === 404) {
    return "Instância não encontrada na Z-API (404).";
  }
  if (rawMsg) {
    return `Z-API: ${rawMsg} (HTTP ${status})`;
  }
  return `Erro HTTP ${status} ao comunicar com a Z-API.`;
}

export type BotOption = {
  optionKey?: string;
  label: string;
  departmentId: string;
  procedureMessage?: string;
};

export type ParsedIncomingMessage = {
  phone: string;
  senderName: string;
  content: string;
  selectedOptionId?: string;
  externalEventId?: string;
  media?: ParsedIncomingMedia;
  group?: { jid: string; name: string; participant: string };
};

export type ParsedIncomingMedia = {
  type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
  mimeType: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  downloadError?: string | null;
  caption?: string;
  originalFileName?: string;
  title?: string;
  ptt?: boolean;
  seconds?: number;
  width?: number;
  height?: number;
  pageCount?: number;
  viewOnce: boolean;
};

function parseIncomingMedia(payload: any): ParsedIncomingMedia | undefined {
  if (payload?.image) {
    return {
      type: "IMAGE",
      mimeType: String(payload.image.mimeType || "image/jpeg"),
      sourceUrl: payload.image.imageUrl,
      thumbnailUrl: payload.image.thumbnailUrl,
      downloadError: payload.image.downloadError,
      caption: payload.image.caption || "",
      width: payload.image.width,
      height: payload.image.height,
      viewOnce: payload.image.viewOnce === true,
    };
  }
  if (payload?.audio) {
    return {
      type: "AUDIO",
      mimeType: String(payload.audio.mimeType || "audio/ogg"),
      sourceUrl: payload.audio.audioUrl,
      ptt: payload.audio.ptt,
      seconds: payload.audio.seconds,
      viewOnce: payload.audio.viewOnce === true,
    };
  }
  if (payload?.video) {
    return {
      type: "VIDEO",
      mimeType: String(payload.video.mimeType || "video/mp4"),
      sourceUrl: payload.video.videoUrl,
      caption: payload.video.caption || "",
      seconds: payload.video.seconds,
      viewOnce: payload.video.viewOnce === true,
    };
  }
  if (payload?.document) {
    return {
      type: "DOCUMENT",
      mimeType: String(payload.document.mimeType || "application/octet-stream"),
      sourceUrl: payload.document.documentUrl,
      originalFileName: payload.document.fileName,
      title: payload.document.title,
      pageCount: payload.document.pageCount,
      viewOnce: false,
    };
  }
  return undefined;
}

function mediaFallback(media: ParsedIncomingMedia): string {
  const caption = media.caption?.trim();
  if (caption) return caption;
  if (media.type === "IMAGE") return "[Imagem recebida]";
  if (media.type === "AUDIO") return "[Áudio recebido]";
  if (media.type === "VIDEO") return "[Vídeo recebido]";
  return media.originalFileName ? `[Documento recebido: ${media.originalFileName}]` : "[Documento recebido]";
}

export function parseIncomingMessage(payload: any): ParsedIncomingMessage | null {
  if (
    payload?.type !== "ReceivedCallback" ||
    payload?.fromMe === true ||
    payload?.isNewsletter === true ||
    payload?.isStatusReply === true ||
    payload?.notification
  ) {
    return null;
  }

  // A Z-API usa participantPhone/participantLid nos callbacks atuais; `participant`
  // continua aceito para compatibilidade com versões antigas e fixtures legados.
  const participant = String(
    payload.participantPhone || payload.participant || payload.senderPhone || "",
  );
  const phone = String(payload.isGroup === true ? participant : (payload.phone || payload.senderPhone || payload.chatId || "")).replace(/\D/g, "");
  if (!phone) return null;

  const buttonResponse = payload.buttonsResponseMessage;
  const listResponse = payload.listResponseMessage;
  const selectedOptionId = String(
    buttonResponse?.buttonId || listResponse?.selectedRowId || ""
  ).trim() || undefined;

  const media = parseIncomingMedia(payload);
  const content = String(
    buttonResponse?.message ||
      listResponse?.title ||
      listResponse?.message ||
      payload.text?.message ||
      (typeof payload.text === "string" ? payload.text : "") ||
      payload.body ||
      payload.caption ||
      (typeof payload.message === "string" ? payload.message : "") ||
      (media ? mediaFallback(media) : "") ||
      "Mensagem recebida"
  ).trim();

  const externalEventId = String(payload.messageId || payload.ids?.[0] || payload.id || "").trim() || undefined;
  return {
    phone,
    senderName: payload.senderName || payload.pushName || payload.chatName || payload.name || "Contato WhatsApp",
    content,
    selectedOptionId,
    ...(externalEventId ? { externalEventId } : {}),
    ...(media ? { media } : {}),
    ...(payload.isGroup === true ? { group: { jid: String(payload.phone || payload.chatId || ""), name: String(payload.chatName || "Grupo do WhatsApp"), participant } } : {}),
  };
}

function canonicalJid(value: string) { return value.trim().toLowerCase().split(":")[0].replace(/\D/g, ""); }
function hashIdentifier(value: string) { return createHash("sha256").update(value.trim().toLowerCase()).digest("hex"); }
function hasBroadcastMention(values: string[]) { return values.some((value) => /(^|@)(all|everyone|every|broadcast)(@|$)/i.test(value)); }
function collectMentionValues(payload: any): string[] {
  const values = [payload?.mentionedJids, payload?.mentionedJid, payload?.mentions, payload?.mentioned]
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));

  return values
    .map((value) => {
      if (typeof value === "string") return value;
      if (!value || typeof value !== "object") return "";
      return String(value.jid || value.phone || value.id || value.participantPhone || "");
    })
    .filter(Boolean);
}

function hasTextMention(payload: any): boolean {
  const text = String(payload?.text?.message || payload?.body || payload?.caption || payload?.message || "");
  // Some Z-API versions do not expose a mention array in ReceivedCallback, but
  // preserve the WhatsApp @ token in the text. This fallback keeps that format
  // functional while explicit mention arrays remain preferred when available.
  return /(^|\s)@[~\w][^\s@]*/u.test(text);
}

function renderGroupTemplate(template: string | null | undefined, name: string, group: string) {
  return (template?.trim() || "Olá, {{nome}}! Recebemos sua solicitação no grupo {{grupo}} e iniciaremos o atendimento por aqui.")
    .replace(/{{\s*nome\s*}}/gi, name)
    .replace(/{{\s*grupo\s*}}/gi, group);
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

export function findSelectedOption(
  options: BotOption[],
  content: string,
  selectedOptionId?: string
): BotOption | undefined {
  if (selectedOptionId) {
    const stableMatch = options.find((option) => option.optionKey === selectedOptionId);
    if (stableMatch) return stableMatch;
    const numericIndex = Number(selectedOptionId) - 1;
    if (Number.isInteger(numericIndex) && options[numericIndex]) return options[numericIndex];
  }

  const normalizedContent = normalize(content);
  return options.find((option, index) => {
    const normalizedLabel = normalize(option.label);
    return (
      normalizedContent === String(index + 1) ||
      normalizedContent === normalizedLabel ||
      normalizedLabel.includes(normalizedContent) ||
      normalizedContent.includes(normalizedLabel)
    );
  });
}

export function buildButtonListPayload(phone: string, message: string, options: BotOption[]) {
  return {
    phone,
    message,
    buttonList: {
      buttons: options.map((option, index) => ({
        id: option.optionKey || String(index + 1),
        label: option.label,
      })),
    },
  };
}

function normalizeWebhookUrl(webhookUrl: string): string {
  const trimmed = webhookUrl.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname === "/" || parsed.pathname === "") {
      parsed.pathname = "/api/webhooks/z-api";
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export class ZApiService {
  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    return cleaned;
  }

  async getConfig() {
    let dbConfig = await zApiRepository.getConfig();
    const envGroupsEnabled = process.env.ZAPI_GROUPS_ENABLED === "true";
    
    // Obter credenciais prioritariamente do ambiente (.env) se disponíveis
    const envInstanceId = process.env.ZAPI_INSTANCE_ID || "";
    const envToken = process.env.ZAPI_TOKEN || "";
    const envClientToken = process.env.ZAPI_CLIENT_TOKEN || "";
    const hasEnvWebhookUrl = Boolean(process.env.ZAPI_WEBHOOK_URL?.trim());
    const envWebhookUrl = normalizeWebhookUrl(
      process.env.ZAPI_WEBHOOK_URL || "http://localhost:3001/api/webhooks/z-api",
    );

    if (!dbConfig) {
      dbConfig = await zApiRepository.upsertConfig({
        instanceId: envInstanceId,
        token: envToken,
        clientToken: envClientToken,
        webhookUrl: envWebhookUrl,
      });
    } else if (!dbConfig.instanceId || !dbConfig.token) {
      dbConfig = await zApiRepository.upsertConfig({
        instanceId: envInstanceId,
        token: envToken,
        clientToken: dbConfig.clientToken || envClientToken,
        webhookUrl: dbConfig.webhookUrl || envWebhookUrl,
      });
    }

    return {
      ...dbConfig,
      instanceId: dbConfig.instanceId || envInstanceId,
      token: dbConfig.token || envToken,
      clientToken: dbConfig.clientToken ?? envClientToken,
      webhookUrl: hasEnvWebhookUrl ? envWebhookUrl : normalizeWebhookUrl(dbConfig.webhookUrl || envWebhookUrl),
      // Railway can enable the feature without mutating existing production
      // rows. The admin toggle remains the source of truth when this flag is
      // absent; the environment flag is intentionally opt-in.
      groupsEnabled: Boolean(dbConfig.groupsEnabled || envGroupsEnabled),
    };
  }

  async checkStatus(overrideInstanceId?: string, overrideToken?: string) {
    const config = await this.getConfig();
    const instanceId = (overrideInstanceId !== undefined && overrideInstanceId !== "") ? overrideInstanceId : config.instanceId;
    const token = (overrideToken !== undefined && overrideToken !== "") ? overrideToken : config.token;

    if (!instanceId || !token) {
      return { connected: false, message: "Instância Z-API não configurada no servidor." };
    }

    try {
      const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
        },
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        const friendlyMessage = parseZApiError(response.status, data);
        return { connected: false, message: friendlyMessage };
      }

      const connected = data.connected === true || data.status === "CONNECTED" || data.signed === true;
      const detectedPhone = canonicalJid(String(data.phone || data.connectedPhone || data.phoneNumber || data.device?.phone || ""));
      if (connected && detectedPhone && !overrideInstanceId && !overrideToken) {
        await zApiRepository.updateInstancePhone(detectedPhone);
      }

      return {
        connected,
        message: connected
          ? "WhatsApp Conectado e Operacional!"
          : "WhatsApp Desconectado. Aponte a câmera do WhatsApp para o QR Code para conectar.",
      };
    } catch (err: any) {
      logger.error(err, "Erro ao consultar status da Z-API");
      return {
        connected: false,
        message: `Servidor inacessível: ${err.message || "Erro de conexão"}`,
      };
    }
  }

  async getQrCodeImage() {
    const config = await this.getConfig();
    if (!config.instanceId || !config.token) {
      return { connected: false, error: "Instância Z-API não configurada." };
    }

    // Checar primeiro se já está conectado
    const status = await this.checkStatus();
    if (status.connected) {
      return { connected: true, message: "WhatsApp já está conectado!" };
    }

    try {
      // Endpoint de imagem/base64 do QR Code da Z-API
      const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/qr-code/image`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
        },
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        // Tentar endpoint alternativo qr-code
        const altUrl = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/qr-code`;
        const altResponse = await fetch(altUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
          },
        });
        const altData = (await altResponse.json().catch(() => ({}))) as any;
        if (altResponse.ok && altData.value) {
          const qrSrc = altData.value.startsWith("data:") ? altData.value : `data:image/png;base64,${altData.value}`;
          return { connected: false, qrCode: qrSrc };
        }

        return { connected: false, error: parseZApiError(response.status, data) };
      }

      if (data.value) {
        const qrSrc = data.value.startsWith("data:") ? data.value : `data:image/png;base64,${data.value}`;
        return { connected: false, qrCode: qrSrc };
      }

      return { connected: false, error: "QR Code temporariamente indisponível na Z-API." };
    } catch (err: any) {
      logger.error(err, "Erro ao obter QR Code da Z-API");
      return { connected: false, error: `Falha ao buscar QR Code: ${err.message}` };
    }
  }

  async disconnect() {
    const config = await this.getConfig();
    if (!config.instanceId || !config.token) {
      throw new Error("Instância Z-API não configurada.");
    }

    try {
      const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/disconnect`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
        },
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        throw new Error(parseZApiError(response.status, data));
      }

      return { success: true, message: "WhatsApp desconectado com sucesso. Um novo QR Code pode ser gerado." };
    } catch (err: any) {
      logger.error(err, "Erro ao desconectar instância Z-API");
      throw new Error(err.message || "Erro ao desconectar WhatsApp.");
    }
  }

  async sendText(phone: string, text: string) {
    const config = await this.getConfig();
    if (!config.isActive || !config.instanceId || !config.token) {
      logger.warn("Z-API desativada ou sem credenciais. Mensagem não enviada.");
      return null;
    }

    const formattedPhone = this.formatPhone(phone);
    const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-text`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: text,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        const errorMsg = parseZApiError(response.status, data);
        logger.error({ status: response.status, errorMsg }, "Erro retornado pela Z-API ao enviar texto");
        return { error: errorMsg };
      }

      logger.info({ status: response.status }, "Mensagem Z-API enviada com sucesso");
      return data;
    } catch (err: any) {
      logger.error({ err }, "Erro ao enviar mensagem Z-API");
      return { error: err.message || "Falha na requisição Z-API" };
    }
  }

  private async sendTextToTarget(target: string, text: string) {
    const config = await this.getConfig();
    if (!config.isActive || !config.instanceId || !config.token) return null;
    try {
      const response = await fetch(`https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(config.clientToken ? { "Client-Token": config.clientToken } : {}) },
        body: JSON.stringify({ phone: target, message: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return { error: parseZApiError(response.status, data) };
      return data;
    } catch (error: any) {
      return { error: error?.message || "Falha na requisição Z-API" };
    }
  }

  async sendButtonList(phone: string, message: string, options: BotOption[]) {
    const config = await this.getConfig();
    if (!config.isActive || !config.instanceId || !config.token) return null;

    const formattedPhone = this.formatPhone(phone);
    const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-button-list`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
        },
        body: JSON.stringify(buildButtonListPayload(formattedPhone, message, options)),
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok || data?.error || data?.success === false) {
        // Fallback para envio de mensagem em formato texto se o endpoint de botões/opções falhar
        logger.error({ error: parseZApiError(response.status, data) }, "Falha ao enviar botões Z-API.");
        const fallbackText = `${message}\n\n${options
          .map((option, index) => `${index + 1}. ${option.label}`)
          .join("\n")}`;
        return this.sendText(phone, fallbackText);
      }

      logger.info({ status: response.status, optionCount: options.length }, "Botões Z-API enviados com sucesso");
      return data;
    } catch (err) {
      logger.error(err, "Falha ao enviar lista de opções Z-API. Usando fallback de texto.");
      const fallbackText = `${message}\n\n${options
        .map((option, index) => `${index + 1}. ${option.label}`)
        .join("\n")}`;
      return this.sendText(phone, fallbackText);
    }
  }

  async updateWebhookUrl(webhookUrl: string) {
    const config = await this.getConfig();
    if (!config.instanceId || !config.token) {
      throw new Error("Credenciais da Z-API não configuradas.");
    }

    const normalizedWebhookUrl = normalizeWebhookUrl(webhookUrl);
    let parsedWebhookUrl: URL;
    try {
      parsedWebhookUrl = new URL(normalizedWebhookUrl);
    } catch {
      throw new Error("Informe uma URL pública HTTPS válida para o webhook.");
    }
    if (
      parsedWebhookUrl.protocol !== "https:" ||
      ["localhost", "127.0.0.1"].includes(parsedWebhookUrl.hostname)
    ) {
      throw new Error("A Z-API exige um webhook público HTTPS; localhost não recebe mensagens externas.");
    }

    const url = `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/update-webhook-received`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(config.clientToken ? { "Client-Token": config.clientToken } : {}),
        },
        body: JSON.stringify({ value: normalizedWebhookUrl }),
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        const errorMsg = parseZApiError(response.status, data);
        throw new Error(errorMsg);
      }

      await zApiRepository.upsertConfig({
        instanceId: config.instanceId,
        token: config.token,
        webhookUrl: normalizedWebhookUrl,
      });

      return { success: true, message: "URL de Webhook registrada com sucesso na Z-API!" };
    } catch (err: any) {
      throw new Error(err.message || "Não foi possível registrar o webhook na Z-API.");
    }
  }

  async handleIncomingWebhook(payload: ZApiReceivedWebhook) {
    logger.info({ callbackType: payload?.type, externalEventId: payload?.messageId || payload?.id }, "Webhook recebido da Z-API");

    const config = await this.getConfig();
    const isGroup = payload.isGroup === true;
    if (isGroup) {
      if (!config.groupsEnabled) return { status: "ignored_groups_disabled" };
      const participant = payload.participantPhone || payload.participant;
      if (!participant || !payload.phone) return { status: "ignored_invalid_group_context" };
      const mentions = collectMentionValues(payload);
      if (!mentions.length && !hasTextMention(payload)) return { status: "ignored_no_mention" };
      if (payload.broadcast === true || hasBroadcastMention(mentions)) return { status: "ignored_broadcast_mention" };
      const instancePhone = canonicalJid(config.instancePhone || payload.connectedPhone || "");
      if (!instancePhone) return { status: "ignored_instance_phone_unavailable" };
      // Prefer the explicit mention list. If the provider omits it, the text
      // fallback is the only signal available and is guarded by the @ token.
      if (mentions.length && !mentions.some((jid) => canonicalJid(jid) === instancePhone)) return { status: "ignored_not_mentioned" };
      if (await zApiRepository.findIncomingMessage(payload.messageId)) return { status: "duplicate_event" };
      const reserved = await zApiRepository.reserveGroupMention(
        hashIdentifier(String(payload.phone)),
        hashIdentifier(String(payload.participant)),
        config.groupCooldownSeconds,
      );
      if (!reserved) return { status: "cooldown" };
    }

    const incoming = parseIncomingMessage(payload);
    if (!incoming) return { status: "ignored" };

    const phone = this.formatPhone(incoming.phone);
    let contact = await zApiRepository.findContactByPhone(phone);
    if (!contact) contact = await zApiRepository.createContact(phone, incoming.senderName);

    let activeConversation = await zApiRepository.findActiveConversationByContact(contact.id);
    const isNewConversation = !activeConversation;
    if (!activeConversation) {
      activeConversation = await zApiRepository.createConversation(
        contact.id,
        "OPEN",
        "AWAITING_TEAM",
        incoming.group ? { chatName: incoming.group.name, participant: phone } : undefined,
      );
    } else if (incoming.group) {
      await zApiRepository.updateGroupContext(activeConversation.id, incoming.group.name, phone);
    }

    const conversationId = activeConversation.id;
    // Z-API examples may represent `momment` in Unix seconds or milliseconds.
    const rawMoment = Number(payload.momment);
    const sourceTimeCandidate = new Date(rawMoment < 1_000_000_000_000 ? rawMoment * 1000 : rawMoment);
    const now = new Date();
    const sourceCreatedAt =
      Number.isFinite(sourceTimeCandidate.getTime()) && sourceTimeCandidate.getTime() <= now.getTime() + 5 * 60_000
        ? sourceTimeCandidate
        : now;
    const retentionDays = Math.min(30, Math.max(1, Number(process.env.MEDIA_RETENTION_DAYS ?? "30") || 30));
    const expiresAt = new Date(sourceCreatedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);
    const mediaUnavailable = Boolean(incoming.media?.downloadError) || incoming.media?.viewOnce === true;
    const alreadyExpired = expiresAt.getTime() <= now.getTime();
    const mediaData = incoming.media && process.env.MEDIA_ZAPI_INGESTION_ENABLED !== "false"
      ? {
          type: incoming.media.type,
          status: alreadyExpired ? ("EXPIRED" as const) : mediaUnavailable ? ("UNAVAILABLE" as const) : ("AVAILABLE" as const),
          mimeType: incoming.media.mimeType,
          caption: incoming.media.caption || null,
          originalFileName: incoming.media.originalFileName || null,
          title: incoming.media.title || null,
          ptt: incoming.media.ptt ?? null,
          seconds: incoming.media.seconds ?? null,
          width: incoming.media.width ?? null,
          height: incoming.media.height ?? null,
          pageCount: incoming.media.pageCount ?? null,
          viewOnce: incoming.media.viewOnce,
          sourceUrlCiphertext:
            !alreadyExpired && !mediaUnavailable && incoming.media.sourceUrl
              ? mediaCryptoService.encryptUrl(incoming.media.sourceUrl)
              : null,
          thumbnailUrlCiphertext:
            !alreadyExpired && !mediaUnavailable && incoming.media.thumbnailUrl
              ? mediaCryptoService.encryptUrl(incoming.media.thumbnailUrl)
              : null,
          encryptionKeyVersion: mediaCryptoService.encryptionKeyVersion(),
          sourceCreatedAt,
          expiresAt,
          failureCode: alreadyExpired
            ? "SOURCE_ALREADY_EXPIRED"
            : incoming.media.viewOnce
              ? "VIEW_ONCE_NOT_AVAILABLE"
              : incoming.media.downloadError
                ? "ZAPI_DOWNLOAD_ERROR"
                : null,
        }
      : undefined;

    const persisted = await zApiRepository.addIncomingMessage({
      conversationId,
      externalMessageId: payload.messageId,
      content: incoming.content,
      senderContactId: contact.id,
      senderNameSnapshot: incoming.senderName,
      media: mediaData,
    });
    if (persisted.duplicate) return { status: "duplicate_event" };
    const savedMsg = persisted.message;
    if (incoming.group) await labelsService.assignSystem(conversationId, "GROUP");

    socketEmitter.emitToConversation(conversationId, "message:new", {
      conversationId,
      message: {
        id: savedMsg.id,
        direction: savedMsg.direction,
        senderType: savedMsg.senderType,
        senderName: savedMsg.senderNameSnapshot || incoming.senderName,
        senderContactId: savedMsg.senderContactId,
        content: savedMsg.content,
        createdAt: savedMsg.createdAt.toISOString(),
        media: savedMsg.media ? mediaService.toPublic(savedMsg.media) : null,
      },
    });

    conversationEvents.emit("conversation_updated", {
      conversationId,
      status: activeConversation.status,
      eventType: "MESSAGE_RECEIVED",
      messageId: savedMsg.id,
      departmentId: activeConversation.departmentId,
      assignedAgentId: activeConversation.assignedAgentId,
    });

    // Reset inactivity warning whenever the client sends a new message
    if (activeConversation.warningSentAt) {
      await zApiRepository.resetInactivityWarning(conversationId);
      logger.info({ conversationId }, "inactivity warning reset due to new client message");
    }

    if (incoming.group) {
      const confirmation = renderGroupTemplate(config.groupConfirmMessage, incoming.senderName, incoming.group.name);
      const storedConfirmation = await zApiRepository.addMessage({ conversationId, direction: "OUT", senderType: "BOT", content: confirmation });
      const directResult = await this.sendText(phone, confirmation);
      if (!directResult || directResult?.error) {
        await zApiRepository.deleteMessage(storedConfirmation.id);
        logger.error({ conversationId, error: directResult?.error || "integration_inactive" }, "Falha ao confirmar menção por mensagem privada");
      }
      if (config.groupConfirmInGroup) {
        const groupResult = await this.sendTextToTarget(incoming.group.jid, confirmation);
        if (groupResult && "error" in groupResult) logger.warn({ conversationId, error: groupResult.error }, "Falha na confirmação opcional no grupo");
      }
    }
    if (!config.isActive || !config.autoReply) return { status: "auto_reply_disabled" };
    if (activeConversation.status !== "OPEN") return { status: "message_logged" };

    // Once a route has been handed to the queue (or the legacy triage is
    // awaiting an attendant), incoming messages must not restart the greeting
    // flow. They remain in the transcript for the human attendant.
    if (activeConversation.currentStep === "QUEUED" || activeConversation.currentStep === "AWAITING_DETAILS") {
      return { status: "waiting_for_agent" };
    }

    // A client may send several messages while the bot is still waiting for
    // an agent. Persist every message, but do not resend the same menu/triage
    // prompt until the cooldown expires. Explicit button/list selections are
    // always allowed through so an intentional choice is never blocked.
    const cooldownMs = botReplyCooldownMs();
    if (!isNewConversation && cooldownMs > 0 && !incoming.selectedOptionId) {
      const lastBotMessageAt = await zApiRepository.findLastBotMessageAt(conversationId);
      if (lastBotMessageAt && Date.now() - lastBotMessageAt.getTime() < cooldownMs) {
        return { status: "bot_cooldown", retryAfterMs: cooldownMs - (Date.now() - lastBotMessageAt.getTime()) };
      }
    }

    if (incoming.media && !incoming.media.caption?.trim() && !isNewConversation) {
      return { status: "media_logged" };
    }

    const execution = await flowExecutionService.execute({ conversationId, content: incoming.content, selectedOptionId: incoming.selectedOptionId, isNewConversation });
    if (execution.status !== "no_flow_configured") {
      for (const action of execution.actions) {
        if (action.type === "SEND_TEXT") {
          const storedMessage = await zApiRepository.addMessage({ conversationId, direction: "OUT", senderType: "BOT", content: action.content });
          const delivery = await this.sendText(phone, action.content);
          if (delivery?.error) {
            await zApiRepository.deleteMessage(storedMessage.id);
            await flowExecutionService.rollbackDelivery(conversationId, activeConversation.currentFlowNodeId, activeConversation.flowContext);
            logger.error({ error: delivery.error }, "Falha de entrega; avanço do fluxo revertido");
            return { status: "delivery_failed" };
          }
        } else if (action.type === "SEND_OPTIONS") {
          const storedMessage = await zApiRepository.addMessage({ conversationId, direction: "OUT", senderType: "BOT", content: action.content });
          const delivery = await this.sendButtonList(phone, action.content, action.options);
          if (delivery?.error) {
            await zApiRepository.deleteMessage(storedMessage.id);
            await flowExecutionService.rollbackDelivery(conversationId, activeConversation.currentFlowNodeId, activeConversation.flowContext);
            logger.error({ error: delivery.error }, "Falha de entrega; avanço do fluxo revertido");
            return { status: "delivery_failed" };
          }
        }
      }
      const routed = execution.status === "routed_to_department";
      const latest = await zApiRepository.getConversationContext(conversationId);
      conversationEvents.emit("conversation_updated", { conversationId, status: "OPEN", eventType: routed ? "NEW_QUEUE" : "FLOW_UPDATED", departmentId: latest?.departmentId, assignedAgentId: latest?.assignedAgentId, queuedAt: latest?.queuedAt });
      return { status: execution.status };
    }

    const flow = await zApiRepository.getLatestFlow();
    if (!flow) return { status: "no_flow_configured" };
    const options = (flow.options as BotOption[]) || [];
    if (!options.length) return { status: "no_options_configured" };

    const selectedOption = isNewConversation
      ? undefined
      : findSelectedOption(options, incoming.content, incoming.selectedOptionId);

    if (selectedOption) {
      const department = await zApiRepository.getDepartmentById(selectedOption.departmentId);
      const teamName = selectedOption.label || department?.name || "Suporte";
      const replyMessage = selectedOption.procedureMessage || `Você selecionou a equipe ${teamName}.`;

      const routedConversation = await zApiRepository.updateConversationStatus(conversationId, {
        status: "OPEN",
        departmentId: selectedOption.departmentId,
        currentStep: "AWAITING_DETAILS",
      });
      await zApiRepository.addMessage({
        conversationId,
        direction: "OUT",
        senderType: "BOT",
        content: replyMessage,
      });
      await this.sendText(phone, replyMessage);
      conversationEvents.emit("conversation_updated", { conversationId, status: "OPEN", eventType: "NEW_QUEUE", departmentId: routedConversation.departmentId, assignedAgentId: routedConversation.assignedAgentId, queuedAt: routedConversation.queuedAt });
      return { status: "routed_to_department", departmentId: selectedOption.departmentId };
    }

    const menuMessage = `${flow.greeting}\n\n${flow.menuMessage}`;
    await zApiRepository.addMessage({
      conversationId,
      direction: "OUT",
      senderType: "BOT",
      content: menuMessage,
    });
    const textResult = await this.sendText(phone, menuMessage);
    if (textResult?.error) {
      logger.error({ error: textResult.error }, "Falha ao enviar saudação do bot");
    }

    const buttonMessage = "Escolha uma equipe para iniciar o atendimento:";
    await zApiRepository.addMessage({
      conversationId,
      direction: "OUT",
      senderType: "BOT",
      content: buttonMessage,
    });
    const buttonResult = await this.sendButtonList(phone, buttonMessage, options);
    if (buttonResult?.error) {
      logger.error({ error: buttonResult.error }, "Falha ao enviar botões do bot");
    }
    conversationEvents.emit("conversation_updated", { conversationId, status: "OPEN" });

    return { status: isNewConversation ? "welcome_sent" : "menu_resent" };
  }

}

export const zApiService = new ZApiService();
