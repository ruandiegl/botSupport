import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import {
  AvailableShortcutsQuerySchema,
  CreateShortcutBodySchema,
  SetShortcutActiveBodySchema,
  ShortcutListQuerySchema,
  UpdateShortcutBodySchema,
} from "./shortcuts.schemas.js";
import { ShortcutError, shortcutsService } from "./shortcuts.service.js";

function actor(req: AuthenticatedRequest) {
  if (!req.user) throw new ShortcutError("Não autenticado.", 401);
  return { id: req.user.id, role: req.user.role, departmentId: req.user.departmentId };
}

function param(req: AuthenticatedRequest, key: string) {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value || "";
}

function validationError(res: Response, error: any) {
  res.status(400).json({ error: "Dados inválidos.", fields: error.flatten?.().fieldErrors || {} });
}

async function respond(res: Response, action: () => Promise<unknown>, status = 200) {
  try {
    const data = await action();
    if (status === 204) res.sendStatus(204);
    else res.status(status).json(data);
  } catch (error) {
    if (error instanceof ShortcutError) res.status(error.status).json({ error: error.message });
    else throw error;
  }
}

export class ShortcutsController {
  async list(req: AuthenticatedRequest, res: Response) {
    const parsed = ShortcutListQuerySchema.safeParse(req.query);
    if (!parsed.success) return validationError(res, parsed.error);
    await respond(res, () => shortcutsService.list(actor(req), parsed.data));
  }

  async available(req: AuthenticatedRequest, res: Response) {
    const parsed = AvailableShortcutsQuerySchema.safeParse(req.query);
    if (!parsed.success) return validationError(res, parsed.error);
    await respond(res, () => shortcutsService.available(actor(req), parsed.data.conversationId, parsed.data.q, parsed.data.type));
  }

  async get(req: AuthenticatedRequest, res: Response) {
    await respond(res, () => shortcutsService.get(param(req, "id"), actor(req)));
  }

  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = CreateShortcutBodySchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    await respond(res, () => shortcutsService.create(parsed.data, actor(req)), 201);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const parsed = UpdateShortcutBodySchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    await respond(res, () => shortcutsService.update(param(req, "id"), parsed.data, actor(req)));
  }

  async setActive(req: AuthenticatedRequest, res: Response) {
    const parsed = SetShortcutActiveBodySchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    await respond(res, () => shortcutsService.setActive(param(req, "id"), parsed.data.isActive, actor(req)));
  }

  async archive(req: AuthenticatedRequest, res: Response) {
    await respond(res, () => shortcutsService.archive(param(req, "id"), actor(req)), 204);
  }

  async registerUse(req: AuthenticatedRequest, res: Response) {
    const conversationId = typeof req.body?.conversationId === "string" ? req.body.conversationId : undefined;
    await respond(res, () => shortcutsService.registerUse(param(req, "id"), actor(req), conversationId));
  }
}

export const shortcutsController = new ShortcutsController();
