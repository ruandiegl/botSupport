import { z } from "zod";

export const ShortcutTypeSchema = z.enum(["GREETING", "CLOSING", "DEPARTMENT", "PERSONAL", "GENERAL"]);
export const ShortcutScopeSchema = z.enum(["GLOBAL", "DEPARTMENT", "PERSONAL"]);

export const ShortcutListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  type: ShortcutTypeSchema.optional(),
  scope: ShortcutScopeSchema.optional(),
  departmentId: z.string().uuid().optional(),
  active: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const AvailableShortcutsQuerySchema = z.object({
  conversationId: z.string().uuid(),
  q: z.string().trim().max(120).optional(),
  type: ShortcutTypeSchema.optional(),
});

const ShortcutFieldsSchema = z.object({
  title: z.string().trim().min(2).max(80),
  message: z.string().trim().min(1).max(4000),
  type: ShortcutTypeSchema,
  scope: ShortcutScopeSchema,
  departmentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const CreateShortcutBodySchema = ShortcutFieldsSchema.superRefine((value, context) => {
  if (value.scope === "DEPARTMENT" && !value.departmentId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["departmentId"], message: "Selecione um departamento." });
  }
});

export const UpdateShortcutBodySchema = ShortcutFieldsSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Informe ao menos um campo para atualização."
);

export const SetShortcutActiveBodySchema = z.object({ isActive: z.boolean() });

export type ShortcutListQuery = z.infer<typeof ShortcutListQuerySchema>;
export type CreateShortcutBody = z.infer<typeof CreateShortcutBodySchema>;
export type UpdateShortcutBody = z.infer<typeof UpdateShortcutBodySchema>;
