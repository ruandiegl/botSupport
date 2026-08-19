import type { ReactNode } from "react";
import type { Department, ShortcutScope, ShortcutType } from "@/types";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ShortcutFormValues = {
  title: string;
  message: string;
  type: ShortcutType;
  scope: ShortcutScope;
  departmentId: string;
  isActive: boolean;
  sortOrder: number;
};

export const typeLabels: Record<ShortcutType, string> = {
  GREETING: "Saudação",
  CLOSING: "Encerramento",
  DEPARTMENT: "Departamento",
  PERSONAL: "Pessoal",
  GENERAL: "Geral",
};

export const scopeLabels: Record<ShortcutScope, string> = {
  GLOBAL: "Global",
  DEPARTMENT: "Departamento",
  PERSONAL: "Pessoal",
};

interface ShortcutFormFieldsProps {
  form: ShortcutFormValues;
  onChange: (patch: Partial<ShortcutFormValues>) => void;
  departments: Department[];
  visibleScopes: readonly ShortcutScope[];
  onInsertVariable: (variable: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  footer?: ReactNode;
}

export function ShortcutFormFields({
  form,
  onChange,
  departments,
  visibleScopes,
  onInsertVariable,
  disabled = false,
  idPrefix = "shortcut",
  footer,
}: ShortcutFormFieldsProps) {
  const titleInvalid = form.title.trim().length > 0 && form.title.trim().length < 2;
  const messageInvalid = !form.message.trim();
  const departmentInvalid = form.scope === "DEPARTMENT" && !form.departmentId;

  return (
    <FieldGroup>
      <Field data-invalid={titleInvalid}>
        <FieldLabel htmlFor={idPrefix + "-title"}>Título</FieldLabel>
        <Input id={idPrefix + "-title"} maxLength={80} value={form.title} disabled={disabled} aria-invalid={titleInvalid} onChange={(event) => onChange({ title: event.target.value })} placeholder="Ex.: Saudação para primeiro contato" />
      </Field>

      <Field data-invalid={messageInvalid}>
        <FieldLabel htmlFor={idPrefix + "-message"}>Mensagem</FieldLabel>
        <Textarea id={idPrefix + "-message"} maxLength={4000} value={form.message} disabled={disabled} aria-invalid={messageInvalid} onChange={(event) => onChange({ message: event.target.value })} placeholder="Digite a mensagem que ficará disponível no chat" className="min-h-36" />
        <FieldDescription className="flex flex-col gap-2">
          <span>Clique para inserir uma variável no texto:</span>
          <span className="flex flex-wrap gap-1">
            <Button type="button" variant="outline" size="xs" disabled={disabled} onClick={() => onInsertVariable("{agentName}")} title="Nome do atendente">+ {"{agentName}"}</Button>
            <Button type="button" variant="outline" size="xs" disabled={disabled} onClick={() => onInsertVariable("{contactName}")} title="Nome do cliente">+ {"{contactName}"}</Button>
            <Button type="button" variant="outline" size="xs" disabled={disabled} onClick={() => onInsertVariable("{departmentName}")} title="Nome do departamento">+ {"{departmentName}"}</Button>
          </span>
          <span className="self-end">{form.message.length}/4000 caracteres</span>
        </FieldDescription>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Tipo</FieldLabel>
          <Select value={form.type} onValueChange={(value) => onChange({ type: value as ShortcutType })} disabled={disabled}>
            <SelectTrigger className="w-full"><SelectValue>{typeLabels[form.type]}</SelectValue></SelectTrigger>
            <SelectContent side="bottom"><SelectGroup>{Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Escopo</FieldLabel>
          <Select value={form.scope} onValueChange={(value) => onChange({ scope: value as ShortcutScope, departmentId: value === "DEPARTMENT" ? form.departmentId : "" })} disabled={disabled}>
            <SelectTrigger className="w-full"><SelectValue>{scopeLabels[form.scope]}</SelectValue></SelectTrigger>
            <SelectContent side="bottom"><SelectGroup>{visibleScopes.map((value) => <SelectItem key={value} value={value}>{scopeLabels[value]}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>
      </div>

      {form.scope === "DEPARTMENT" ? (
        <Field data-invalid={departmentInvalid}>
          <FieldLabel>Departamento</FieldLabel>
          <Select value={form.departmentId || null} onValueChange={(value) => onChange({ departmentId: value || "" })} disabled={disabled}>
            <SelectTrigger className="w-full" aria-invalid={departmentInvalid}><SelectValue placeholder="Selecione o departamento">{departments.find((department) => department.id === form.departmentId)?.name}</SelectValue></SelectTrigger>
            <SelectContent side="bottom"><SelectGroup>{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
          {departmentInvalid ? <FieldDescription>Selecione um departamento para este escopo.</FieldDescription> : null}
        </Field>
      ) : null}

      <Field>
        <FieldLabel htmlFor={idPrefix + "-order"}>Ordem de exibição</FieldLabel>
        <Input id={idPrefix + "-order"} type="number" min={0} max={9999} value={form.sortOrder} disabled={disabled} onChange={(event) => onChange({ sortOrder: Number(event.target.value) || 0 })} />
      </Field>

      {footer}
    </FieldGroup>
  );
}
