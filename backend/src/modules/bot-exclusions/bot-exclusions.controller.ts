import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { BotExclusionIdParamsSchema, CreateBotExclusionBodySchema, ListBotExclusionsQuerySchema, UpdateBotExclusionBodySchema } from "./bot-exclusions.schemas.js";
import { BotExclusionError, botExclusionsService } from "./bot-exclusions.service.js";

function invalid(res: Response, error: any) { return res.status(400).json({ error: "Dados inválidos.", fields: error.flatten?.().fieldErrors || {} }); }

async function respond(res: Response, action: () => Promise<unknown>, status = 200) {
  try { const value = await action(); return status === 204 ? res.sendStatus(204) : res.status(status).json(value); }
  catch (error) { if (error instanceof BotExclusionError) return res.status(error.status).json({ error: error.message }); throw error; }
}

export class BotExclusionsController {
  list(req: AuthenticatedRequest, res: Response) { const parsed = ListBotExclusionsQuerySchema.safeParse(req.query); if (!parsed.success) return invalid(res, parsed.error); return respond(res, () => botExclusionsService.list(parsed.data)); }
  create(req: AuthenticatedRequest, res: Response) { const parsed = CreateBotExclusionBodySchema.safeParse(req.body); if (!parsed.success) return invalid(res, parsed.error); return respond(res, () => botExclusionsService.create(parsed.data, req.user), 201); }
  update(req: AuthenticatedRequest, res: Response) { const params = BotExclusionIdParamsSchema.safeParse(req.params); const body = UpdateBotExclusionBodySchema.safeParse(req.body); if (!params.success) return invalid(res, params.error); if (!body.success) return invalid(res, body.error); return respond(res, () => botExclusionsService.update(params.data.id, body.data, req.user)); }
  remove(req: AuthenticatedRequest, res: Response) { const params = BotExclusionIdParamsSchema.safeParse(req.params); if (!params.success) return invalid(res, params.error); return respond(res, () => botExclusionsService.remove(params.data.id, req.user), 200); }
}

export const botExclusionsController = new BotExclusionsController();
