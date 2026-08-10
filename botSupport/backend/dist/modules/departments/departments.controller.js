import { departmentsService } from "./departments.service.js";
import { CreateDepartmentBodySchema, UpdateDepartmentBodySchema } from "./departments.schemas.js";
function getParam(req, key) {
    const val = req.params[key];
    return Array.isArray(val) ? val[0] : val || "";
}
export class DepartmentsController {
    async list(_req, res) {
        const departments = await departmentsService.list();
        res.json(departments);
    }
    async create(req, res) {
        const parsed = CreateDepartmentBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.message });
            return;
        }
        const department = await departmentsService.create(parsed.data);
        res.status(201).json(department);
    }
    async update(req, res) {
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
    async delete(req, res) {
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
