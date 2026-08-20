import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

type Department = { id: string; name: string };
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  phones: string[];
  defaultPhone?: string | null;
  departments?: Department[];
  isPending?: boolean;
  error?: string;
  onSubmit: (data: { phone: string; departmentId?: string }) => void;
};

function displayPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, -4)}-${digits.slice(-4)}`;
  return phone;
}

export function NewConversationDialog({ open, onOpenChange, contactName, phones, defaultPhone, departments = [], isPending = false, error, onSubmit }: Props) {
  const [phone, setPhone] = useState(defaultPhone || phones[0] || "");
  const [departmentId, setDepartmentId] = useState("");
  useEffect(() => { if (open) { setPhone(defaultPhone || phones[0] || ""); setDepartmentId(""); } }, [open, defaultPhone, phones]);
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!isPending) onOpenChange(value); }}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
          <DialogDescription>Abra um atendimento manual para {contactName}. Nenhuma mensagem automática será enviada.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Telefone</FieldLabel>
            <Select value={phone || null} onValueChange={(value) => setPhone(String(value ?? ""))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Escolha um telefone" /></SelectTrigger>
              <SelectContent side="bottom" align="start"><SelectGroup>{phones.map((item) => <SelectItem key={item} value={item}>{displayPhone(item)}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <FieldDescription>O contato será criado em estado aberto para você iniciar o atendimento.</FieldDescription>
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
          <Button type="button" onClick={() => phone && onSubmit({ phone, ...(departmentId ? { departmentId } : {}) })} disabled={!phone || isPending}><MessageCircle data-icon="inline-start" />{isPending ? <Spinner /> : "Criar conversa"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
