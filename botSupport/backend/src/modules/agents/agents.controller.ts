import type { Request, Response } from "express";
import { agentsService } from "./agents.service.js";

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val || "";
}

export class AgentsController {
  async list(_req: Request, res: Response): Promise<void> {
    const agents = await agentsService.list();
    res.json(agents);
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name, email, password, role, departmentId } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
      return;
    }

    try {
      const agent = await agentsService.create({ name, email, password, role, departmentId });
      res.status(201).json(agent);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao criar atendente" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    try {
      const agent = await agentsService.update(id, req.body);
      res.json(agent);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao atualizar atendente" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    try {
      const result = await agentsService.delete(id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao remover atendente" });
    }
  }
}

export const agentsController = new AgentsController();
