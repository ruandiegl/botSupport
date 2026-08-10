import { prisma } from "../../shared/prisma.js";

export class ZApiRepository {
  async getConfig() {
    return prisma.zApiConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  }

  async upsertConfig(data: {
    instanceId: string;
    token: string;
    clientToken?: string;
    webhookUrl?: string;
    isActive?: boolean;
    autoReply?: boolean;
  }) {
    const existing = await this.getConfig();
    if (existing) {
      return prisma.zApiConfig.update({
        where: { id: existing.id },
        data: {
          instanceId: data.instanceId,
          token: data.token,
          clientToken: data.clientToken ?? existing.clientToken,
          webhookUrl: data.webhookUrl ?? existing.webhookUrl,
          isActive: data.isActive ?? existing.isActive,
          autoReply: data.autoReply ?? existing.autoReply,
          updatedAt: new Date(),
        },
      });
    }

    return prisma.zApiConfig.create({
      data: {
        instanceId: data.instanceId,
        token: data.token,
        clientToken: data.clientToken ?? "",
        webhookUrl: data.webhookUrl ?? "http://localhost:3001/api/webhooks/z-api",
        isActive: data.isActive ?? true,
        autoReply: data.autoReply ?? true,
      },
    });
  }

  async findContactByPhone(phone: string) {
    return prisma.contact.findUnique({
      where: { phone },
    });
  }

  async createContact(phone: string, name: string) {
    return prisma.contact.create({
      data: { phone, name },
    });
  }

  async findActiveConversationByContact(contactId: string) {
    return prisma.conversation.findFirst({
      where: {
        contactId,
        status: { not: "CLOSED" },
      },
      include: {
        contact: true,
        department: true,
        assignedAgent: true,
      },
      orderBy: { startedAt: "desc" },
    });
  }

  async createConversation(contactId: string, status = "BOT", currentStep = "AWAITING_TEAM") {
    return prisma.conversation.create({
      data: {
        contactId,
        status,
        currentStep,
      },
      include: {
        contact: true,
        department: true,
        assignedAgent: true,
      },
    });
  }

  async updateConversationStatus(
    id: string,
    data: { status: string; departmentId?: string; assignedAgentId?: string; currentStep?: string }
  ) {
    return prisma.conversation.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.assignedAgentId !== undefined && { assignedAgentId: data.assignedAgentId }),
        ...(data.currentStep !== undefined && { currentStep: data.currentStep }),
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

  async getLatestFlow() {
    return prisma.flowDefinition.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  }

  async getDepartmentById(id: string) {
    return prisma.department.findUnique({
      where: { id },
    });
  }
}

export const zApiRepository = new ZApiRepository();
