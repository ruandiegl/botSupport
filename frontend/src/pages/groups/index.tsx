import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCheck, FileAudio, FileText, Film, Image as ImageIcon, MessageCircle, RefreshCw, Search, Send, TicketCheck, Users, Wifi, WifiOff } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { useSocketEvent } from "@/lib/use-socket-events";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { ChatScroller, type ChatScrollerHandle } from "@/components/ui/chat-scroller";
import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { ShortcutPicker } from "@/pages/conversation/components/ShortcutPicker";
import { MediaAttachmentPicker } from "@/pages/conversation/components/MediaAttachmentPicker";
import { MessageMedia } from "@/pages/conversation/components/MessageMedia";
import { OutgoingMediaCard } from "@/pages/conversation/components/OutgoingMediaCard";
import { renderEditedVideo, type VideoEdit } from "@/pages/conversation/components/video-processing";
import { useRegisterShortcutUse } from "@/pages/conversation/hooks/use-shortcuts";
import type { ConversationMedia, OutgoingMedia } from "@/types";

type GroupItem = {
  id: string;
  name: string;
  unread?: number;
  lastMessageAt?: string | null;
  activeConversation?: { id: string; status: string; assignedAgentId?: string | null } | null;
};
type GroupResponse = { items: GroupItem[]; stale?: boolean; warning?: string };
type GroupMessage = {
  id: string;
  direction: "IN" | "OUT" | string;
  content: string;
  messageType: string;
  senderName: string;
  status: string;
  createdAt: string;
  conversationId?: string | null;
  linkedMessageId?: string | null;
  media?: ConversationMedia | null;
  outgoingMedia?: OutgoingMedia | null;
};
type GroupHistoryResponse = { items: GroupMessage[] };
type GroupSocketMessage = { groupId: string; message: GroupMessage };
type GroupUpdated = { groupId: string; lastMessageAt?: string; unread?: number; unreadIncrement?: number; activeConversation?: GroupItem["activeConversation"] };

const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GP";
}

function readableDate(value?: string | null) {
  if (!value) return "Sem mensagens recentes";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(value) === dayKey(today.toISOString())) return "Hoje";
  if (dayKey(value) === dayKey(yesterday.toISOString())) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" }).format(date);
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function friendlyMediaError(error: unknown, file: File | null) {
  const raw = error instanceof Error ? error.message : String(error || "");
  const normalized = raw.toLowerCase();
  if (/413|payload too large|grande demais|excede|size_limit|limite/.test(normalized)) {
    return file?.type.startsWith("video/")
      ? "Este vídeo é grande demais para enviar. O limite é 64 MB. Corte ou comprima o vídeo e tente novamente."
      : "Este arquivo é grande demais para enviar. Reduza o tamanho e tente novamente.";
  }
  if (/signature|conteúdo.*tipo|formato/.test(normalized)) return "Não conseguimos reconhecer o formato deste arquivo. Selecione-o novamente.";
  return raw || "Não foi possível enviar a mídia ao grupo.";
}

