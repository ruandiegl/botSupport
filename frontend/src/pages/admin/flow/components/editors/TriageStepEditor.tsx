import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function TriageStepEditor({ node, issues, onChange }: StepEditorProps) {
  const responseError = issueFor(issues, "responseKey");
  return (
    <FieldGroup>
      <FieldDescription>Esta etapa envia a pergunta, aguarda uma resposta e a registra antes de avançar.</FieldDescription>
      <NameField node={node} error={issueFor(issues, "name")} onChange={onChange} />
      <MessageField node={node} label="Mensagem de triagem" error={issueFor(issues, "content")} onChange={onChange} />
      <Field data-invalid={Boolean(responseError)}>
        <FieldLabel htmlFor={`flow-response-key-${node.id}`}>Chave da resposta</FieldLabel>
        <Input id={`flow-response-key-${node.id}`} value={String(node.config.responseKey ?? "")} aria-invalid={Boolean(responseError)} placeholder="Ex.: supportDetails" onChange={(event) => onChange({ ...node, config: { ...node.config, responseKey: event.target.value } })} />
        <FieldDescription>Nome técnico usado para guardar a resposta no contexto da conversa.</FieldDescription>
        {responseError ? <FieldError>{responseError}</FieldError> : null}
      </Field>
    </FieldGroup>
  );
}

