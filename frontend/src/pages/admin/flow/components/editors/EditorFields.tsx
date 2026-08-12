import type { FlowNode } from "@/types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NameField({ node, error, onChange }: { node: FlowNode; error?: string; onChange: (node: FlowNode) => void }) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`flow-node-name-${node.id}`}>Nome da etapa</FieldLabel>
      <Input id={`flow-node-name-${node.id}`} value={node.name} aria-invalid={Boolean(error)} onChange={(event) => onChange({ ...node, name: event.target.value })} />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

export function MessageField({ node, label = "Mensagem", error, onChange }: { node: FlowNode; label?: string; error?: string; onChange: (node: FlowNode) => void }) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`flow-node-content-${node.id}`}>{label}</FieldLabel>
      <Textarea id={`flow-node-content-${node.id}`} rows={7} value={node.content} aria-invalid={Boolean(error)} onChange={(event) => onChange({ ...node, content: event.target.value })} />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

