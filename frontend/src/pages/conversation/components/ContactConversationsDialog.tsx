import { useLocation } from "wouter";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactConversations } from "../hooks/use-contacts";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; contactId?: string | null; contactName: string };

export function ContactConversationsDialog({ open, onOpenChange, contactId, contactName }: Props) {
  const [, setLocation] = useLocation();
  const query = useContactConversations(contactId, open);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Conversas de {contactName}</DialogTitle>
          <DialogDescription>Atendimentos relacionados a este contato dentro do seu escopo.</DialogDescription>
        </DialogHeader>
        {query.isLoading ? <div className="flex flex-col gap-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : query.isError ? <p className="text-sm text-destructive">Não foi possível carregar as conversas.</p> : query.data?.items?.length ? (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {query.data.items.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3" key={item.id}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><Badge variant="secondary">{item.status === "CLOSED" ? "Encerrada" : "Em aberto"}</Badge>{item.departmentName ? <span className="truncate text-xs text-muted-foreground">{item.departmentName}</span> : null}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Última atividade {new Date(item.lastActivityAt).toLocaleString("pt-BR")}</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => { onOpenChange(false); setLocation(`/conversation/${item.id}`); }}><MessageCircle data-icon="inline-start" />Abrir</Button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>}
      </DialogContent>
    </Dialog>
  );
}
