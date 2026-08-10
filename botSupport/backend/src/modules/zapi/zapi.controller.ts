import type { Request, Response } from "express";
import { zApiService } from "./zapi.service.js";
import { UpdateZApiConfigSchema, TestZApiConnectionSchema } from "./zapi.schemas.js";

export class ZApiController {
  async getConfig(_req: Request, res: Response): Promise<void> {
    const config = await zApiService.getConfig();
    res.json(config);
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    const parsed = UpdateZApiConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { zApiRepository } = await import("./zapi.repository.js");
    const updated = await zApiRepository.upsertConfig(parsed.data);
    res.json(updated);
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
    try {
      const result = await zApiService.handleIncomingWebhook(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const zApiController = new ZApiController();
