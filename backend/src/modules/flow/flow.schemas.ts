import { z } from "zod";

export const FlowOptionInputSchema = z.object({
  optionKey: z.string().min(1).max(100).optional(),
  label: z.string().min(1, "Rótulo é obrigatório").max(80),
  departmentId: z.string().default(""),
  procedureMessage: z.string().max(4000).default(""),
});

export const UpdateFlowBodySchema = z.object({
  name: z.string().min(1, "Nome do fluxo é obrigatório").max(120),
  greeting: z.string().min(1, "Saudação é obrigatória").max(4000),
  menuMessage: z.string().min(1, "Mensagem do menu é obrigatória").max(4000),
  options: z.array(FlowOptionInputSchema).min(1).max(20),
});

export const FlowNodeTypeSchema = z.enum(["ENTRY", "MESSAGE", "DECISION", "ROUTE", "TRIAGE", "HANDOFF", "END"]);
export const FlowNodeInputSchema = z.object({
  id: z.string().uuid(),
  stableKey: z.string().min(1).max(100),
  type: FlowNodeTypeSchema,
  name: z.string().min(1).max(120),
  content: z.string().max(4000).default(""),
  sortOrder: z.number().int().min(0).default(0),
  config: z.record(z.unknown()).nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
});
export const FlowTransitionInputSchema = z.object({
  id: z.string().uuid(),
  fromNodeId: z.string().uuid(),
  toNodeId: z.string().uuid(),
  optionKey: z.string().min(1).max(100).nullable().optional(),
  label: z.string().max(80).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export const SaveDraftBodySchema = z.object({
  revision: z.number().int().positive(),
  nodes: z.array(FlowNodeInputSchema).min(1).max(200),
  transitions: z.array(FlowTransitionInputSchema).max(400),
});
export const DraftIdParamsSchema = z.object({ id: z.string().uuid() });
export const RevisionIdParamsSchema = z.object({ id: z.string().uuid() });

export type UpdateFlowBody = z.infer<typeof UpdateFlowBodySchema>;
export type SaveDraftBody = z.infer<typeof SaveDraftBodySchema>;
export type FlowNodeInput = z.infer<typeof FlowNodeInputSchema>;
export type FlowTransitionInput = z.infer<typeof FlowTransitionInputSchema>;
