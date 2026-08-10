import { Link } from "wouter";
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
          <span style={{ color: "#89939a", fontSize: 10 }}>
            {conversation.departmentName || "Sem departamento"}
          </span>
        </div>
      </div>
      <div className="row-side">
        <span className="time">{timeLabel(conversation.startedAt)}</span>
        {conversation.unreadCount > 0 && <span className="count">{conversation.unreadCount}</span>}
      </div>
    </Link>
  );
}
