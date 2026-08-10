import { prisma } from "../../shared/prisma.js";
export class AuthRepository {
    async findAgentByEmail(email) {
        return prisma.agent.findUnique({
            where: { email },
            include: {
                department: true,
            },
        });
    }
    async findAgentById(id) {
        return prisma.agent.findUnique({
            where: { id },
            include: {
                department: true,
            },
        });
    }
    async updateOnlineStatus(id, isOnline) {
        return prisma.agent.update({
            where: { id },
            data: { isOnline },
        });
    }
}
export const authRepository = new AuthRepository();
