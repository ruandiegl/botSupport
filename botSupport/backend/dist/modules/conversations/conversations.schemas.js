import { z } from "zod";
export const ListConversationsQuerySchema = z.object({
    status: z.string().optional(),
    departmentId: z.string().optional(),
});
export const IdParamSchema = z.object({
    id: z.string().uuid(),
});
export const AssumeConversationBodySchema = z.object({
    agentId: z.string(),
});
export const SendMessageBodySchema = z.object({
    content: z.string().min(1, "Mensagem não pode ser vazia"),
});
