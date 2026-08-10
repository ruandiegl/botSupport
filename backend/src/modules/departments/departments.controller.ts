import type { Request, Response } from "express";
import { departmentsService } from "./departments.service.js";
import { CreateDepartmentBodySchema, UpdateDepartmentBodySchema } from "./departments.schemas.js";

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val || "";
}

export class DepartmentsController {
  async list(_req: Request, res: Response): Promise<void> {
    const departments = await departmentsService.list();
    res.json(departments);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = CreateDepartmentBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const department = await departmentsService.create(parsed.data);
    res.status(201).json(department);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const parsed = UpdateDepartmentBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const department = await departmentsService.update(id, parsed.data);
    if (!department) {
      res.status(404).json({ error: "Departamento não encontrado" });
      return;
    }

    res.json(department);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const success = await departmentsService.delete(id);
    if (!success) {
      res.status(404).json({ error: "Departamento não encontrado" });
      return;
    }

    res.sendStatus(204);
  }
}

export const departmentsController = new DepartmentsController();
