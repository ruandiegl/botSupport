import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function EntryStepEditor({ node, issues, onChange }: StepEditorProps) {
  return <FieldGroup><FieldDescription>A entrada é o ponto estrutural único que inicia todas as conversas. Para enviar texto antes da decisão, adicione uma etapa de mensagem.</FieldDescription><NameField node={node} error={issueFor(issues, "name")} onChange={onChange} /></FieldGroup>;
}
