import { departmentsRepository } from "./departments.repository.js";
import type { CreateDepartmentBody, UpdateDepartmentBody } from "./departments.schemas.js";

export class DepartmentsService {
  async formatDepartment(id: string) {
    const dept = await departmentsRepository.findById(id);
    if (!dept) return null;

    return {
      id: dept.id,
      name: dept.name,
      description: dept.description,
      openCount: dept.conversations?.length ?? 0,
      procedures: dept.procedures.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        order: p.order,
      })),
    };
  }

  async list() {
    const list = await departmentsRepository.findAll();
    const results = await Promise.all(list.map((d) => this.formatDepartment(d.id)));
    return results.filter(Boolean);
  }

  async create(data: CreateDepartmentBody) {
    const created = await departmentsRepository.create({
      name: data.name,
      description: data.description,
    });

    if (data.procedures && data.procedures.length > 0) {
      await departmentsRepository.replaceProcedures(created.id, data.procedures);
    }

    return this.formatDepartment(created.id);
  }

  async update(id: string, data: UpdateDepartmentBody) {
    const existing = await departmentsRepository.findById(id);
    if (!existing) return null;

    await departmentsRepository.update(id, {
      name: data.name,
      description: data.description,
    });

    if (data.procedures !== undefined) {
      await departmentsRepository.replaceProcedures(id, data.procedures);
    }

    return this.formatDepartment(id);
  }

  async delete(id: string) {
    const existing = await departmentsRepository.findById(id);
    if (!existing) return false;

    await departmentsRepository.delete(id);
    return true;
  }
}

export const departmentsService = new DepartmentsService();
