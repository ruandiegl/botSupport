import { prisma } from "../../shared/prisma.js";

export class AgentsRepository {
  async findAll() {
    return prisma.agent.findMany({
      include: {
        department: true,
      },
      orderBy: [
        { isOnline: "desc" },
        { name: "asc" },
      ],
    });
  }

  async findById(id: string) {
    return prisma.agent.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    departmentId?: string | null;
  }) {
    return prisma.agent.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || "AGENT",
        departmentId: data.departmentId ?? null,
      },
      include: { department: true },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      departmentId?: string | null;
      isOnline?: boolean;
    }
  ) {
    return prisma.agent.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async delete(id: string) {
    return prisma.agent.delete({
      where: { id },
    });
  }
}

export const agentsRepository = new AgentsRepository();
