import { z } from "zod";

export const agentIdSchema = z.object({ id: z.string().trim().min(1, "ID de atendente inválido") });
export const roleSchema = z.enum(["ADMIN", "SUPERVISOR", "AGENT"]);

const departmentIdSchema = z.string().uuid("Departamento inválido").nullable().optional();

export const createAgentSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().trim().email("E-mail inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: roleSchema.default("AGENT"),
  departmentId: departmentIdSchema,
  isActive: z.boolean().optional(),
}).strict();

export const updateAgentSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email("E-mail inválido").transform((value) => value.toLowerCase()).optional(),
  role: roleSchema.optional(),
  departmentId: departmentIdSchema,
  isActive: z.boolean().optional(),
}).strict();

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
}).strict();

export const statusSchema = z.object({ isActive: z.boolean() }).strict();

const queryBoolean = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

export const agentWorkloadQuerySchema = z.object({
  departmentId: z.string().uuid("Departamento inválido").optional(),
  includeOffline: queryBoolean.default(true),
  limit: z.coerce.number().int().min(1).max(100).default(100),
}).strict();

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentWorkloadQuery = z.infer<typeof agentWorkloadQuerySchema>;
