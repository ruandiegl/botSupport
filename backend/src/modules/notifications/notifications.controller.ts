import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { notificationsService } from "./notifications.service.js";
import { ListNotificationsQuerySchema, NotificationIdParamSchema, NotificationPreferenceSchema } from "./notifications.schemas.js";

function idFrom(req: AuthenticatedRequest) {
  const parsed = NotificationIdParamSchema.safeParse(req.params);
  return parsed.success ? parsed.data.id : null;
}

export class NotificationsController {
  async list(req: AuthenticatedRequest, res: Response) {
    const query = ListNotificationsQuerySchema.safeParse(req.query);
    if (!query.success) return res.status(400).json({ error: query.error.message });
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });
    return res.json(await notificationsService.list(req.user.id, query.data.unreadOnly, query.data.page, query.data.limit));
  }

  async unreadCount(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });
    return res.json({ count: await notificationsService.unreadCount(req.user.id) });
  }

  async markRead(req: AuthenticatedRequest, res: Response) {
    const id = idFrom(req);
    if (!id || !req.user?.id) return res.status(400).json({ error: "ID de notificação inválido." });
    await notificationsService.markRead(id, req.user.id);
    return res.status(204).send();
  }

  async markAllRead(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });
    await notificationsService.markAllRead(req.user.id);
    return res.status(204).send();
  }

  async dismiss(req: AuthenticatedRequest, res: Response) {
    const id = idFrom(req);
    if (!id || !req.user?.id) return res.status(400).json({ error: "ID de notificação inválido." });
    await notificationsService.dismiss(id, req.user.id);
    return res.status(204).send();
  }

  async preference(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });
    const body = NotificationPreferenceSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.message });
    return res.json(await notificationsService.updatePreference(req.user.id, body.data));
  }

  async getPreference(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });
    return res.json(await notificationsService.preference(req.user.id));
  }
}

export const notificationsController = new NotificationsController();
