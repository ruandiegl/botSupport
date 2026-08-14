import { Link } from "wouter";
import { Clock3 } from "lucide-react";
import type { Conversation } from "@/types";
import { getInitials } from "@/app/Shell";

const statusLabel: Record<string, string> = {
  BOT: "Bot",
  QUEUED: "Na fila",
  IN_PROGRESS: "Em atendimento",
  CLOSED: "Encerrada",
};

const timeLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

const ageLabel = (conversation: Conversation) => {
  const timestamp = conversation.status === "QUEUED"
    ? conversation.queuedAt || conversation.startedAt
    : conversation.lastActivityAt || conversation.startedAt;
  if (!timestamp) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h${minutes % 60 ? ` ${minutes % 60}min` : ""}`;
};

export function Status({ status }: { status: string }) {
  return (
    <span className={`status status-${status}`} data-testid={`status-${status}`}>
      {statusLabel[status] || status}
    </span>
  );
}

export function ConversationRow({
  conversation,
  selected,
}: {
  conversation: Conversation;
  selected?: boolean;
}) {
  return (
    <Link
      href={`/conversation/${conversation.id}`}
      className={`conversation-row ${selected ? "selected" : ""}`}
      data-testid={`row-conversation-${conversation.id}`}
    >
      <div className="avatar">
        {conversation.contact.initials || getInitials(conversation.contact.name)}
      </div>
      <div className="conversation-main">
        <div className="conversation-meta">
          <span className="conversation-name">{conversation.contact.name}</span>
          <span className="conversation-phone">{conversation.contact.phone}</span>
        </div>
        <div className="last-message">{conversation.lastMessage || "Sem mensagens recentes"}</div>
        <div style={{ marginTop: 7, display: "flex", gap: 7, alignItems: "center" }}>
          <Status status={conversation.status} />
          <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 10 }}>
            {conversation.departmentName || "Sem departamento"}
          </span>
          {conversation.status !== "CLOSED" ? <span className="conversation-age"><Clock3 /> {conversation.status === "QUEUED" ? "aguardando" : "atividade"} {ageLabel(conversation)}</span> : null}
        </div>
      </div>
      <div className="row-side">
        <span className="time">{timeLabel(conversation.startedAt)}</span>
        {conversation.unreadCount > 0 && <span className="count">{conversation.unreadCount}</span>}
      </div>
    </Link>
  );
}