function MediaPlaceholder({ type, content }: { type: string; content: string }) {
  const Icon = type === "IMAGE" ? ImageIcon : type === "VIDEO" ? Film : type === "AUDIO" ? FileAudio : FileText;
  const label = type === "IMAGE" ? "Imagem recebida" : type === "VIDEO" ? "Vídeo recebido" : type === "AUDIO" ? "Áudio recebido" : "Documento recebido";
  return (
    <Attachment size="sm" className="max-w-full">
      <AttachmentMedia><Icon /></AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{label}</AttachmentTitle>
        <AttachmentDescription>{content.startsWith("[") ? "Conteúdo registrado no histórico do grupo" : content}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}

type GroupsPageProps = {
  /** Render the group workspace inside the unified attendance queue. */
  embedded?: boolean;
};

export default function GroupsPage({ embedded = false }: GroupsPageProps = {}) {
  const { can, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isConnected, joinGroup, leaveGroup, startGroupTyping, stopGroupTyping } = useSocket();
  const registerShortcutUse = useRegisterShortcutUse();
  const scrollerRef = useRef<ChatScrollerHandle>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [typingAgents, setTypingAgents] = useState<Record<string, string>>({});
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaEdit, setMediaEdit] = useState<VideoEdit | null>(null);
  const [mediaValidationError, setMediaValidationError] = useState<string | null>(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState<number | null>(null);
  const [mediaProcessing, setMediaProcessing] = useState(false);
  const [mediaProcessingProgress, setMediaProcessingProgress] = useState<number | null>(null);

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

  const markRead = useMutation({
    mutationFn: (groupId: string) => apiFetch(`/zapi/groups/${groupId}/read`, { method: "POST" }),
    onSuccess: (_result, groupId) => {
      queryClient.setQueriesData<GroupResponse>({ queryKey: ["groups"] }, (current) => current ? {
        ...current,
        items: current.items.map((item) => item.id === groupId ? { ...item, unread: 0 } : item),
      } : current);
    },
  });

  useEffect(() => {
    if (!selectedId && groups.data?.items[0]) setSelectedId(groups.data.items[0].id);
    if (selectedId && groups.data && !groups.data.items.some((item) => item.id === selectedId)) setSelectedId(groups.data.items[0]?.id ?? null);
  }, [groups.data, selectedId]);

  useEffect(() => {
    if (!selected?.id || !isConnected) return;
    joinGroup(selected.id);
    if (selected.unread) markRead.mutate(selected.id);
    return () => leaveGroup(selected.id);
  }, [selected?.id, isConnected]);

  useSocketEvent<GroupSocketMessage>("group:message", useCallback((payload) => {
    queryClient.setQueryData<GroupHistoryResponse>(["group-history", payload.groupId], (current) => {
      if (!current || current.items.some((item) => item.id === payload.message.id)) return current;
      return { items: [...current.items, payload.message] };
    });
    queryClient.setQueriesData<GroupResponse>({ queryKey: ["groups"] }, (current) => current ? {
      ...current,
      items: current.items.map((item) => item.id === payload.groupId ? {
        ...item,
        lastMessageAt: payload.message.createdAt,
        unread: payload.groupId === selectedId ? 0 : (item.unread ?? 0) + (payload.message.direction === "IN" ? 1 : 0),
      } : item),
    } : current);
    if (payload.groupId === selectedId && payload.message.direction === "IN") markRead.mutate(payload.groupId);
  }, [selectedId]));

  useSocketEvent<GroupUpdated>("group:updated", useCallback((payload) => {
    queryClient.setQueriesData<GroupResponse>({ queryKey: ["groups"] }, (current) => current ? {
      ...current,
      items: current.items.map((item) => item.id === payload.groupId ? {
        ...item,
        lastMessageAt: payload.lastMessageAt ?? item.lastMessageAt,
        unread: payload.groupId === selectedId ? 0 : payload.unread ?? (item.unread ?? 0) + (payload.unreadIncrement ?? 0),
        activeConversation: payload.activeConversation ?? item.activeConversation,
      } : item),
    } : current);
  }, [selectedId]));

  useSocketEvent<{ groupId: string; agentId: string; agentName: string; isTyping: boolean }>("group:typing", useCallback((payload) => {
    if (payload.groupId !== selectedId || payload.agentId === user?.id) return;
    setTypingAgents((current) => {
      const next = { ...current };
      if (payload.isTyping) next[payload.agentId] = payload.agentName;
      else delete next[payload.agentId];
      return next;
    });
  }, [selectedId, user?.id]));

  const sendText = useMutation({
    mutationFn: (data: { groupId: string; message: string; clientMessageId: string }) => apiFetch(`/zapi/groups/${data.groupId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: data.message, clientMessageId: data.clientMessageId }),
    }),
    onSuccess: () => {
      setMessage("");
      setFeedback(null);
      if (selectedShortcutId) registerShortcutUse.mutate({ id: selectedShortcutId });
      setSelectedShortcutId(null);
      if (selected) stopGroupTyping(selected.id);
      void queryClient.invalidateQueries({ queryKey: ["group-history", selected?.id] });
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: Error) => setFeedback(error.message || "Não foi possível enviar a mensagem."),
  });

  const sendMedia = useMutation<GroupMessage, Error, { groupId: string; file: File; caption: string; clientMessageId: string; signal: AbortSignal }>({
    mutationFn: ({ groupId, file, caption, clientMessageId, signal }) => {
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("caption", caption);
      form.append("clientMessageId", clientMessageId);
      return apiFetch<GroupMessage>(`/zapi/groups/${groupId}/media`, {
        method: "POST",
        body: form,
        headers: { "Idempotency-Key": clientMessageId },
        onUploadProgress: setMediaUploadProgress,
        signal,
      });
    },
    onSuccess: (sent) => {
      if (selected) {
        queryClient.setQueryData<GroupHistoryResponse>(["group-history", selected.id], (current) => {
          if (!current || current.items.some((item) => item.id === sent.id)) return current;
          return { items: [...current.items, sent] };
        });
      }
      setMessage("");
      setMediaFile(null);
      setMediaEdit(null);
      setMediaUploadProgress(null);
      setMediaValidationError(null);
      uploadAbortRef.current = null;
      if (selectedShortcutId) registerShortcutUse.mutate({ id: selectedShortcutId });
      setSelectedShortcutId(null);
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      setMediaUploadProgress(null);
      setMediaValidationError(friendlyMediaError(error, mediaFile));
      uploadAbortRef.current = null;
    },
  });

  const send = async () => {
    if (!selected || sendText.isPending || sendMedia.isPending || mediaProcessing) return;
    setFeedback(null);
    setMediaValidationError(null);
    const clientMessageId = crypto.randomUUID();
    if (!mediaFile) {
      if (!message.trim()) return;
      sendText.mutate({ groupId: selected.id, message: message.trim(), clientMessageId });
      return;
    }
    const controller = new AbortController();
    uploadAbortRef.current = controller;
    let fileToSend = mediaFile;
    if (mediaEdit) {
      setMediaProcessing(true);
      setMediaProcessingProgress(0);
      try {
        fileToSend = await renderEditedVideo(mediaFile, mediaEdit, { signal: controller.signal, onProgress: setMediaProcessingProgress });
      } catch (error) {
        if (!controller.signal.aborted) setMediaValidationError(error instanceof Error ? error.message : "Não foi possível preparar o vídeo.");
        uploadAbortRef.current = null;
        return;
      } finally {
        setMediaProcessing(false);
        setMediaProcessingProgress(null);
      }
    }
    if (controller.signal.aborted) return;
    if (fileToSend.type.startsWith("video/") && fileToSend.size > MAX_VIDEO_BYTES) {
      setMediaValidationError(`Este vídeo é grande demais para enviar (${formatFileSize(fileToSend.size)}). O limite é 64 MB. Corte ou comprima o vídeo e tente novamente.`);
      uploadAbortRef.current = null;
      return;
    }
    setMediaUploadProgress(0);
    sendMedia.mutate({ groupId: selected.id, file: fileToSend, caption: message.trim(), clientMessageId, signal: controller.signal });
  };

  const cancelUpload = () => {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    setMediaUploadProgress(null);
    setMediaProcessing(false);
    setMediaProcessingProgress(null);
    setMediaValidationError("Envio cancelado.");
  };

  const typedNames = useMemo(() => Object.values(typingAgents), [typingAgents]);
  const renderedHistory = useMemo(() => {
    let previousDay = "";
    return (history.data?.items ?? []).map((item) => {
      const key = dayKey(item.createdAt);
      const showDay = key !== previousDay;
      previousDay = key;
      return { item, showDay };
    });
  }, [history.data?.items]);

  if (!can("groups", "view")) return <div className="content"><Empty className="border"><EmptyHeader><EmptyTitle>Acesso restrito</EmptyTitle><EmptyDescription>Você não possui permissão para visualizar os grupos.</EmptyDescription></EmptyHeader></Empty></div>;

  return (
    <div className={embedded ? "group-workspace-embedded flex min-h-0 flex-col" : "content flex min-h-0 flex-col"}>
      {!embedded ? <header className="page-heading shrink-0">
        <div><div className="eyebrow">MENSAGENS / GRUPOS</div><h1>Grupos do WhatsApp</h1><p className="subtle">Acompanhe o histórico e converse com os participantes em tempo real.</p></div>
        <Button variant="outline" onClick={() => void groups.refetch()} disabled={groups.isFetching}><RefreshCw data-icon="inline-start" className={groups.isFetching ? "animate-spin" : undefined} />Atualizar</Button>
      </header> : null}
      {groups.data?.stale && groups.data.warning ? <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">{groups.data.warning}</div> : null}

      <div className={`grid min-h-[620px] flex-1 overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[340px_minmax(0,1fr)] ${embedded ? "lg:h-[calc(100dvh-22rem)]" : "lg:h-[calc(100dvh-10rem)]"}`}>
        <section className={`${mobileThreadOpen ? "hidden" : "flex"} min-h-0 flex-col border-r lg:flex`} aria-label="Lista de grupos">
          <div className="border-b p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div><h2 className="flex items-center gap-2 font-semibold"><Users className="size-5 text-muted-foreground" />Grupos</h2><p className="mt-1 text-xs text-muted-foreground">{groups.data?.items.length ?? 0} grupos sincronizados</p></div>
              <Badge variant={isConnected ? "secondary" : "outline"} className={isConnected ? "gap-1 text-emerald-700 dark:text-emerald-300" : "gap-1"}>{isConnected ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}{isConnected ? "Ao vivo" : "Reconectando"}</Badge>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring/30"><Search className="size-4 text-muted-foreground" /><Input aria-label="Buscar grupos" value={search} onChange={(event) => setSearch(event.target.value)} className="border-0 shadow-none focus-visible:ring-0" placeholder="Buscar grupo" /></div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {groups.isLoading ? <div className="space-y-2 p-1">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div> : groups.isError ? (
              <Empty className="m-2 border"><EmptyHeader><EmptyTitle>Não foi possível carregar</EmptyTitle><EmptyDescription>{groups.error instanceof Error ? groups.error.message : "Verifique a conexão com a Z-API."}</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => void groups.refetch()}><RefreshCw data-icon="inline-start" />Tentar novamente</Button></EmptyContent></Empty>
            ) : groups.data?.items.length ? <div className="flex flex-col gap-1">{groups.data.items.map((group) => (
              <button key={group.id} type="button" onClick={() => { setSelectedId(group.id); setMobileThreadOpen(true); setFeedback(null); setMediaValidationError(null); setTypingAgents({}); }} className={`group flex min-h-16 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selected?.id === group.id ? "bg-muted" : "hover:bg-muted/60"}`}>
                <Avatar className="size-11"><AvatarFallback className="bg-secondary text-secondary-foreground">{initials(group.name)}</AvatarFallback></Avatar>
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{group.name}</strong><small className="shrink-0 text-[11px] text-muted-foreground">{group.lastMessageAt ? timeLabel(group.lastMessageAt) : ""}</small></span><span className="mt-0.5 flex items-center justify-between gap-2"><small className="truncate text-muted-foreground">{group.activeConversation ? "Atendimento ativo no grupo" : readableDate(group.lastMessageAt)}</small>{group.unread ? <Badge className="min-w-5 justify-center rounded-full px-1.5" variant="default">{group.unread}</Badge> : null}</span></span>
              </button>
            ))}</div> : <Empty className="m-2 border"><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>Nenhum grupo encontrado</EmptyTitle><EmptyDescription>Sincronize a lista na tela de conexão Z-API.</EmptyDescription></EmptyHeader></Empty>}
          </div>
        </section>

        <section className={`${mobileThreadOpen ? "flex" : "hidden"} min-h-0 flex-col bg-background lg:flex`} aria-label="Conversa do grupo">
          {selected ? <>
            <header className="flex min-h-20 items-center gap-3 border-b bg-card px-4 py-3">
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Voltar aos grupos" onClick={() => setMobileThreadOpen(false)}><ArrowLeft data-icon="icon" /></Button>
              <Avatar className="size-11"><AvatarFallback className="bg-secondary text-secondary-foreground">{initials(selected.name)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{selected.name}</h2><p className="truncate text-xs text-muted-foreground">{typedNames.length ? `${typedNames.join(", ")} digitando…` : "Mensagens registradas e auditáveis no próprio grupo"}</p></div>
              {selected.activeConversation ? <Button variant="outline" size="sm" onClick={() => setLocation(`/conversation/${selected.activeConversation!.id}`)}><TicketCheck data-icon="inline-start" />Ver chamado</Button> : <Badge variant="secondary">Sem chamado ativo</Badge>}
            </header>

            <ChatScroller ref={scrollerRef} followKey={history.data?.items.length ?? 0} resetKey={selected.id} className="bg-muted/20">
              <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end gap-1 px-4 py-5 sm:px-6">
                {history.isLoading ? <div className="space-y-3"><Skeleton className="h-16 w-2/3" /><Skeleton className="ml-auto h-20 w-3/5" /><Skeleton className="h-14 w-1/2" /></div> : history.isError ? (
                  <Empty className="my-auto border bg-card"><EmptyHeader><EmptyTitle>Não foi possível carregar o histórico</EmptyTitle><EmptyDescription>Atualize a conversa para tentar novamente.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => void history.refetch()}><RefreshCw data-icon="inline-start" />Atualizar histórico</Button></EmptyContent></Empty>
                ) : renderedHistory.length ? renderedHistory.map(({ item, showDay }) => <div key={item.id}>
                  {showDay ? <div className="my-4 flex justify-center"><Badge variant="secondary" className="font-normal">{dayLabel(item.createdAt)}</Badge></div> : null}
                  <Message align={item.direction === "OUT" ? "end" : "start"}><MessageContent className="max-w-[88%] sm:max-w-[72%]">
                    <Bubble align={item.direction === "OUT" ? "end" : "start"} variant={item.direction === "OUT" ? "default" : "secondary"}><BubbleContent className="min-w-32 space-y-2">
                      {item.direction === "IN" ? <strong className="block text-xs text-primary">{item.senderName}</strong> : null}
                      {item.media && item.conversationId && item.linkedMessageId ? <MessageMedia conversationId={item.conversationId} messageId={item.linkedMessageId} media={item.media} /> : item.outgoingMedia ? <OutgoingMediaCard media={item.outgoingMedia} /> : ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"].includes(item.messageType) ? <MediaPlaceholder type={item.messageType} content={item.content} /> : <p className="whitespace-pre-wrap break-words">{item.content}</p>}
                    </BubbleContent></Bubble>
                    <MessageFooter className={item.direction === "OUT" ? "justify-end" : undefined}><span>{item.direction === "OUT" ? item.senderName : timeLabel(item.createdAt)}</span>{item.direction === "OUT" ? <span className="inline-flex items-center gap-1">· {timeLabel(item.createdAt)} <CheckCheck className={`size-3.5 ${item.status === "FAILED" ? "text-destructive" : "text-muted-foreground"}`} /></span> : null}{item.status === "FAILED" ? <span className="text-destructive">Falha no envio</span> : null}</MessageFooter>
                  </MessageContent></Message>
                </div>) : <Empty className="my-auto border bg-card/90"><EmptyHeader><EmptyMedia variant="icon"><MessageCircle /></EmptyMedia><EmptyTitle>Nenhuma mensagem no grupo</EmptyTitle><EmptyDescription>Quando alguém enviar uma mensagem, ela aparecerá aqui em tempo real.</EmptyDescription></EmptyHeader></Empty>}
              </div>
            </ChatScroller>

            {can("groups", "send_message") ? <div className="border-t bg-card p-3 sm:p-4"><div className="mx-auto max-w-5xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <MediaAttachmentPicker file={mediaFile} onChange={(file, edit = null) => { setMediaFile(file); setMediaEdit(file ? edit : null); setMediaValidationError(null); }} caption={message} onCaptionChange={setMessage} uploadProgress={sendMedia.isPending ? mediaUploadProgress : null} processing={mediaProcessing} processingProgress={mediaProcessingProgress} onCancelUpload={cancelUpload} onValidationError={setMediaValidationError} disabled={sendText.isPending || sendMedia.isPending || mediaProcessing} />
                {can("shortcuts", "use") ? <ShortcutPicker agentName={user?.name || "Atendente"} contactName={selected.name} departmentName={(user as any)?.departmentName || "Atendimento"} onSelect={(shortcut) => { setMessage(shortcut.message); setSelectedShortcutId(shortcut.id); }} /> : null}
                <span className="text-xs text-muted-foreground">Enter envia · Shift + Enter quebra a linha</span>
              </div>
              <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/30">
                <Textarea value={message} onChange={(event) => { setMessage(event.target.value); setFeedback(null); startGroupTyping(selected.id); }} onBlur={() => stopGroupTyping(selected.id)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={mediaFile ? "Adicione uma legenda (opcional)…" : "Escreva uma mensagem para o grupo…"} maxLength={4096} className="min-h-12 max-h-36 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
                <Button size="icon" className="shrink-0 rounded-full" aria-label="Enviar no grupo" title="Enviar no grupo" onClick={() => void send()} disabled={(!message.trim() && !mediaFile) || sendText.isPending || sendMedia.isPending || mediaProcessing}>{sendText.isPending || sendMedia.isPending || mediaProcessing ? <RefreshCw className="animate-spin" /> : <Send data-icon="icon" />}</Button>
              </div>
              <div className="mt-1.5 flex min-h-5 items-center justify-between gap-3 text-xs"><span className={mediaValidationError || feedback ? "text-destructive" : "text-muted-foreground"}>{mediaValidationError || feedback || (mediaFile ? "O arquivo será enviado à Z-API e não ficará armazenado localmente." : "")}</span><span className="shrink-0 text-muted-foreground">{message.length}/4096</span></div>
            </div></div> : <p className="border-t bg-card p-4 text-center text-sm text-muted-foreground">Seu perfil pode visualizar grupos, mas não possui permissão para enviar mensagens.</p>}
          </> : <Empty className="m-auto border"><EmptyHeader><EmptyMedia variant="icon"><MessageCircle /></EmptyMedia><EmptyTitle>Selecione um grupo</EmptyTitle><EmptyDescription>Escolha uma conversa à esquerda para abrir o histórico.</EmptyDescription></EmptyHeader></Empty>}
        </section>
      </div>
    </div>
  );
}
