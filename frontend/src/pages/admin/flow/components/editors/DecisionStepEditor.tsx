import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function DecisionStepEditor({ node, issues, onChange }: StepEditorProps) {
  return <FieldGroup><FieldDescription>As rotas abaixo serão exibidas como opções desta decisão.</FieldDescription><NameField node={node} error={issueFor(issues, "name")} onChange={onChange} /><MessageField node={node} label="Pergunta ou instrução" error={issueFor(issues, "content")} onChange={onChange} /></FieldGroup>;
}

