import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { AssignLabelBodySchema, ConversationLabelParamsSchema, CreateLabelBodySchema, LabelIdParamsSchema, ListLabelsQuerySchema, UpdateLabelBodySchema } from "./labels.schemas.js";
import { LabelError, labelsService } from "./labels.service.js";

function invalid(res: Response, error: any) { res.status(400).json({ error: "Dados inválidos.", fields: error.flatten?.().fieldErrors || {} }); }
async function respond(res: Response, action: () => Promise<unknown>, status = 200) {
  try { const value = await action(); status === 204 ? res.sendStatus(204) : res.status(status).json(value); }
  catch (error) { if (error instanceof LabelError) res.status(error.status).json({ error: error.message }); else throw error; }
}

export class LabelsController {
  async list(req: AuthenticatedRequest, res: Response) { const parsed = ListLabelsQuerySchema.safeParse(req.query); if (!parsed.success) return invalid(res, parsed.error); await respond(res, () => labelsService.list(parsed.data)); }
  async create(req: AuthenticatedRequest, res: Response) { const parsed = CreateLabelBodySchema.safeParse(req.body); if (!parsed.success) return invalid(res, parsed.error); await respond(res, () => labelsService.create(parsed.data), 201); }
  async update(req: AuthenticatedRequest, res: Response) { const params = LabelIdParamsSchema.safeParse(req.params); const body = UpdateLabelBodySchema.safeParse(req.body); if (!params.success) return invalid(res, params.error); if (!body.success) return invalid(res, body.error); await respond(res, () => labelsService.update(params.data.id, body.data)); }
  async delete(req: AuthenticatedRequest, res: Response) { const parsed = LabelIdParamsSchema.safeParse(req.params); if (!parsed.success) return invalid(res, parsed.error); await respond(res, () => labelsService.delete(parsed.data.id), 204); }
  async assign(req: AuthenticatedRequest, res: Response) { const params = LabelIdParamsSchema.safeParse(req.params); const body = AssignLabelBodySchema.safeParse(req.body); if (!params.success) return invalid(res, params.error); if (!body.success) return invalid(res, body.error); await respond(res, () => labelsService.assign(params.data.id, body.data.labelId, req.user), 201); }
  async remove(req: AuthenticatedRequest, res: Response) { const parsed = ConversationLabelParamsSchema.safeParse(req.params); if (!parsed.success) return invalid(res, parsed.error); await respond(res, () => labelsService.remove(parsed.data.id, parsed.data.labelId, req.user)); }
}

export const labelsController = new LabelsController();
