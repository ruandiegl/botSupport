import { Contact, Mail, MessageCircle, Pencil, Phone, UsersRound } from "lucide-react";
import type { ContactShare } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  share: ContactShare;
  canCreate?: boolean;
  canUpdate?: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onNewConversation: (phone: string) => void;
  onViewConversations: () => void;
};

function displayPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, -4)}-${digits.slice(-4)}`;
  return phone;
}

export function SharedContactCard({ share, canCreate = true, canUpdate = true, onAdd, onEdit, onNewConversation, onViewConversations }: Props) {
  const phones = [...new Set(share.phones)].filter(Boolean);
  const isSaved = Boolean(share.canonicalContactId);
  return (
    <Card className="w-full max-w-md bg-card shadow-sm">
      <CardHeader className="gap-3 border-b bg-muted/20">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Contact data-icon="icon" /></div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-sm">{share.displayName}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={isSaved ? "secondary" : "outline"}>{isSaved ? "Contato cadastrado" : "Contato compartilhado"}</Badge>
              {share.organization ? <span className="truncate text-xs text-muted-foreground">{share.organization}</span> : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {phones.length ? phones.map((phone) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={phone}>
            <span className="flex min-w-0 items-center gap-2 truncate"><Phone className="shrink-0 text-muted-foreground" data-icon="inline-start" />{displayPhone(phone)}</span>
            {canCreate && isSaved ? <Button type="button" size="sm" variant="outline" onClick={() => onNewConversation(phone)}><MessageCircle data-icon="inline-start" />Conversar</Button> : null}
          </div>
        )) : <p className="text-sm text-muted-foreground">Nenhum telefone válido foi encontrado neste cartão.</p>}
        {share.email ? <p className="flex items-center gap-2 truncate text-xs text-muted-foreground"><Mail data-icon="inline-start" />{share.email}</p> : null}
        {share.note ? <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{share.note}</p> : null}
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-wrap gap-2">
        {!isSaved && canCreate ? <Button type="button" size="sm" onClick={onAdd}><Contact data-icon="inline-start" />Adicionar contato</Button> : null}
        {isSaved && canUpdate ? <Button type="button" size="sm" variant="outline" onClick={onEdit}><Pencil data-icon="inline-start" />Editar</Button> : null}
        {isSaved ? <Button type="button" size="sm" variant="ghost" onClick={onViewConversations}><UsersRound data-icon="inline-start" />Ver conversas</Button> : null}
      </CardFooter>
    </Card>
  );
}
