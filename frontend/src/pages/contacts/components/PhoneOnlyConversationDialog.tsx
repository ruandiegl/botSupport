import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

type Department = { id: string; name: string };
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments?: Department[];
  isPending?: boolean;
  error?: string;
  onSubmit: (data: { phone: string; departmentId?: string }) => void;
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, digits.length - 4)}-${digits.slice(-4)}`;
}

function canonicalPhone(value: string) {
  return value.replace(/\D/g, "");
}

export function PhoneOnlyConversationDialog({ open, onOpenChange, departments = [], isPending = false, error, onSubmit }: Props) {
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhone("");
    setDepartmentId("");
    setFormError(null);
  }, [open]);

  const submit = () => {
    const normalized = canonicalPhone(phone);
    if (normalized.length < 8 || normalized.length > 15) {
      setFormError("Informe um telefone válido com DDI e DDD quando necessário.");
      return;
    }
    setFormError(null);
    onSubmit({ phone: normalized, ...(departmentId ? { departmentId } : {}) });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!isPending) onOpenChange(value); }}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar por número de telefone</DialogTitle>
          <DialogDescription>Abra uma conversa sem precisar cadastrar o contato agora. Você poderá completar os dados depois na agenda.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={Boolean(formError)}>
            <FieldLabel htmlFor="phone-only-conversation">Número de telefone</FieldLabel>
            <Input
              id="phone-only-conversation"
              value={phone}
              onChange={(event) => { setPhone(formatPhone(event.target.value)); setFormError(null); }}
              placeholder="+55 (00) 00000-0000"
              inputMode="tel"
              autoFocus
              aria-invalid={Boolean(formError)}
            />
            <FieldDescription>O número será normalizado antes do envio. Se ainda não existir, um contato mínimo será criado.</FieldDescription>
            {formError ? <FieldError>{formError}</FieldError> : null}
          </Field>
          {departments.length ? <Field>
            <FieldLabel>Departamento (opcional)</FieldLabel>
            <Select value={departmentId || null} onValueChange={(value) => setDepartmentId(String(value ?? ""))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Sem departamento" /></SelectTrigger>
              <SelectContent side="bottom" align="start"><SelectGroup>{departments.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </Field> : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldGroup>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button type="button" onClick={submit} disabled={!phone || isPending}>
            <MessageCircle data-icon="inline-start" />
            {isPending ? <Spinner /> : "Criar conversa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
