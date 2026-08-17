import { z } from "zod";

const slug = z.string().trim().min(2).max(40).regex(/^[A-Z0-9_]+$/, "Use apenas letras maiúsculas, números e sublinhado.");
const color = z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor hexadecimal válida.");

export const LabelIdParamsSchema = z.object({ id: z.string().uuid() }).strict();
export const ConversationLabelParamsSchema = z.object({ id: z.string().uuid(), labelId: z.string().uuid() }).strict();

export const ListLabelsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
}).strict();

export const CreateLabelBodySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug,
  color,
  icon: z.string().trim().max(50).nullable().optional(),
}).strict();

export const UpdateLabelBodySchema = CreateLabelBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Informe ao menos um campo para alteração.",
);

export const AssignLabelBodySchema = z.object({ labelId: z.string().uuid() }).strict();

export type ListLabelsQuery = z.infer<typeof ListLabelsQuerySchema>;
export type CreateLabelBody = z.infer<typeof CreateLabelBodySchema>;
export type UpdateLabelBody = z.infer<typeof UpdateLabelBodySchema>;
