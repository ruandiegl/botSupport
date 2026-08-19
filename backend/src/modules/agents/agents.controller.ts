import type { Request, Response } from "express";
import { agentsService } from "./agents.service.js";
import { agentIdSchema, agentWorkloadQuerySchema, createAgentSchema, resetPasswordSchema, updateAgentSchema } from "./agents.schemas.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val || "";
}

export class AgentsController {
  async workload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query = agentWorkloadQuerySchema.parse(req.query);
      const user = req.user!;
      res.json(await agentsService.workload(query, user));
    } catch (err: any) {
      if (err?.name === "WORKLOAD_FORBIDDEN") {
        res.status(403).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: err.message || "Não foi possível carregar a carga dos atendentes." });
    }
  }

  async list(_req: Request, res: Response): Promise<void> {
    const agents = await agentsService.list();
    res.json(agents);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createAgentSchema.parse(req.body);
      const agent = await agentsService.create(data);
      res.status(201).json(agent);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao criar atendente" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    try {
      const { id: validId } = agentIdSchema.parse({ id });
      const data = updateAgentSchema.parse(req.body);
      const agent = await agentsService.update(validId, data, (req as AuthenticatedRequest).user!.id);
      res.json(agent);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao atualizar atendente" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    try {
      const { id: validId } = agentIdSchema.parse({ id });
      const result = await agentsService.delete(validId, (req as AuthenticatedRequest).user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao remover atendente" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = agentIdSchema.parse({ id: getParam(req, "id") });
      const { password } = resetPasswordSchema.parse(req.body);
      res.json(await agentsService.resetPassword(id, password));
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao redefinir senha" });
    }
  }
}

export const agentsController = new AgentsController();
