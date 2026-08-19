import type { ReactNode } from "react";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface BotExclusionFormValues {
  phone: string;
  label: string;
  reason: string;
}

interface BotExclusionFormFieldsProps {
  form: BotExclusionFormValues;
  onChange: (patch: Partial<BotExclusionFormValues>) => void;
  disabled?: boolean;
  idPrefix?: string;
  footer?: ReactNode;
}

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (!digits) return "";

  let formatted = "+" + digits.slice(0, 2);
  if (digits.length > 2) formatted += " (" + digits.slice(2, 4);
  if (digits.length >= 4) formatted += ")";
  if (digits.length > 4) formatted += " " + digits.slice(4, 9);
  if (digits.length > 9) formatted += "-" + digits.slice(9, 13);
  return formatted;
}

export function BotExclusionFormFields({
  form,
  onChange,
  disabled = false,
  idPrefix = "bot-exclusion",
  footer,
}: BotExclusionFormFieldsProps) {
  const phoneDigits = form.phone.replace(/\D/g, "");
  const phoneInvalid = phoneDigits.length > 0 && phoneDigits.length < 7;

  return (
    <FieldGroup>
      <Field data-invalid={phoneInvalid}>
        <FieldLabel htmlFor={idPrefix + "-phone"}>Número do WhatsApp</FieldLabel>
        <Input
          id={idPrefix + "-phone"}
          inputMode="tel"
          autoComplete="tel"
          maxLength={19}
          value={form.phone}
          disabled={disabled}
          aria-invalid={phoneInvalid}
          onChange={(event) => onChange({ phone: formatPhoneInput(event.target.value) })}
          placeholder="+55 (24) 99999-9999"
        />
        <FieldDescription>
          Formato automático: +xx (xx) xxxxx-xxxx. Use DDI e DDD para evitar bloquear o contato errado.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor={idPrefix + "-label"}>Nome ou identificação (opcional)</FieldLabel>
        <Input
          id={idPrefix + "-label"}
          maxLength={120}
          value={form.label}
          disabled={disabled}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Ex.: Bot de testes"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={idPrefix + "-reason"}>Motivo (opcional)</FieldLabel>
        <Input
          id={idPrefix + "-reason"}
          maxLength={500}
          value={form.reason}
          disabled={disabled}
          onChange={(event) => onChange({ reason: event.target.value })}
          placeholder="Ex.: Evitar conversa automática entre bots"
        />
      </Field>

      {footer}
    </FieldGroup>
  );
}
