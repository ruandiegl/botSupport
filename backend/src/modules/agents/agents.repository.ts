import { prisma } from "../../shared/prisma.js";

export class AgentsRepository {
  async findWorkload(scope: { departmentId?: string | null; includeOffline: boolean; limit: number }) {
    const agentWhere = {
      isActive: true,
      ...(scope.departmentId ? { departmentId: scope.departmentId } : {}),
      ...(scope.includeOffline ? {} : { isOnline: true }),
    };
    const allAgentWhere = {
      isActive: true,
      ...(scope.departmentId ? { departmentId: scope.departmentId } : {}),
    };
    const [agents, totals, activeConversations] = await Promise.all([
      prisma.agent.findMany({
        where: agentWhere,
        orderBy: [{ isOnline: "desc" }, { name: "asc" }],
        take: scope.limit,
        select: {
          id: true,
          name: true,
          role: true,
          isOnline: true,
          isActive: true,
          departmentId: true,
          department: { select: { name: true } },
          conversations: {
            where: { status: "IN_PROGRESS" },
            orderBy: [{ lastActivityAt: "desc" }, { startedAt: "asc" }, { id: "asc" }],
            select: {
              id: true,
              status: true,
              startedAt: true,
              lastActivityAt: true,
              contact: { select: { name: true } },
              department: { select: { name: true } },
              _count: { select: { messages: { where: { direction: "IN", readAt: null } } } },
            },
          },
        },
      }),
      prisma.agent.groupBy({
        by: ["isOnline"],
        where: allAgentWhere,
        _count: { _all: true },
      }),
      prisma.conversation.count({
        where: {
          status: "IN_PROGRESS",
          assignedAgentId: { not: null },
          ...(scope.departmentId ? { departmentId: scope.departmentId } : {}),
        },
      }),
    ]);

    return { agents, totals, activeConversations };
  }

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
    isActive?: boolean;
  }) {
    return prisma.agent.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || "AGENT",
        departmentId: data.departmentId ?? null,
        isActive: data.isActive ?? true,
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
      isActive?: boolean;
    }
  ) {
    return prisma.agent.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async countActiveAdmins() {
    return prisma.agent.count({ where: { role: "ADMIN", isActive: true } });
  }

  async resetPassword(id: string, password: string) {
    return prisma.agent.update({ where: { id }, data: { password }, include: { department: true } });
  }

  async delete(id: string) {
    return prisma.agent.delete({
      where: { id },
    });
  }
}

export const agentsRepository = new AgentsRepository();
