import { z } from "zod";

const queryBoolean = z.union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true")
  .default(false);

const labelIds = z.string().trim().max(1500).transform((value, ctx) => {
  const ids = [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
  if (ids.length > 20 || ids.some((id) => !z.string().uuid().safeParse(id).success)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "labelIds deve conter até 20 UUIDs separados por vírgula" });
    return z.NEVER;
  }
  return ids;
});

export const ListConversationsQuerySchema = z.object({
  status: z.enum(["ALL", "OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  departmentId: z.union([z.literal("ALL"), z.string().uuid()]).optional(),
  assignedAgentId: z.union([z.literal("me"), z.string().uuid()]).optional(),
  openOnly: queryBoolean,
  unreadOnly: queryBoolean,
  labelIds: labelIds.optional(),
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

export const ListMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().trim().min(1).max(512).optional(),
}).strict();

export const AssumeConversationBodySchema = z.object({
  agentId: z.string().uuid(),
});

export const DelegateConversationBodySchema = z.object({
  agentId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
}).strict();

export const DelegationResponseBodySchema = z.object({
  assignmentId: z.string().uuid(),
  decision: z.enum(["ACCEPT", "DECLINE"]),
}).strict();

export const SendMessageBodySchema = z.object({
  content: z.string().min(1, "Mensagem não pode ser vazia"),
});

export const CreateConversationBodySchema = z.object({
  contactId: z.string().uuid(),
  phone: z.string().trim().min(7).max(32).transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 8 && value.length <= 15, "Informe um telefone válido."),
  departmentId: z.string().uuid().optional(),
}).strict();

export type ListConversationsQuery = z.infer<typeof ListConversationsQuerySchema>;
export type AssumeConversationBody = z.infer<typeof AssumeConversationBodySchema>;
export type DelegateConversationBody = z.infer<typeof DelegateConversationBodySchema>;
export type DelegationResponseBody = z.infer<typeof DelegationResponseBodySchema>;
export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;
export type CreateConversationBody = z.infer<typeof CreateConversationBodySchema>;
export type ListMessagesQuery = z.infer<typeof ListMessagesQuerySchema>;
