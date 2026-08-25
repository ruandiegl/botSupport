import { useDeferredValue, useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Search, Send, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type GroupItem = {
  id: string;
  name: string;
  unread?: number;
  lastMessageAt?: string | null;
  activeConversation?: { id: string; status: string; assignedAgentId?: string | null } | null;
};

type GroupResponse = { items: GroupItem[]; stale?: boolean; warning?: string };
type GroupHistoryResponse = { items: Array<{ id: string; direction: string; content: string; senderName: string; status: string; createdAt: string }> };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GP";
}

function readableDate(value?: string | null) {
  if (!value) return "Sem mensagens recentes";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function GroupsPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const groups = useQuery<GroupResponse>({
    queryKey: ["groups", deferredSearch],
    queryFn: () => apiFetch<GroupResponse>(`/zapi/groups${deferredSearch.trim() ? `?q=${encodeURIComponent(deferredSearch.trim())}` : ""}`),
  });
  const selected = groups.data?.items.find((item) => item.id === selectedId) ?? groups.data?.items[0] ?? null;
  const history = useQuery<GroupHistoryResponse>({
    queryKey: ["group-history", selected?.id],
    queryFn: () => apiFetch<GroupHistoryResponse>(`/zapi/groups/${selected!.id}/messages`),
    enabled: Boolean(selected),
  });

  useEffect(() => {
    if (!selectedId && groups.data?.items[0]) setSelectedId(groups.data.items[0].id);
    if (selectedId && groups.data && !groups.data.items.some((item) => item.id === selectedId)) setSelectedId(groups.data.items[0]?.id ?? null);
  }, [groups.data, selectedId]);

  const send = useMutation({
    mutationFn: (data: { groupId: string; message: string }) => apiFetch(`/zapi/groups/${data.groupId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: data.message, clientMessageId: crypto.randomUUID() }),
    }),
    onSuccess: () => {
      setMessage("");
      setFeedback("Mensagem enviada ao grupo.");
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
      void queryClient.invalidateQueries({ queryKey: ["group-history", selected?.id] });
    },
    onError: (error: Error) => setFeedback(error.message || "Não foi possível enviar a mensagem."),
  });

  if (!can("groups", "view")) return <div className="content"><Empty className="border"><EmptyHeader><EmptyTitle>Acesso restrito</EmptyTitle><EmptyDescription>Você não possui permissão para visualizar os grupos.</EmptyDescription></EmptyHeader></Empty></div>;

  return (
    <div className="content">
      <header className="page-heading">
        <div>
          <div className="eyebrow">MENSAGENS / GRUPOS</div>
          <h1>Grupos do WhatsApp</h1>
          <p className="subtle">Acompanhe as mensagens dos grupos e converse no próprio grupo quando necessário.</p>
        </div>
        <Button variant="outline" onClick={() => void groups.refetch()} disabled={groups.isFetching}><RefreshCw data-icon="inline-start" className={groups.isFetching ? "animate-spin" : undefined} />Atualizar</Button>
      </header>

      {groups.data?.stale && groups.data.warning ? <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">{groups.data.warning}</div> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
        <Card className="min-h-[520px]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2"><Users />Grupos visíveis</CardTitle>
            <CardDescription>Mensagens ficam registradas mesmo antes de uma menção ao bot.</CardDescription>
            <CardAction><Badge variant="secondary">{groups.data?.items.length ?? 0}</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3"><Search className="size-4 text-muted-foreground" /><Input aria-label="Buscar grupos" value={search} onChange={(event) => setSearch(event.target.value)} className="border-0 shadow-none" placeholder="Buscar por nome" /></div>
            {groups.isLoading ? <div className="space-y-2">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div> : groups.isError ? <Empty className="border"><EmptyHeader><EmptyTitle>Não foi possível carregar os grupos</EmptyTitle><EmptyDescription>Verifique a conexão com a Z-API ou tente novamente.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => void groups.refetch()}><RefreshCw data-icon="inline-start" />Tentar novamente</Button></EmptyContent></Empty> : groups.data?.items.length ? <div className="flex flex-col gap-1">{groups.data.items.map((group) => <button key={group.id} type="button" onClick={() => { setSelectedId(group.id); setFeedback(null); }} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${selected?.id === group.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted"}`}><Avatar><AvatarFallback>{initials(group.name)}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{group.name}</strong><small className="block truncate text-muted-foreground">{readableDate(group.lastMessageAt)}</small></span>{group.unread ? <Badge variant="secondary">{group.unread}</Badge> : null}</button>)}</div> : <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>Nenhum grupo encontrado</EmptyTitle><EmptyDescription>Sincronize a lista na tela de conexão Z-API.</EmptyDescription></EmptyHeader></Empty>}
          </CardContent>
        </Card>

        <Card className="min-h-[520px]">
          <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><MessageCircle />{selected?.name ?? "Selecione um grupo"}</CardTitle><CardDescription>{selected ? "Envie uma mensagem sem abrir um chamado privado. O histórico do grupo permanece auditável." : "Escolha um grupo para visualizar as ações disponíveis."}</CardDescription></CardHeader>
          <CardContent className="flex h-[430px] flex-col justify-end gap-3">
            {selected ? <>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border bg-muted/20 p-3">
                {history.isLoading ? <Skeleton className="h-16 w-full" /> : history.data?.items.length ? history.data.items.map((item) => <div key={item.id} className={`rounded-lg border px-3 py-2 text-sm ${item.direction === "OUT" ? "ml-8 bg-primary/10" : "mr-8 bg-background"}`}><div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"><strong className="text-foreground">{item.senderName}</strong><span>{readableDate(item.createdAt)}</span></div><p className="whitespace-pre-wrap break-words">{item.content}</p>{item.status === "FAILED" ? <small className="text-destructive">Falha no envio</small> : null}</div>) : <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">Nenhuma mensagem registrada ainda.<br />O histórico aparecerá aqui quando o grupo interagir.</div>}
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground"><p className="font-medium text-foreground">Atendimento no grupo</p><p className="mt-1">O chamado só é criado quando o bot é mencionado, conforme a configuração da conexão.</p></div>
              {can("groups", "send_message") ? <form onSubmit={(event) => { event.preventDefault(); if (!message.trim() || send.isPending) return; send.mutate({ groupId: selected.id, message: message.trim() }); }} className="flex flex-col gap-2"><Textarea value={message} onChange={(event) => { setMessage(event.target.value); setFeedback(null); }} placeholder="Escreva uma mensagem para o grupo..." maxLength={4096} className="min-h-28 resize-none" /><div className="flex items-center justify-between gap-3"><span className={`text-xs ${feedback?.startsWith("Mensagem") ? "text-emerald-600" : "text-muted-foreground"}`}>{feedback ?? `${message.length}/4096`}</span><Button type="submit" disabled={!message.trim() || send.isPending}><Send data-icon="inline-start" />{send.isPending ? "Enviando..." : "Enviar no grupo"}</Button></div></form> : <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">Seu perfil pode visualizar grupos, mas não possui permissão para enviar mensagens.</p>}
            </> : <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Selecione um grupo na lista.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
