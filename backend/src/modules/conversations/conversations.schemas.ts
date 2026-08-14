import { z } from "zod";

const queryBoolean = z.union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true")
  .default(false);

export const ListConversationsQuerySchema = z.object({
  status: z.enum(["ALL", "OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  departmentId: z.union([z.literal("ALL"), z.string().uuid()]).optional(),
  assignedAgentId: z.union([z.literal("me"), z.string().uuid()]).optional(),
  openOnly: queryBoolean,
  unreadOnly: queryBoolean,
  q: z.string().trim().max(120).optional(),
  dateField: z.enum(["lastActivityAt", "createdAt"]).default("lastActivityAt"),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  sort: z.enum(["operational", "recent", "oldest"]).default("operational"),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(5).max(100).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.from && value.to) {
    const from = Date.parse(value.from);
    const to = Date.parse(value.to);
    if (to <= from) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to"], message: "to deve ser posterior a from" });
    if (to - from > 366 * 24 * 60 * 60 * 1000) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["from"], message: "O intervalo máximo é de 366 dias" });
  }
  if (value.to && Date.parse(value.to) > Date.now()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to"], message: "to cannot be in the future" });
  }
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

export type ListConversationsQuery = z.infer<typeof ListConversationsQuerySchema>;
export type AssumeConversationBody = z.infer<typeof AssumeConversationBodySchema>;
export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;
