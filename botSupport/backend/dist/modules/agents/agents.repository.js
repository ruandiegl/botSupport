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
    async findById(id) {
        return prisma.agent.findUnique({
            where: { id },
            include: { department: true },
        });
    }
    async create(data) {
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
    async update(id, data) {
        return prisma.agent.update({
            where: { id },
            data,
            include: { department: true },
        });
    }
    async delete(id) {
        return prisma.agent.delete({
            where: { id },
        });
    }
}
export const agentsRepository = new AgentsRepository();
