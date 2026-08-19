import { z } from "zod";

export const BotExclusionIdParamsSchema = z.object({ id: z.string().uuid() }).strict();
const queryBoolean = z.union([z.boolean(), z.literal("true").transform(() => true), z.literal("false").transform(() => false)]);

// Keep WhatsApp numbers canonical so +55 (24) 99999-9999 and 5524999999999
// cannot create separate bypass records.
export const botPhone = z.string().trim().min(7).max(32).transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 7 && value.length <= 15, "Informe um número de telefone válido.");

export const ListBotExclusionsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  activeOnly: queryBoolean.default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
}).strict();

export const CreateBotExclusionBodySchema = z.object({
  phone: botPhone,
  label: z.string().trim().max(80).nullable().optional(),
  reason: z.string().trim().max(240).nullable().optional(),
}).strict();

export const UpdateBotExclusionBodySchema = z.object({
  phone: botPhone.optional(),
  label: z.string().trim().max(80).nullable().optional(),
  reason: z.string().trim().max(240).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo para alteração.");

export type ListBotExclusionsQuery = z.infer<typeof ListBotExclusionsQuerySchema>;
export type CreateBotExclusionBody = z.infer<typeof CreateBotExclusionBodySchema>;
export type UpdateBotExclusionBody = z.infer<typeof UpdateBotExclusionBodySchema>;
