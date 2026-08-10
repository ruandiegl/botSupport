import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Check, Archive, Send, RefreshCw } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import {
  useGetConversation,
  useSendMessage,
  useAssumeConversation,
  useCloseConversation,
} from "./hooks/use-conversation";
import { DetailPanel } from "./components/DetailPanel";

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
  const { activeAgent } = useActiveAgent();

  const activeAgentId = activeAgent?.id || "agent-marina";
  const activeAgentName = activeAgent?.name || "Atendente";

  const { data: conversation, isLoading, isError, refetch } = useGetConversation(id);
  const sendMessage = useSendMessage(id);
  const assume = useAssumeConversation(id);
  const close = useCloseConversation(id);

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
          <button className="btn btn-muted" onClick={() => refetch()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );

  const send = () => {
    if (!message.trim()) return;
    sendMessage.mutate(
      { content: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
        },
      }
    );
  };

  const handleAssume = () => {
    assume.mutate({ agentId: activeAgentId });
  };

  const handleClose = () => {
    close.mutate();
  };

  return (
    <div className="conversation-page">
      <section className="thread">
        <div className="thread-head">
          <div className="contact-block">
            <button
              className="icon-btn"
              onClick={() => setLocation("/")}
              data-testid="button-back-conversations"
            >
              <ArrowLeft size={16} />
            </button>
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
              <button
                className="btn btn-accent"
                disabled={assume.isPending}
                onClick={handleAssume}
                data-testid="button-assume-conversation"
              >
                <Check size={14} /> Assumir
              </button>
            )}
            {conversation.status !== "CLOSED" && (
              <button
                className="btn btn-muted"
                disabled={close.isPending}
                onClick={handleClose}
                data-testid="button-close-conversation"
              >
                <Archive size={14} /> Encerrar
              </button>
            )}
          </div>
        </div>

        <div className="messages">
          <div className="day-divider">Hoje</div>
          {conversation.messages?.map((item) => (
            <div className={`message-wrap ${item.direction === "OUT" ? "out" : "in"}`} key={item.id}>
              <div className="bubble">{item.content}</div>
              <div className="bubble-meta">
                {item.senderName ||
                  (item.senderType === "BOT" ? "GTF-Bot" : conversation.contact.name)}{" "}
                · {timeLabel(item.createdAt)}
              </div>
            </div>
          ))}
        </div>

        <div className="composer">
          <textarea
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
            <span className="signature">
              Assinatura: <b>— {activeAgentName}</b>
            </span>
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={!message.trim() || sendMessage.isPending}
              data-testid="button-send-message"
            >
              <Send size={14} /> Enviar
            </button>
          </div>
        </div>
      </section>

      <DetailPanel
        conversation={conversation}
        onInsertPreset={(text) => setMessage(text)}
      />
    </div>
  );
}
