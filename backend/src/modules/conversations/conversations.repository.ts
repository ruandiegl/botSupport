import { prisma } from "../../shared/prisma.js";

export class ConversationsRepository {
  async findMany(filters: { status?: string; departmentId?: string }) {
    const where: any = {};
    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }
    if (filters.departmentId && filters.departmentId !== "ALL") {
      where.departmentId = filters.departmentId;
    }

    return prisma.conversation.findMany({
      where,
      orderBy: { startedAt: "desc" },
      select: { id: true },
    });
  }

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: true,
        department: true,
        assignedAgent: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async updateStatusAndAgent(id: string, status: string, assignedAgentId?: string | null) {
    return prisma.conversation.update({
      where: { id },
      data: {
        status,
        ...(assignedAgentId !== undefined && { assignedAgentId }),
      },
    });
  }

  async close(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });
  }

  async addMessage(data: {
    conversationId: string;
    direction: string;
    senderType: string;
    senderAgentId?: string | null;
    content: string;
  }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        direction: data.direction,
        senderType: data.senderType,
        senderAgentId: data.senderAgentId ?? null,
        content: data.content,
      },
    });
  }

  async markIncomingMessagesAsRead(conversationId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        direction: "IN",
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  async findFirstAgent() {
    return prisma.agent.findFirst({
      orderBy: { name: "asc" },
    });
  }

  async findAgentById(id: string) {
    return prisma.agent.findUnique({
      where: { id },
    });
  }

  async findDepartmentById(id: string) {
    return prisma.department.findUnique({
      where: { id },
    });
  }

  async updateDepartment(id: string, departmentId: string) {
    return prisma.conversation.update({
      where: { id },
      data: { departmentId },
    });
  }
}

export const conversationsRepository = new ConversationsRepository();
