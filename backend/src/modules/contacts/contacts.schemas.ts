import { z } from "zod";

const phoneValue = z.string().trim().min(7).max(32).transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 8 && value.length <= 15, "Informe um telefone válido.");
const stateValue = z.string().trim().length(2, "Informe a UF com duas letras.").transform((value) => value.toUpperCase()).nullable().optional();

export const ContactIdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const ContactPhoneSchema = z.object({
  phone: phoneValue,
  label: z.string().trim().max(50).nullable().optional(),
  isPrimary: z.boolean().optional(),
}).strict();

const phonesSchema = z.array(ContactPhoneSchema).min(1).max(20).superRefine((phones, context) => {
  const values = phones.map((item) => item.phone);
  if (new Set(values).size !== values.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "Não repita o mesmo telefone." });
  if (phones.filter((item) => item.isPrimary).length > 1) context.addIssue({ code: z.ZodIssueCode.custom, message: "Escolha apenas um telefone principal." });
});

export const ListContactsQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(20),
}).strict();

export const CreateContactBodySchema = z.object({
  name: z.string().trim().min(1).max(300),
  phones: phonesSchema,
  email: z.string().trim().email().max(320).nullable().optional(),
  organization: z.string().trim().max(300).nullable().optional(),
  station: z.string().trim().max(300).nullable().optional(),
  city: z.string().trim().max(160).nullable().optional(),
  state: stateValue,
  notes: z.string().trim().max(1000).nullable().optional(),
  contactShareId: z.string().uuid().optional(),
}).strict();

export const UpdateContactBodySchema = z.object({
  name: z.string().trim().min(1).max(300).optional(),
  phones: phonesSchema.optional(),
  email: z.string().trim().email().max(320).nullable().optional(),
  organization: z.string().trim().max(300).nullable().optional(),
  station: z.string().trim().max(300).nullable().optional(),
  city: z.string().trim().max(160).nullable().optional(),
  state: stateValue,
  notes: z.string().trim().max(1000).nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo para alteração.");

export const ContactConversationQuerySchema = z.object({
  openOnly: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]).default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(20),
}).strict();

export type ListContactsQuery = z.infer<typeof ListContactsQuerySchema>;
export type CreateContactBody = z.infer<typeof CreateContactBodySchema>;
export type UpdateContactBody = z.infer<typeof UpdateContactBodySchema>;
export type ContactConversationQuery = z.infer<typeof ContactConversationQuerySchema>;
