import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { flowService } from "./flow.service.js";
import { DraftIdParamsSchema, RevisionIdParamsSchema, SaveDraftBodySchema, UpdateFlowBodySchema } from "./flow.schemas.js";

function errorStatus(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "REVISION_CONFLICT") return res.status(409).json({ error: "O rascunho foi alterado por outro usuário." });
  if (message === "DRAFT_NOT_FOUND" || message === "FLOW_NOT_FOUND") return res.status(404).json({ error: "Fluxo ou rascunho não encontrado." });
  return res.status(500).json({ error: "Não foi possível processar o fluxo." });
}
export class FlowController {
  async get(_req: AuthenticatedRequest, res: Response) { const flow = await flowService.getLatest(); return flow ? res.json(flow) : res.status(404).json({ error: "Fluxo ainda não configurado" }); }
  async update(req: AuthenticatedRequest, res: Response) { const parsed = UpdateFlowBodySchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Dados do fluxo inválidos", fields: parsed.error.flatten().fieldErrors }); try { return res.json(await flowService.update(parsed.data)); } catch (error) { return errorStatus(error, res); } }
  async published(_req: AuthenticatedRequest, res: Response) { const flow = await flowService.getPublished(); return flow ? res.json(flow) : res.status(404).json({ error: "Não há fluxo publicado." }); }
  async draft(_req: AuthenticatedRequest, res: Response) { try { return res.json(await flowService.getDraft()); } catch (error) { return errorStatus(error, res); } }
  async createDraft(_req: AuthenticatedRequest, res: Response) { try { return res.status(201).json(await flowService.createDraft()); } catch (error) { return errorStatus(error, res); } }
  async saveDraft(req: AuthenticatedRequest, res: Response) { const params = DraftIdParamsSchema.safeParse(req.params), body = SaveDraftBodySchema.safeParse(req.body); if (!params.success || !body.success) return res.status(400).json({ error: "Documento do fluxo inválido.", fields: body.success ? undefined : body.error.flatten() }); try { const result = await flowService.saveDraft(params.data.id, body.data); return result.valid ? res.json(result.flow) : res.status(400).json(result); } catch (error) { return errorStatus(error, res); } }
  async validate(req: AuthenticatedRequest, res: Response) { const parsed = DraftIdParamsSchema.safeParse(req.params); if (!parsed.success) return res.status(400).json({ error: "ID inválido." }); try { return res.json(await flowService.validateDraft(parsed.data.id)); } catch (error) { return errorStatus(error, res); } }
  async publish(req: AuthenticatedRequest, res: Response) { const parsed = DraftIdParamsSchema.safeParse(req.params); if (!parsed.success) return res.status(400).json({ error: "ID inválido." }); try { const result = await flowService.publish(parsed.data.id, req.user!.id); return result.valid ? res.json(result) : res.status(400).json(result); } catch (error) { return errorStatus(error, res); } }
  async revisions(_req: AuthenticatedRequest, res: Response) { return res.json(await flowService.listRevisions()); }
  async restore(req: AuthenticatedRequest, res: Response) { const parsed = RevisionIdParamsSchema.safeParse(req.params); if (!parsed.success) return res.status(400).json({ error: "ID inválido." }); try { return res.status(201).json(await flowService.restore(parsed.data.id)); } catch (error) { return errorStatus(error, res); } }
}
export const flowController = new FlowController();
