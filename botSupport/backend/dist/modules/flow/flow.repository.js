import { prisma } from "../../shared/prisma.js";
export class FlowRepository {
    async findLatest() {
        return prisma.flowDefinition.findFirst({
            orderBy: { updatedAt: "desc" },
        });
    }
    async upsert(data) {
        const current = await this.findLatest();
        if (current) {
            return prisma.flowDefinition.update({
                where: { id: current.id },
                data: {
                    name: data.name,
                    greeting: data.greeting,
                    menuMessage: data.menuMessage,
                    options: data.options,
                    updatedAt: new Date(),
                },
            });
        }
        return prisma.flowDefinition.create({
            data: {
                name: data.name,
                greeting: data.greeting,
                menuMessage: data.menuMessage,
                options: data.options,
            },
        });
    }
}
export const flowRepository = new FlowRepository();
