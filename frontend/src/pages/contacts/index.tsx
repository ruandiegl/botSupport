import { useDeferredValue, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Building2, Eye, Mail, MessageCircle, Pencil, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactFormDialog } from "@/pages/conversation/components/ContactFormDialog";
import { NewConversationDialog } from "@/pages/conversation/components/NewConversationDialog";
import { useListDepartments } from "@/pages/queue/hooks/use-queue";
import { useContacts, useCreateContact, useCreateConversation, useUpdateContact, type ContactDetail, type ContactFormData } from "@/pages/conversation/hooks/use-contacts";
import { ContactDetailsDialog } from "./components/ContactDetailsDialog";
import { StartConversationDialog } from "./components/StartConversationDialog";

const CONTACTS_PER_PAGE = 12;

function phoneLabel(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  if (digits.length === 12) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  return `+${digits}`;
}

export default function ContactsPage() {
  const [, setLocation] = useLocation();
  const { can, user } = useAuth();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [viewing, setViewing] = useState<ContactDetail | null>(null);
  const [editing, setEditing] = useState<ContactDetail | null>(null);
  const [conversationContact, setConversationContact] = useState<ContactDetail | null>(null);
  const contacts = useContacts({ q: deferredSearch, page, limit: CONTACTS_PER_PAGE });
  const { data: departments = [] } = useListDepartments();
  const availableDepartments = user?.role === "AGENT" ? departments.filter((item) => item.id === user.departmentId) : departments;
  const createContact = useCreateContact();
  const updateContact = useUpdateContact(editing?.id ?? "");
  const createConversation = useCreateConversation();
  const totalPages = Math.max(1, contacts.data?.totalPages ?? 1);

  useEffect(() => setPage(1), [deferredSearch]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  const saveNewContact = async (data: ContactFormData) => {
    try {
      await createContact.mutateAsync(data);
      setCreateOpen(false);
    } catch {
      // O modal mantém o erro e os dados preenchidos.
    }
  };

  const saveContact = async (data: ContactFormData) => {
    if (!editing) return;
    try {
      await updateContact.mutateAsync(data);
      setEditing(null);
    } catch {
      // O modal mantém o erro e os dados preenchidos.
    }
  };

  const startConversation = async (data: { phone: string; departmentId?: string }) => {
    if (!conversationContact) return;
    try {
      const conversation = await createConversation.mutateAsync({ contactId: conversationContact.id, ...data });
      setConversationContact(null);
      setLocation(`/conversation/${conversation.id}`);
    } catch {
      // O erro é apresentado no modal.
    }
  };

  return (
    <div className="content">
      <PageHeader
        eyebrow="Atendimento / relacionamento"
        title="Contatos"
        description="Consulte, organize e inicie atendimentos para os contatos salvos no sistema."
        action={<div className="flex flex-wrap items-center justify-end gap-2">
          {can("contacts", "create") ? <Button variant="outline" onClick={() => setStartOpen(true)}><MessageCircle data-icon="inline-start" />Nova conversa</Button> : null}
          {can("contacts", "create") ? <Button onClick={() => { createContact.reset(); setCreateOpen(true); }}><Plus data-icon="inline-start" />Novo contato</Button> : null}
        </div>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users />Agenda de contatos</CardTitle>
          <CardDescription>{contacts.data?.total ?? 0} contatos disponíveis no seu escopo de atendimento.</CardDescription>
          <CardAction>
            <Badge variant="secondary">{contacts.data?.total ?? 0} cadastrados</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3">
            <Search className="text-muted-foreground" />
            <Input aria-label="Buscar contatos" value={search} onChange={(event) => setSearch(event.target.value)} className="border-0 shadow-none" placeholder="Buscar por nome, telefone ou organização" />
          </div>

          {contacts.isLoading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-40 w-full" />)}</div> : contacts.isError ? (
            <Empty className="border">
              <EmptyHeader><EmptyTitle>Não foi possível carregar os contatos</EmptyTitle><EmptyDescription>Verifique sua conexão e tente novamente.</EmptyDescription></EmptyHeader>
              <EmptyContent><Button variant="outline" onClick={() => contacts.refetch()}><RefreshCw data-icon="inline-start" />Tentar novamente</Button></EmptyContent>
            </Empty>
          ) : contacts.data?.items.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contacts.data.items.map((contact) => (
                <Card key={contact.id} size="sm" className="h-full">
                  <CardHeader>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar><AvatarFallback>{contact.initials}</AvatarFallback></Avatar>
                      <div className="min-w-0"><CardTitle className="truncate">{contact.name}</CardTitle><CardDescription className="truncate">{phoneLabel(contact.phone)}</CardDescription></div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2">
                    {contact.station || contact.organization ? <p className="flex items-center gap-2 truncate text-sm"><Building2 className="text-muted-foreground" />{contact.station || contact.organization}</p> : null}
                    {contact.email ? <p className="flex items-center gap-2 truncate text-sm"><Mail className="text-muted-foreground" />{contact.email}</p> : null}
                    {contact.city || contact.state ? <p className="text-sm text-muted-foreground">{[contact.city, contact.state].filter(Boolean).join("/")}</p> : null}
                    {!contact.station && !contact.organization && !contact.email && !contact.city ? <p className="text-sm text-muted-foreground">Sem informações complementares.</p> : null}
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewing(contact)}><Eye data-icon="inline-start" />Visualizar</Button>
                    {can("contacts", "update") ? <Button variant="ghost" size="sm" onClick={() => { updateContact.reset(); setEditing(contact); }}><Pencil data-icon="inline-start" />Editar</Button> : null}
                    {can("contacts", "create") ? <Button size="sm" onClick={() => { createConversation.reset(); setConversationContact(contact); }}><MessageCircle data-icon="inline-start" />Conversar</Button> : null}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Empty className="border">
              <EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>Nenhum contato encontrado</EmptyTitle><EmptyDescription>{search ? "Tente buscar por outro nome ou telefone." : "Cadastre o primeiro contato para iniciar uma conversa manual."}</EmptyDescription></EmptyHeader>
              {can("contacts", "create") ? <EmptyContent><Button onClick={() => setCreateOpen(true)}><Plus data-icon="inline-start" />Novo contato</Button></EmptyContent> : null}
            </Empty>
          )}

          {(contacts.data?.total ?? 0) > 0 ? <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <span className="text-xs text-muted-foreground">Página {page} de {totalPages}</span>
            <Pagination className="mx-0 w-auto"><PaginationContent><PaginationItem><PaginationPrevious href="#" aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-50" : undefined} onClick={(event) => { event.preventDefault(); setPage((current) => Math.max(1, current - 1)); }} /></PaginationItem>{Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((item) => <PaginationItem key={item}><PaginationLink href="#" isActive={item === page} onClick={(event) => { event.preventDefault(); setPage(item); }}>{item}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#" aria-disabled={page === totalPages} className={page === totalPages ? "pointer-events-none opacity-50" : undefined} onClick={(event) => { event.preventDefault(); setPage((current) => Math.min(totalPages, current + 1)); }} /></PaginationItem></PaginationContent></Pagination>
          </div> : null}
        </CardContent>
      </Card>

      <ContactFormDialog open={createOpen} onOpenChange={setCreateOpen} isPending={createContact.isPending} error={createContact.error?.message} onSubmit={saveNewContact} />
      <ContactFormDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} contact={editing} isPending={updateContact.isPending} error={updateContact.error?.message} onSubmit={saveContact} />
      <ContactDetailsDialog contact={viewing} open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)} canEdit={can("contacts", "update")} canCreateConversation={can("contacts", "create")} onEdit={(contact) => { setViewing(null); setEditing(contact); }} onNewConversation={(contact) => { setViewing(null); setConversationContact(contact); }} />
      <NewConversationDialog open={Boolean(conversationContact)} onOpenChange={(open) => !open && setConversationContact(null)} contactName={conversationContact?.name ?? "Contato"} phones={conversationContact?.phones?.map((item) => item.phone) ?? []} defaultPhone={conversationContact?.phone} departments={availableDepartments} isPending={createConversation.isPending} error={createConversation.error?.message} onSubmit={startConversation} />
      <StartConversationDialog open={startOpen} onOpenChange={setStartOpen} />
    </div>
  );
}
