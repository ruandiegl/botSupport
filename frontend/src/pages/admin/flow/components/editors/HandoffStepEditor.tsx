import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { DepartmentField } from "./DepartmentField";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function HandoffStepEditor({ node, departments, issues, onChange }: StepEditorProps) {
  return <FieldGroup><FieldDescription>A conversa somente entra na fila quando alcançar esta etapa.</FieldDescription><NameField node={node} error={issueFor(issues, "name")} onChange={onChange} /><MessageField node={node} label="Mensagem antes do encaminhamento (opcional)" onChange={onChange} /><DepartmentField node={node} departments={departments} error={issueFor(issues, "departmentId")} onChange={onChange} /></FieldGroup>;
}

