import { prisma } from "../../shared/prisma.js";
export class ConversationsRepository {
    async findMany(filters) {
        const where = {};
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
    async findById(id) {
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
    async updateStatusAndAgent(id, status, assignedAgentId) {
        return prisma.conversation.update({
            where: { id },
            data: {
                status,
                ...(assignedAgentId !== undefined && { assignedAgentId }),
            },
        });
    }
    async close(id) {
        return prisma.conversation.update({
            where: { id },
            data: {
                status: "CLOSED",
                closedAt: new Date(),
            },
        });
    }
    async addMessage(data) {
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
    async findFirstAgent() {
        return prisma.agent.findFirst({
            orderBy: { name: "asc" },
        });
    }
    async findAgentById(id) {
        return prisma.agent.findUnique({
            where: { id },
        });
    }
    async findDepartmentById(id) {
        return prisma.department.findUnique({
            where: { id },
        });
    }
    async updateDepartment(id, departmentId) {
        return prisma.conversation.update({
            where: { id },
            data: { departmentId },
        });
    }
}
export const conversationsRepository = new ConversationsRepository();
