import { useLocation } from "wouter";
import { Clock3, Contact as ContactIcon, MessageCircle, Pencil, Phone } from "lucide-react";
import type { Contact } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useContact, useContactConversations, type ContactDetail } from "../hooks/use-contacts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: string | null;
  fallbackContact: Contact;
  canUpdate?: boolean;
  onEdit: (contact: ContactDetail) => void;
  onViewConversations: () => void;
};

function displayPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, -4)}-${digits.slice(-4)}`;
  return phone || "Telefone não informado";
}

const statusLabel: Record<string, string> = { DRAFT: "Rascunho", OPEN: "Em aberto", IN_PROGRESS: "Em atendimento", CLOSED: "Encerrada" };

export function ContactProfileDialog({ open, onOpenChange, contactId, fallbackContact, canUpdate = false, onEdit, onViewConversations }: Props) {
  const [, setLocation] = useLocation();
  const contactQuery = useContact(contactId, open);
  const conversationsQuery = useContactConversations(contactId, open);
  const contact = contactQuery.data;
  const name = contact?.name || fallbackContact.name || "Contato";
  const phone = contact?.phone || fallbackContact.phone;
  const isRegistered = contact?.isRegistered ?? fallbackContact.isRegistered ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Perfil do contato</DialogTitle>
          <DialogDescription>Dados do contato e atendimentos recentes relacionados a este número.</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-xl border bg-background p-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ContactIcon data-icon="icon" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{name}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Phone data-icon="inline-start" />{displayPhone(phone)}</p>
            <Badge className="mt-3" variant={isRegistered ? "secondary" : "outline"}>{isRegistered ? "Contato cadastrado" : "Contato não cadastrado"}</Badge>
          </div>
        </div>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Atendimentos recentes</h3>
            {contactId ? <Button type="button" variant="ghost" size="sm" onClick={onViewConversations}>Ver todos</Button> : null}
          </div>
          {conversationsQuery.isLoading ? <div className="space-y-2"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div> : conversationsQuery.isError ? <p className="text-sm text-destructive">Não foi possível carregar os atendimentos.</p> : conversationsQuery.data?.items?.length ? (
            <div className="space-y-2">
              {conversationsQuery.data.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><Badge variant="secondary">{statusLabel[item.status] || item.status}</Badge>{item.departmentName ? <span className="truncate text-xs text-muted-foreground">{item.departmentName}</span> : null}</div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 data-icon="inline-start" />{new Date(item.lastActivityAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => { onOpenChange(false); setLocation(`/conversation/${item.id}`); }}><MessageCircle data-icon="inline-start" />Abrir</Button>
                </div>
              ))}
            </div>
          ) : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Nenhum atendimento recente.</p>}
        </section>

        <DialogFooter>
          {canUpdate && contact ? <Button type="button" onClick={() => onEdit(contact)}><Pencil data-icon="inline-start" />{isRegistered ? "Editar contato" : "Cadastrar contato"}</Button> : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
