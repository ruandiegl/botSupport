import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { BusinessHoursError, businessHoursService } from "./business-hours.service.js";
import { BusinessHoursIdParamsSchema, BusinessHoursPolicyBodySchema, BusinessHoursPreviewBodySchema } from "./business-hours.schemas.js";

function invalid(res: Response, error: any) {
  return res.status(400).json({ error: "Dados inválidos.", fields: error.flatten?.().fieldErrors || {} });
}

async function respond(res: Response, action: () => Promise<unknown>, status = 200) {
  try {
    const value = await action();
    return res.status(status).json(value);
  } catch (error: any) {
    if (error instanceof BusinessHoursError) return res.status(error.status).json({ error: error.message });
    if (error?.code === "REVISION_CONFLICT") return res.status(409).json({ error: error.message });
    throw error;
  }
}

export class BusinessHoursController {
  list(_req: AuthenticatedRequest, res: Response) { return respond(res, () => businessHoursService.list()); }
  get(req: AuthenticatedRequest, res: Response) {
    const params = BusinessHoursIdParamsSchema.safeParse(req.params);
    if (!params.success) return invalid(res, params.error);
    return respond(res, () => businessHoursService.get(params.data.id));
  }
  create(req: AuthenticatedRequest, res: Response) {
    const body = BusinessHoursPolicyBodySchema.safeParse(req.body);
    if (!body.success) return invalid(res, body.error);
    return respond(res, () => businessHoursService.create(body.data, req.user?.id), 201);
  }
  update(req: AuthenticatedRequest, res: Response) {
    const params = BusinessHoursIdParamsSchema.safeParse(req.params);
    const body = BusinessHoursPolicyBodySchema.safeParse(req.body);
    if (!params.success) return invalid(res, params.error);
    if (!body.success) return invalid(res, body.error);
    return respond(res, () => businessHoursService.update(params.data.id, body.data, req.user?.id));
  }
  disable(req: AuthenticatedRequest, res: Response) {
    const params = BusinessHoursIdParamsSchema.safeParse(req.params);
    const revision = Number(req.body?.revision);
    if (!params.success) return invalid(res, params.error);
    if (!Number.isInteger(revision) || revision < 1) return res.status(400).json({ error: "Informe a revisão atual da política." });
    return respond(res, () => businessHoursService.disable(params.data.id, revision));
  }
  preview(req: AuthenticatedRequest, res: Response) {
    const body = BusinessHoursPreviewBodySchema.safeParse(req.body);
    if (!body.success) return invalid(res, body.error);
    return respond(res, () => businessHoursService.preview(body.data));
  }
}

export const businessHoursController = new BusinessHoursController();
