import type { Request, Response } from "express";
import { logger } from "../../shared/logger.js";
import { zApiService } from "./zapi.service.js";
import { UpdateZApiConfigSchema, TestZApiConnectionSchema, ZApiReceivedWebhookSchema, SendGroupMessageSchema } from "./zapi.schemas.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";

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
