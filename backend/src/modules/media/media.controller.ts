import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { MediaAccessBodySchema } from "./media.schemas.js";
import { MediaHttpError, mediaService } from "./media.service.js";

function param(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value || "";
}

function sendError(res: Response, error: unknown) {
  if (error instanceof MediaHttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: "Não foi possível processar a mídia." });
}

export class MediaController {
  async createAccess(req: AuthenticatedRequest, res: Response) {
    const parsed = MediaAccessBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    try {
      const result = await mediaService.issueAccess(
        param(req, "conversationId"),
        param(req, "messageId"),
        parsed.data.purpose,
        req.user,
      );
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  }

  async content(req: Request, res: Response) {
    await this.proxy(req, res, "content");
  }

  async thumbnail(req: Request, res: Response) {
    await this.proxy(req, res, "thumbnail");
  }

  async download(req: Request, res: Response) {
    await this.proxy(req, res, "download");
  }

  private async proxy(req: Request, res: Response, purpose: "content" | "thumbnail" | "download") {
    const ticket = typeof req.query.ticket === "string" ? req.query.ticket : "";
    if (!ticket) {
      res.status(401).json({ error: "Ticket de mídia não fornecido." });
      return;
    }
    try {
      await mediaService.stream(param(req, "mediaId"), purpose, ticket, req, res);
    } catch (error) {
      if (!res.headersSent) sendError(res, error);
      else if (!res.writableEnded) res.destroy(error instanceof Error ? error : undefined);
    }
  }
}

export const mediaController = new MediaController();
