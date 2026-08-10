import { z } from "zod";
export const UpdateZApiConfigSchema = z.object({
    instanceId: z.string().min(1, "ID da Instância é obrigatório"),
    token: z.string().min(1, "Token da Instância é obrigatório"),
    clientToken: z.string().optional(),
    webhookUrl: z.string().optional(),
    isActive: z.boolean().optional(),
    autoReply: z.boolean().optional(),
});
export const TestZApiConnectionSchema = z.object({
    instanceId: z.string().optional(),
    token: z.string().optional(),
});
