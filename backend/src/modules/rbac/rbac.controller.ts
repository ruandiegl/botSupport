import type { Request, Response } from "express";
import { rbacService } from "./rbac.service.js";

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val || "";
}

export class RbacController {
  async getRoles(_req: Request, res: Response): Promise<void> {
    const roles = await rbacService.getRoles();
    res.json(roles);
  }

  async getPermissions(req: Request, res: Response): Promise<void> {
    const role = getParam(req, "role");
    const permissions = await rbacService.getPermissions(role);
    res.json(permissions);
  }

  async updatePermissions(req: Request, res: Response): Promise<void> {
    const role = getParam(req, "role");
    try {
      const updated = await rbacService.updatePermissions(role, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Erro ao atualizar permissões" });
    }
  }
}

export const rbacController = new RbacController();
