import { useDeferredValue, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Plus, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListDepartments } from "@/pages/queue/hooks/use-queue";
import { useAuth } from "@/lib/auth-context";
import { ContactFormDialog } from "@/pages/conversation/components/ContactFormDialog";
import { NewConversationDialog } from "@/pages/conversation/components/NewConversationDialog";
import { useContacts, useCreateContact, useCreateConversation, type ContactDetail, type ContactFormData } from "@/pages/conversation/hooks/use-contacts";

type Mode = "contacts" | "create-contact" | "conversation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function phoneLabel(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  if (digits.length === 12) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  return `+${digits}`;
}

export function StartConversationDialog({ open, onOpenChange }: Props) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("contacts");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactDetail | null>(null);
  const deferredSearch = useDeferredValue(search);
  const contacts = useContacts({ q: deferredSearch, page: 1, limit: 20 });
  const { data: departments = [] } = useListDepartments();
  const availableDepartments = user?.role === "AGENT" ? departments.filter((item) => item.id === user.departmentId) : departments;
  const createContact = useCreateContact();
  const createConversation = useCreateConversation();

  useEffect(() => {
    if (!open) return;
    setMode("contacts");
    setSearch("");
    setSelected(null);
    createContact.reset();
    createConversation.reset();
  }, [open]);

  const close = () => {
    onOpenChange(false);
    setMode("contacts");
    setSelected(null);
  };

  const chooseContact = (contact: ContactDetail) => {
    setSelected(contact);
    createConversation.reset();
    setMode("conversation");
  };

  const saveContact = async (data: ContactFormData) => {
    try {
      const created = await createContact.mutateAsync(data);
      setSelected(created);
      setMode("conversation");
    } catch {
      // O erro é apresentado pelo formulário sem fechar o modal.
    }
  };

  const startConversation = async (data: { phone: string; departmentId?: string }) => {
    if (!selected) return;
    try {
      const conversation = await createConversation.mutateAsync({ contactId: selected.id, ...data });
      close();
      setLocation(`/conversation/${conversation.id}`);
    } catch {
      // O erro é apresentado no modal de confirmação dos dados.
    }
  };

  return (
    <>
      <Dialog open={open && mode === "contacts"} onOpenChange={(value) => !value && close()}>
        <DialogContent className="bg-card text-card-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Iniciar nova conversa</DialogTitle>
            <DialogDescription>Selecione um contato existente ou cadastre um novo contato antes de abrir o atendimento.</DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="new-conversation-contact-search">Buscar contato</FieldLabel>
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3">
              <Search className="text-muted-foreground" />
              <Input id="new-conversation-contact-search" value={search} onChange={(event) => setSearch(event.target.value)} className="border-0 shadow-none" placeholder="Nome, telefone ou organização" autoFocus />
            </div>
          </Field>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {contacts.isLoading ? <><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></> : contacts.isError ? (
              <Empty className="border">
                <EmptyHeader><EmptyTitle>Não foi possível carregar os contatos</EmptyTitle><EmptyDescription>Tente novamente antes de iniciar a conversa.</EmptyDescription></EmptyHeader>
                <EmptyContent><Button variant="outline" onClick={() => contacts.refetch()}>Tentar novamente</Button></EmptyContent>
              </Empty>
            ) : contacts.data?.items.length ? contacts.data.items.map((contact) => (
              <Button key={contact.id} type="button" variant="ghost" className="h-auto w-full justify-start rounded-xl border bg-background p-3 text-left" onClick={() => chooseContact(contact)}>
                <Avatar><AvatarFallback>{contact.initials}</AvatarFallback></Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{contact.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{phoneLabel(contact.phone)}{contact.organization ? ` · ${contact.organization}` : ""}</span>
                </span>
                <MessageCircle data-icon="inline-end" />
              </Button>
            )) : (
              <Empty className="border">
                <EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>Nenhum contato encontrado</EmptyTitle><EmptyDescription>Cadastre o contato para iniciar um novo atendimento.</EmptyDescription></EmptyHeader>
              </Empty>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-xs text-muted-foreground">{contacts.data?.total ?? 0} contatos encontrados</span>
            <Button type="button" onClick={() => { createContact.reset(); setMode("create-contact"); }}><Plus data-icon="inline-start" />Novo contato</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ContactFormDialog
        open={open && mode === "create-contact"}
        onOpenChange={(value) => { if (!value) setMode("contacts"); }}
        isPending={createContact.isPending}
        error={createContact.error?.message}
        onSubmit={saveContact}
      />

      <NewConversationDialog
        open={open && mode === "conversation"}
        onOpenChange={(value) => { if (!value) setMode("contacts"); }}
        contactName={selected?.name ?? "Contato"}
        phones={(selected?.phones?.length ? selected.phones.map((item) => item.phone) : selected?.phone ? [selected.phone] : [])}
        defaultPhone={selected?.phone}
        departments={availableDepartments}
        isPending={createConversation.isPending}
        error={createConversation.error?.message}
        onSubmit={startConversation}
      />
    </>
  );
}
