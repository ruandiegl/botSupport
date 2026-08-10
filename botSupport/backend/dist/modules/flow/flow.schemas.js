import { z } from "zod";
export const FlowOptionInputSchema = z.object({
    label: z.string().min(1, "Rótulo é obrigatório"),
    departmentId: z.string().min(1, "Departamento é obrigatório"),
    procedureMessage: z.string().min(1, "Mensagem do procedimento é obrigatória"),
});
export const UpdateFlowBodySchema = z.object({
    name: z.string().min(1, "Nome do fluxo é obrigatório"),
    greeting: z.string().min(1, "Saudação é obrigatória"),
    menuMessage: z.string().min(1, "Mensagem do menu é obrigatória"),
    options: z.array(FlowOptionInputSchema),
});
