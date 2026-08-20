import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContactShare } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { ContactDetail, ContactFormData } from "../hooks/use-contacts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactDetail | null;
  share?: ContactShare | null;
  isPending?: boolean;
  error?: string;
  onSubmit: (data: ContactFormData) => void;
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, digits.length - 4)}-${digits.slice(-4)}`;
}

function canonical(value: string) { return value.replace(/\D/g, ""); }

export function ContactFormDialog({ open, onOpenChange, contact, share, isPending = false, error, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");
  const [phones, setPhones] = useState<Array<{ phone: string; label: string; isPrimary: boolean }>>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const initialPhones = contact?.phones?.length
      ? contact.phones.map((item) => ({ phone: formatPhone(item.phone), label: item.label ?? "WhatsApp", isPrimary: item.isPrimary }))
      : (share?.phones || []).map((phone, index) => ({ phone: formatPhone(phone), label: index === 0 ? "WhatsApp" : "Outro", isPrimary: index === 0 }));
    setName(contact?.name ?? share?.displayName ?? "");
    setEmail(contact?.email ?? share?.email ?? "");
    setOrganization(contact?.organization ?? share?.organization ?? "");
    setNotes(contact?.notes ?? share?.note ?? "");
    setPhones(initialPhones.length ? initialPhones : [{ phone: "", label: "WhatsApp", isPrimary: true }]);
    setFormError(null);
  }, [open, contact, share]);

  const updatePhone = (index: number, value: string) => setPhones((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, phone: formatPhone(value) } : item));
  const makePrimary = (index: number) => setPhones((current) => current.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })));
  const removePhone = (index: number) => setPhones((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, isPrimary: item.isPrimary || itemIndex === 0 })));

  const submit = () => {
    const cleanPhones = phones.map((item) => ({ ...item, phone: canonical(item.phone) })).filter((item) => item.phone);
    if (!name.trim()) { setFormError("Informe o nome do contato."); return; }
    if (!cleanPhones.length || cleanPhones.some((item) => item.phone.length < 8)) { setFormError("Informe ao menos um telefone válido."); return; }
    if (new Set(cleanPhones.map((item) => item.phone)).size !== cleanPhones.length) { setFormError("Não repita o mesmo telefone."); return; }
    onSubmit({ name: name.trim(), phones: cleanPhones, email: email.trim() || null, organization: organization.trim() || null, notes: notes.trim() || null, ...(share && !contact ? { contactShareId: share.id } : {}) });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!isPending) onOpenChange(value); }}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar contato" : "Adicionar contato"}</DialogTitle>
          <DialogDescription>Organize os dados compartilhados no WhatsApp para reutilizar em novos atendimentos.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={Boolean(formError)}>
            <FieldLabel htmlFor="contact-name">Nome</FieldLabel>
            <Input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(formError)} autoFocus />
          </Field>
          <Field>
            <FieldLabel>Telefones</FieldLabel>
            <div className="flex flex-col gap-2">
              {phones.map((item, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <Input value={item.phone} onChange={(event) => updatePhone(index, event.target.value)} placeholder="+55 (00) 00000-0000" aria-label={`Telefone ${index + 1}`} />
                  <Button type="button" variant={item.isPrimary ? "secondary" : "outline"} size="sm" onClick={() => makePrimary(index)}>{item.isPrimary ? "Principal" : "Usar"}</Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover telefone" onClick={() => removePhone(index)} disabled={phones.length <= 1}><Trash2 data-icon="icon" /></Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setPhones((current) => [...current, { phone: "", label: "Outro", isPrimary: false }])}><Plus data-icon="inline-start" />Adicionar telefone</Button>
            <FieldDescription>O telefone principal será usado ao iniciar uma nova conversa.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-email">E-mail</FieldLabel>
            <Input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contato@empresa.com" />
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-organization">Organização</FieldLabel>
            <Input id="contact-organization" value={organization} onChange={(event) => setOrganization(event.target.value)} placeholder="Empresa ou emissora" />
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-notes">Observações</FieldLabel>
            <Textarea id="contact-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observações internas" rows={3} />
          </Field>
          {formError || error ? <FieldError>{formError || error}</FieldError> : null}
        </FieldGroup>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button type="button" onClick={submit} disabled={isPending}>{isPending ? <Spinner data-icon="inline-start" /> : null}{contact ? "Salvar contato" : "Adicionar contato"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
