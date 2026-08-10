import { z } from "zod";
export const ProcedureInputSchema = z.object({
    title: z.string().min(1, "Título do procedimento é obrigatório"),
    content: z.string().min(1, "Conteúdo do procedimento é obrigatório"),
    order: z.number().int().optional(),
});
export const CreateDepartmentBodySchema = z.object({
    name: z.string().min(1, "Nome do departamento é obrigatório"),
    description: z.string().optional(),
    procedures: z.array(ProcedureInputSchema).optional(),
});
export const UpdateDepartmentBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    procedures: z.array(ProcedureInputSchema).optional(),
});
