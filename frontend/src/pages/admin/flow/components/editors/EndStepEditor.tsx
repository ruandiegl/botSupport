import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function EndStepEditor({ node, issues, onChange }: StepEditorProps) {
  return <FieldGroup><FieldDescription>Finaliza a automação sem colocar a conversa em uma fila.</FieldDescription><NameField node={node} error={issueFor(issues, "name")} onChange={onChange} /><MessageField node={node} label="Mensagem final (opcional)" onChange={onChange} /></FieldGroup>;
}

