import { Building2, Mail, MapPin, MessageCircle, Pencil, Phone, Radio, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ContactDetail } from "@/pages/conversation/hooks/use-contacts";

type Props = {
  contact: ContactDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  canCreateConversation: boolean;
  onEdit: (contact: ContactDetail) => void;
  onNewConversation: (contact: ContactDetail) => void;
};

function phoneLabel(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  if (digits.length === 12) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  return `+${digits}`;
}

export function ContactDetailsDialog({ contact, open, onOpenChange, canEdit, canCreateConversation, onEdit, onNewConversation }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <Avatar className="size-12"><AvatarFallback>{contact?.initials ?? "CT"}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <DialogTitle className="truncate">{contact?.name ?? "Contato"}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">Dados cadastrados na agenda de atendimento.{contact?.profileConfirmedAt ? <Badge variant="secondary">Confirmado pelo contato</Badge> : null}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {contact ? <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm"><Phone className="text-muted-foreground" /><strong>Telefones</strong></div>
            <div className="flex flex-wrap gap-2">
              {contact.phones.map((item) => <Badge key={item.id ?? item.phone} variant={item.isPrimary ? "secondary" : "outline"}>{phoneLabel(item.phone)}{item.label ? ` · ${item.label}` : ""}</Badge>)}
            </div>
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2"><Mail className="mt-0.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">E-mail</p><p className="break-all text-sm">{contact.email || "Não informado"}</p></div></div>
            <div className="flex items-start gap-2"><Building2 className="mt-0.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Organização</p><p className="text-sm">{contact.organization || "Não informada"}</p></div></div>
            <div className="flex items-start gap-2"><Radio className="mt-0.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Emissora</p><p className="text-sm">{contact.station || "Não informada"}</p></div></div>
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Cidade/UF</p><p className="text-sm">{[contact.city, contact.state].filter(Boolean).join("/") || "Não informada"}</p></div></div>
          </div>
          <Separator />
          <div className="flex items-start gap-2"><UserRound className="mt-0.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Observações</p><p className="whitespace-pre-wrap text-sm">{contact.notes || "Nenhuma observação cadastrada."}</p></div></div>
          <p className="text-xs text-muted-foreground">Atualizado em {new Date(contact.updatedAt).toLocaleString("pt-BR")}</p>
        </div> : null}

        <DialogFooter>
          {contact && canEdit ? <Button variant="outline" onClick={() => onEdit(contact)}><Pencil data-icon="inline-start" />Editar</Button> : null}
          {contact && canCreateConversation ? <Button onClick={() => onNewConversation(contact)}><MessageCircle data-icon="inline-start" />Nova conversa</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
