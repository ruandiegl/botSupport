import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Check, Archive, Send, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import {
  useGetConversation,
  useMarkConversationRead,
  useSendMessage,
  useAssumeConversation,
  useCloseConversation,
  useLoadPreviousMessages,
} from "./hooks/use-conversation";
import { DetailPanel } from "./components/DetailPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShortcutPicker } from "./components/ShortcutPicker";
import { useAvailableShortcuts, useRegisterShortcutUse } from "./hooks/use-shortcuts";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatShortcutMessage } from "@/lib/utils";
import { useSocket } from "@/lib/socket-context";
import { useSocketEvent } from "@/lib/use-socket-events";
import { queryClient } from "@/lib/query-client";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageMedia } from "./components/MessageMedia";

const timeLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

const dateLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
    : "";

export default function ConversationPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);
  const [assumeConfirmOpen, setAssumeConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const previousMessagesHeightRef = useRef<number | null>(null);
  const lastReadAttemptRef = useRef<string | null>(null);
  const { activeAgent } = useActiveAgent();
  const { can, user } = useAuth();
  const { joinConversation, leaveConversation } = useSocket();

  const activeAgentId = activeAgent?.id || user?.id || "agent-marina";
  const activeAgentName = activeAgent?.name || user?.name || "Atendente";

  const { data: conversation, isLoading, isError, refetch } = useGetConversation(id);
  const activeAgentDeptName = activeAgent?.departmentName || (user as any)?.departmentName || conversation?.departmentName || "Suporte";
  const { data: availableShortcuts = [] } = useAvailableShortcuts(id, "", "ALL", can("shortcuts", "use"));
  const markAsRead = useMarkConversationRead(id);
  const sendMessage = useSendMessage(id);
  const assume = useAssumeConversation(id);
  const close = useCloseConversation(id);
  const loadPrevious = useLoadPreviousMessages(id);
  const registerShortcutUse = useRegisterShortcutUse();

  // Socket.IO: Entrar na sala da conversa para receber mensagens e atualizações em tempo real
  useEffect(() => {
    if (id) {
      joinConversation(id);
      return () => {
        leaveConversation(id);
      };
    }
  }, [id, joinConversation, leaveConversation]);

  // Escutar novas mensagens em tempo real no chat
  useSocketEvent("message:new", useCallback((data: any) => {
    if (data.conversationId === id) {
      const incoming = data.message;
      if (!incoming?.id) return;
      queryClient.setQueryData<any>(["conversation", id], (current: any) => {
        if (!current || current.messages?.some((item: any) => item.id === incoming.id)) return current;
        return {
          ...current,
          messages: [...(current.messages ?? []), incoming],
          lastMessage: incoming.content,
          lastActivityAt: incoming.createdAt,
          unreadCount: incoming.direction === "IN" ? (current.unreadCount ?? 0) + 1 : current.unreadCount,
        };
      });
    }
  }, [id]));

  useSocketEvent("conversation:updated", useCallback((data: any) => {
    if (data.conversationId === id) {
      // MESSAGE_RECEIVED/MESSAGE_SENT already arrive through message:new.
      // Avoid a second full detail refetch for the same logical event.
      if (!data.messageId && data.eventType !== "MESSAGE_RECEIVED" && data.eventType !== "MESSAGE_SENT") {
        queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      }
    }
  }, [id]));

  useSocketEvent("conversation:labels_updated", useCallback((data: any) => {
    if (data.conversationId === id) {
      queryClient.setQueryData<any>(["conversation", id], (current: any) => current ? { ...current, labels: data.labels || [] } : current);
    }
  }, [id]));

  useSocketEvent("media:expired", useCallback((data: any) => {
    if (data.conversationId === id) {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      queryClient.removeQueries({ queryKey: ["media-access", id] });
    }
  }, [id]));

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    if (previousMessagesHeightRef.current !== null) {
      const heightDelta = container.scrollHeight - previousMessagesHeightRef.current;
      container.scrollTop += heightDelta;
      previousMessagesHeightRef.current = null;
      return;
    }
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages?.length]);

  useEffect(() => {
    const unreadCount = conversation?.unreadCount ?? 0;
    if (!unreadCount) {
      lastReadAttemptRef.current = null;
      return;
    }

    const attemptKey = `${id}:${unreadCount}`;
    if (!id || lastReadAttemptRef.current === attemptKey) return;
    lastReadAttemptRef.current = attemptKey;
    markAsRead.mutate();
  }, [id, conversation?.unreadCount]);

  if (isLoading)
    return (
      <div className="content">
        <div className="panel loading">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );

  if (isError || !conversation)
    return (
      <div className="content">
        <div className="panel error-state">
          <RefreshCw size={24} />
          <h3>Não foi possível carregar a conversa</h3>
          <p className="subtle">Verifique se o backend está ativo e o banco de dados conectado.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );

  const send = () => {
    if (!message.trim()) return;
    const body = message.trim();
    sendMessage.mutate({ content: body }, {
      onSuccess: () => {
        setMessage("");
        if (selectedShortcutId) {
          registerShortcutUse.mutate({ id: selectedShortcutId, conversationId: id });
          setSelectedShortcutId(null);
        }
      },
    });
  };

  const handleAssume = () => {
    setAssumeConfirmOpen(false);
    assume.mutate({ agentId: activeAgentId }, {
      onSuccess: () => {
        const greetingShortcut = availableShortcuts.find(
          (s) => s.type === "GREETING" && s.scope === "GLOBAL"
        );
        if (greetingShortcut) {
          const formatted = formatShortcutMessage(greetingShortcut.message, {
            agentName: activeAgentName,
            contactName: conversation.contact.name,
            departmentName: activeAgentDeptName,
          });
          setMessage(formatted);
          setSelectedShortcutId(greetingShortcut.id);
        }
      },
    });
  };

  const handleClose = (reason: "NORMAL" | "INACTIVITY" = "NORMAL") => {
    setCloseConfirmOpen(false);
    close.mutate(undefined, {
      onSuccess: () => {
        let closingShortcut: any = null;
        if (reason === "INACTIVITY") {
          closingShortcut = availableShortcuts.find(
            (s) =>
              s.type === "CLOSING" &&
              (s.title.toLowerCase().includes("interação") ||
                s.title.toLowerCase().includes("inativid"))
          );
          if (!closingShortcut) {
            const formatted = formatShortcutMessage(
              "Olá, {contactName}! Seu atendimento está sendo encerrado por falta de interação/resposta. Caso ainda precise de ajuda, envie uma nova mensagem para iniciar um novo atendimento. Obrigado!",
              {
                agentName: activeAgentName,
                contactName: conversation.contact.name,
                departmentName: activeAgentDeptName,
              }
            );
            setMessage(formatted);
            return;
          }
        } else {
          closingShortcut = availableShortcuts.find(
            (s) =>
              s.type === "CLOSING" &&
              !s.title.toLowerCase().includes("interação") &&
              !s.title.toLowerCase().includes("inativid")
          );
        }

        if (closingShortcut) {
          const formatted = formatShortcutMessage(closingShortcut.message, {
            agentName: activeAgentName,
            contactName: conversation.contact.name,
            departmentName: activeAgentDeptName,
          });
          setMessage(formatted);
          setSelectedShortcutId(closingShortcut.id);
        }
      },
    });
  };

  return (
    <div className="content conversation-page">
      <section className="panel thread">
        <div className="thread-head">
          <div className="contact-block">
            <Button
              variant="ghost"
              size="icon"
              className="icon-btn"
              onClick={() => setLocation("/")}
              data-testid="button-back-conversations"
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="avatar coral">{conversation.contact.initials}</div>
            <div>
              <h1>{conversation.contact.name}</h1>
              <p>
                {conversation.contact.phone} · iniciou {dateLabel(conversation.startedAt)}
              </p>
            </div>
          </div>

          <div className="thread-actions">
            {conversation.status === "OPEN" && (
              <Button
                variant="default"
                size="sm"
                disabled={assume.isPending}
                onClick={() => setAssumeConfirmOpen(true)}
                data-testid="button-assume-conversation"
              >
                <Check size={14} /> Assumir
              </Button>
            )}
            {conversation.status !== "CLOSED" && (
              <Button
                variant="outline"
                size="sm"
                disabled={close.isPending}
                onClick={() => setCloseConfirmOpen(true)}
                data-testid="button-close-conversation"
              >
                <Archive size={14} /> Encerrar
              </Button>
            )}
          </div>
        </div>

        <div className="messages" ref={messagesRef}>
          {conversation.messagesPagination?.hasPrevious && conversation.messagesPagination.previousCursor ? (
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loadPrevious.isPending}
                onClick={() => {
                  if (messagesRef.current) previousMessagesHeightRef.current = messagesRef.current.scrollHeight;
                  loadPrevious.mutate(
                    { before: conversation.messagesPagination!.previousCursor! },
                    { onError: () => { previousMessagesHeightRef.current = null; } },
                  );
                }}
              >
                {loadPrevious.isPending ? "Carregando..." : "Carregar mensagens anteriores"}
              </Button>
            </div>
          ) : null}
          <div className="day-divider">Hoje</div>
          {conversation.messages?.map((item) => (
            <Message align={item.direction === "OUT" ? "end" : "start"} key={item.id}>
              <MessageContent>
                <Bubble
                  align={item.direction === "OUT" ? "end" : "start"}
                  variant={item.direction === "OUT" ? "default" : "secondary"}
                >
                  <BubbleContent className="space-y-2">
                    {item.content && <p className="whitespace-pre-wrap">{item.content}</p>}
                    {item.media && (
                      <MessageMedia conversationId={id} messageId={item.id} media={item.media} />
                    )}
                  </BubbleContent>
                </Bubble>
                <MessageFooter>
                  {item.direction === "OUT"
                    ? timeLabel(item.createdAt)
                    : `${item.senderName || (item.senderType === "BOT" ? "GTF-Bot" : conversation.contact.name)} · ${timeLabel(item.createdAt)}`}
                </MessageFooter>
              </MessageContent>
            </Message>
          ))}
        </div>

        <div className="composer">
          {can("shortcuts", "use") && (
            <div className="composer-toolbar">
              <ShortcutPicker 
                conversationId={id} 
                agentName={activeAgentName}
                contactName={conversation.contact.name}
                departmentName={activeAgentDeptName}
                onSelect={(shortcut) => { setMessage(shortcut.message); setSelectedShortcutId(shortcut.id); }} 
              />
              <span>Selecione uma mensagem pronta e ajuste antes de enviar.</span>
            </div>
          )}
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Escreva uma resposta para o contato..."
            data-testid="textarea-message"
          />
          <div className="composer-foot">
            <div />
            <Button
              variant="default"
              size="lg"
              onClick={send}
              disabled={!message.trim() || sendMessage.isPending}
              data-testid="button-send-message"
            >
              <Send size={14} /> Enviar
            </Button>
          </div>
        </div>
      </section>

      <DetailPanel
        conversation={conversation}
        canUseShortcuts={can("shortcuts", "use")}
        canManageLabels={can("labels", "update")}
        agentDeptName={activeAgentDeptName}
        onInsertShortcut={(shortcut) => {
          setMessage(shortcut.message);
          setSelectedShortcutId(shortcut.id);
        }}
      />
      <ConfirmationDialog
        open={assumeConfirmOpen}
        onOpenChange={setAssumeConfirmOpen}
        tone="warning"
        title="Assumir este atendimento?"
        description="Você passará a ser responsável pela conversa e a mensagem de saudação inicial será inserida no campo."
        confirmLabel="Assumir atendimento"
        details={<strong>{conversation.contact.name}</strong>}
        onConfirm={handleAssume}
        testId="button-confirm-assume-conversation"
      />
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-card text-card-foreground ring-border sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Archive className="size-4 text-warning" />
              Encerrar Atendimento
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Selecione o motivo do encerramento para o contato:
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
            <strong className="font-semibold">{conversation.contact.name}</strong>
            <span className="text-xs text-muted-foreground ml-2">({conversation.contact.phone})</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 my-1">
            <button
              type="button"
              disabled={close.isPending}
              onClick={() => handleClose("NORMAL")}
              className="flex items-start gap-3 p-3.5 text-left rounded-lg border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all group cursor-pointer"
              data-testid="button-close-normal"
            >
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <strong className="text-sm font-medium text-foreground group-hover:text-primary">
                    Encerramento Normal
                  </strong>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Padrão
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conclusão bem-sucedida do suporte com mensagem de agradecimento ao cliente.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={close.isPending}
              onClick={() => handleClose("INACTIVITY")}
              className="flex items-start gap-3 p-3.5 text-left rounded-lg border border-border bg-background hover:bg-muted hover:border-warning/50 transition-all group cursor-pointer"
              data-testid="button-close-inactivity"
            >
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <strong className="text-sm font-medium text-foreground group-hover:text-warning">
                    Encerramento por Falta de Interação
                  </strong>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Inatividade
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Encerra o chamado informando ao cliente que não houve resposta ou interação recente.
                </p>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
