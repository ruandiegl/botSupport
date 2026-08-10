import { prisma } from "../../shared/prisma.js";

export class DepartmentsRepository {
  async findAll() {
    return prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        procedures: {
          orderBy: { order: "asc" },
        },
        conversations: {
          where: {
            status: { not: "CLOSED" },
          },
          select: { id: true },
        },
      },
    });
  }

  async create(data: { name: string; description?: string }) {
    return prisma.department.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.department.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  async delete(id: string) {
    return prisma.department.delete({
      where: { id },
    });
  }

  async replaceProcedures(
    departmentId: string,
    procedures: Array<{ title: string; content: string; order?: number }>
  ) {
    await prisma.procedure.deleteMany({
      where: { departmentId },
    });

    if (procedures.length > 0) {
      await prisma.procedure.createMany({
        data: procedures.map((p, index) => ({
          departmentId,
          title: p.title,
          content: p.content,
          order: p.order ?? index + 1,
        })),
      });
    }
  }
}

export const departmentsRepository = new DepartmentsRepository();
