import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Check, Archive, Send, RefreshCw } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import {
  useGetConversation,
  useMarkConversationRead,
  useSendMessage,
  useAssumeConversation,
  useCloseConversation,
} from "./hooks/use-conversation";
import { DetailPanel } from "./components/DetailPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShortcutPicker } from "./components/ShortcutPicker";
import { useAvailableShortcuts, useRegisterShortcutUse } from "./hooks/use-shortcuts";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatShortcutMessage } from "@/lib/utils";
import { useSocket } from "@/lib/socket-context";
import { useSocketEvent } from "@/lib/use-socket-events";
import { queryClient } from "@/lib/query-client";

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
  const lastReadAttemptRef = useRef<string | null>(null);
  const { activeAgent } = useActiveAgent();
  const { can, user } = useAuth();
  const { joinConversation, leaveConversation } = useSocket();

  const activeAgentId = activeAgent?.id || user?.id || "agent-marina";
  const activeAgentName = activeAgent?.name || user?.name || "Atendente";

  const { data: conversation, isLoading, isError, refetch } = useGetConversation(id);
  const { data: availableShortcuts = [] } = useAvailableShortcuts(id, "", "ALL", can("shortcuts", "use"));
  const markAsRead = useMarkConversationRead(id);
  const sendMessage = useSendMessage(id);
  const assume = useAssumeConversation(id);
  const close = useCloseConversation(id);
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
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    }
  }, [id]));

  useSocketEvent("conversation:updated", useCallback((data: any) => {
    if (data.conversationId === id) {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    }
  }, [id]));

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
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
          <div className="skeleton short" />
          <div className="skeleton" />
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
            departmentName: conversation.departmentName || "Suporte",
          });
          setMessage(formatted);
          setSelectedShortcutId(greetingShortcut.id);
        }
      },
    });
  };

  const handleClose = () => {
    setCloseConfirmOpen(false);
    close.mutate(undefined, {
      onSuccess: () => {
        const closingShortcut = availableShortcuts.find(
          (s) => s.type === "CLOSING" && s.scope === "GLOBAL"
        );
        if (closingShortcut) {
          const formatted = formatShortcutMessage(closingShortcut.message, {
            agentName: activeAgentName,
            contactName: conversation.contact.name,
            departmentName: conversation.departmentName || "Suporte",
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
            {conversation.status === "QUEUED" && (
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
          <div className="day-divider">Hoje</div>
          {conversation.messages?.map((item) => (
            <div className={`message-wrap ${item.direction === "OUT" ? "out" : "in"}`} key={item.id}>
              <div className="bubble">
                {item.content}
              </div>
              <div className="bubble-meta">
                {item.direction === "OUT"
                  ? timeLabel(item.createdAt)
                  : `${item.senderName || (item.senderType === "BOT" ? "GTF-Bot" : conversation.contact.name)} · ${timeLabel(item.createdAt)}`}
              </div>
            </div>
          ))}
        </div>

        <div className="composer">
          {can("shortcuts", "use") && (
            <div className="composer-toolbar">
              <ShortcutPicker 
                conversationId={id} 
                agentName={activeAgentName}
                contactName={conversation.contact.name}
                departmentName={conversation.departmentName || "Suporte"}
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
      <ConfirmationDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        tone="danger"
        title="Encerrar este chamado?"
        description="A mensagem de encerramento será enviada ao cliente e o atendimento será marcado como encerrado."
        confirmLabel="Encerrar chamado"
        details={<strong>{conversation.contact.name}</strong>}
        onConfirm={handleClose}
        testId="button-confirm-close-conversation"
      />
    </div>
  );
}
