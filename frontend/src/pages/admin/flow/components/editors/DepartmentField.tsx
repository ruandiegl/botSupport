import type { FlowNode } from "@/types";
import type { StepEditorProps } from "./types";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DepartmentField({ node, departments, error, onChange }: Pick<StepEditorProps, "node" | "departments" | "onChange"> & { error?: string }) {
  const selected = departments.find((department) => department.id === node.departmentId);
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel>Departamento responsável</FieldLabel>
      <Select value={node.departmentId ?? undefined} onValueChange={(value) => onChange({ ...node, departmentId: value || null })}>
        <SelectTrigger aria-invalid={Boolean(error)}><SelectValue>{selected?.name ?? "Selecione o departamento"}</SelectValue></SelectTrigger>
        <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
          <SelectGroup>{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>Define a equipe que receberá a conversa no encaminhamento.</FieldDescription>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

