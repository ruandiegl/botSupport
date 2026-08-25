import type { Request, Response } from "express";
import { logger } from "../../shared/logger.js";
import { zApiService } from "./zapi.service.js";
import { UpdateZApiConfigSchema, TestZApiConnectionSchema, ZApiDeliveryWebhookSchema, ZApiMessageStatusWebhookSchema, ZApiReceivedWebhookSchema, SendGroupMessageSchema } from "./zapi.schemas.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { MultipartError, readMultipartForm } from "../../shared/multipart.js";
import { outboundMediaBodyLimit } from "../conversations/outgoing-media.js";

function toPublicConfig(config: any) {
  const { token, clientToken, instancePhone, instanceLid, ...publicConfig } = config;
  return {
    ...publicConfig,
    hasToken: Boolean(token),
    hasClientToken: Boolean(clientToken),
    instancePhoneMasked: instancePhone ? `•••• ${String(instancePhone).slice(-4)}` : null,
    hasInstanceLid: Boolean(instanceLid),
  };
}

export class ZApiController {
  async getConfig(_req: Request, res: Response): Promise<void> {
    const config = await zApiService.getConfig();
    res.json(toPublicConfig(config));
  }

  async getGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await zApiService.listGroups(typeof req.query.q === "string" ? req.query.q : undefined);
      res.json({ items: groups });
    } catch (err: any) {
      const cached = await zApiService.listCachedGroups(typeof req.query.q === "string" ? req.query.q : undefined);
      if (cached.length) {
        res.json({ items: cached, stale: true, warning: "Exibindo grupos recebidos anteriormente; não foi possível atualizar a lista na Z-API." });
        return;
      }
      res.status(502).json({ error: err?.message || "Não foi possível carregar os grupos da Z-API." });
    }
  }

  async sendGroupMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = SendGroupMessageSchema.safeParse(req.body);
    if (!parsed.success || !req.user?.id) {
      res.status(400).json({ error: parsed.success ? "Usuário não autenticado." : parsed.error.message });
      return;
    }
    try {
      const result = await zApiService.sendDirectGroupMessage(String(req.params.groupId), req.user.id, parsed.data.clientMessageId, parsed.data.message);
      res.status(result.duplicate ? 200 : 201).json({
        id: result.id,
        status: result.status,
        providerMessageId: result.providerMessageId,
        content: result.content,
        createdAt: result.createdAt,
        sentAt: result.sentAt,
        duplicate: result.duplicate,
      });
    } catch (err: any) {
      res.status(502).json({ error: err?.message || "Não foi possível enviar a mensagem para o grupo." });
    }
  }

  async getGroupHistory(req: Request, res: Response): Promise<void> {
    try {
      res.json({ items: await zApiService.listGroupHistory(String(req.params.groupId)) });
    } catch (err: any) {
      res.status(404).json({ error: err?.message || "Grupo não encontrado." });
    }
  }

  async markGroupRead(req: Request, res: Response): Promise<void> {
    try {
      res.json(await zApiService.markGroupRead(String(req.params.groupId)));
    } catch (err: any) {
      res.status(404).json({ error: err?.message || "Grupo não encontrado." });
    }
  }

  async sendGroupMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.setHeader("Cache-Control", "no-store");
    let form: Awaited<ReturnType<typeof readMultipartForm>> | null = null;
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "Usuário não autenticado." });
        return;
      }
      form = await readMultipartForm(req, outboundMediaBodyLimit());
      const result = await zApiService.sendDirectGroupMedia(String(req.params.groupId), req.user.id, {
        file: form.file,
        caption: form.fields.caption ?? "",
        clientMessageId: form.fields.clientMessageId || String(req.headers["idempotency-key"] ?? ""),
      });
      switch (result.kind) {
        case "DISABLED": res.status(503).json({ error: "Envio de mídias está desativado neste ambiente." }); return;
        case "NOT_FOUND": res.status(404).json({ error: "Grupo não encontrado ou indisponível." }); return;
        case "AGENT_UNAVAILABLE": res.status(403).json({ error: "Seu usuário não está disponível para enviar mídias." }); return;
        case "DUPLICATE": res.status(409).json({ error: "Este arquivo já está sendo processado." }); return;
        case "PROVIDER_ERROR": res.status(502).json({ error: result.error }); return;
        case "INVALID": {
          const messages: Record<string, string> = {
            FILE_REQUIRED: "Selecione um arquivo antes de enviar.",
            TYPE_NOT_ALLOWED: "Este tipo de arquivo não é permitido.",
            SIZE_LIMIT: "O arquivo é grande demais. Reduza o tamanho ou corte a mídia e tente novamente. Vídeos podem ter até 64 MB.",
            SIGNATURE_INVALID: "Não conseguimos confirmar o formato deste arquivo.",
            NAME_INVALID: "O nome do arquivo é inválido.",
            CAPTION_INVALID: "A legenda excede o limite permitido.",
            CLIENT_MESSAGE_INVALID: "Identificador de envio inválido.",
          };
          res.status(400).json({ error: messages[result.code] || "Arquivo inválido." });
          return;
        }
        case "OK": res.status(result.duplicate ? 200 : 201).json(result.message); return;
      }
    } catch (error) {
      if (error instanceof MultipartError) {
        const status = error.code === "TOO_LARGE" ? 413 : error.code === "CONTENT_TYPE" ? 415 : 400;
        res.status(status).json({
          error: error.code === "TOO_LARGE"
            ? "O arquivo é grande demais. Reduza o tamanho ou corte a mídia e tente novamente. Vídeos podem ter até 64 MB."
            : "Não foi possível ler o arquivo enviado. Selecione-o novamente.",
        });
        return;
      }
      throw error;
    } finally {
      form?.cleanup();
    }
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    const parsed = UpdateZApiConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { zApiRepository } = await import("./zapi.repository.js");
    const updated = await zApiRepository.upsertConfig(parsed.data);
    res.json(toPublicConfig(updated));
  }

  async testConnection(req: Request, res: Response): Promise<void> {
    const parsed = TestZApiConnectionSchema.safeParse(req.body);
    const instanceId = parsed.success ? parsed.data.instanceId : undefined;
    const token = parsed.success ? parsed.data.token : undefined;

    const result = await zApiService.checkStatus(instanceId, token);
    res.json(result);
  }

  async getQrCode(_req: Request, res: Response): Promise<void> {
    const result = await zApiService.getQrCodeImage();
    res.json(result);
  }

  async disconnect(_req: Request, res: Response): Promise<void> {
    try {
      const result = await zApiService.disconnect();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async setWebhookUrl(req: Request, res: Response): Promise<void> {
    const { webhookUrl } = req.body;
    if (!webhookUrl || typeof webhookUrl !== "string") {
      res.status(400).json({ error: "URL de Webhook inválida" });
      return;
    }

    try {
      const result = await zApiService.updateWebhookUrl(webhookUrl);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const statusParsed = ZApiMessageStatusWebhookSchema.safeParse(req.body);
    if (statusParsed.success) {
      try {
        const result = await zApiService.handleMessageStatusWebhook(statusParsed.data);
        logger.info(
          { callbackType: statusParsed.data.type, status: statusParsed.data.status, matched: result.matched },
          "Webhook de status de mensagem Z-API processado",
        );
        res.json({ value: true, ...result });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
      return;
    }

    const deliveryParsed = ZApiDeliveryWebhookSchema.safeParse(req.body);
    if (deliveryParsed.success) {
      try {
        const result = await zApiService.handleDeliveryWebhook(deliveryParsed.data);
        logger.info(
          { callbackType: deliveryParsed.data.type, result: result.status, providerMessageId: result.providerMessageId },
          "Webhook de entrega Z-API processado",
        );
        res.json({ value: true, ...result });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
      return;
    }

    const parsed = ZApiReceivedWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Callback Z-API inválido.", issues: parsed.error.flatten().fieldErrors });
      return;
    }
    try {
      const result = await zApiService.handleIncomingWebhook(parsed.data);
      logger.info(
        {
          callbackType: parsed.data.type,
          externalEventId: parsed.data.messageId,
          isGroup: parsed.data.isGroup === true,
          result: result.status,
        },
        "Webhook Z-API processado",
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const zApiController = new ZApiController();
