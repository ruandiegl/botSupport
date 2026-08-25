import { Link } from "wouter";
import { Clock3 } from "lucide-react";
import type { Conversation } from "@/types";
import { getInitials } from "@/app/Shell";
import { ConversationLabelBadge } from "@/components/ui/ConversationLabelBadge";

const statusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  OPEN: "Em aberto",
  IN_PROGRESS: "Em atendimento",
  CLOSED: "Encerrada",
};

const searchSourceLabel: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  phone: "Telefone",
  group: "Grupo",
  message: "Mensagem",
};

function HighlightedText({ text, query }: { text: string; query?: string }) {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery) return <>{text}</>;
  const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const normalized = normalizedQuery.toLocaleLowerCase();
  return <>{parts.map((part, index) => part.toLocaleLowerCase() === normalized
    ? <mark className="search-highlight" key={`${part}-${index}`}>{part}</mark>
    : <span key={`${part}-${index}`}>{part}</span>)}</>;
}

const timeLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

const ageLabel = (conversation: Conversation) => {
  const timestamp = conversation.status === "OPEN"
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
  searchQuery,
}: {
  conversation: Conversation;
  selected?: boolean;
  searchQuery?: string;
}) {
  const isGroup = conversation.channel === "GROUP" || Boolean(conversation.groupChatName);
  const displayName = isGroup ? (conversation.groupChatName || "Grupo do WhatsApp") : conversation.contact.name;
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
          <span className="conversation-name">{displayName}</span>
          {isGroup ? <span className="conversation-channel">Grupo</span> : null}
          <span className="conversation-phone">{isGroup ? `Solicitado por ${conversation.contact.name}` : conversation.contact.phone}</span>
        </div>
        <div className={`last-message ${conversation.searchMatch ? "search-match" : ""}`}>
          {conversation.searchMatch ? <><span className="search-match-source">{searchSourceLabel[conversation.searchMatch.source] || "Busca"}:</span> <HighlightedText text={conversation.searchMatch.snippet} query={conversation.searchMatch.source === "message" ? searchQuery : undefined} /></> : (conversation.lastMessage || "Sem mensagens recentes")}
        </div>
        {conversation.searchMatch?.source === "message" && conversation.searchMatch.senderDisplayName ? <div className="search-match-sender">Mensagem de {conversation.searchMatch.senderDisplayName}</div> : null}
        <div style={{ marginTop: 7, display: "flex", gap: 7, alignItems: "center" }}>
          <Status status={conversation.status} />
          <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 10 }}>
            {conversation.departmentName || "Sem departamento"}
          </span>
          {conversation.status !== "CLOSED" ? <span className="conversation-age"><Clock3 /> {conversation.status === "OPEN" ? "aguardando" : "atividade"} {ageLabel(conversation)}</span> : null}
        </div>
        {conversation.labels?.length ? <div className="mt-2 flex flex-wrap gap-1">{conversation.labels.slice(0, 3).map((label) => <ConversationLabelBadge key={label.id} label={label} />)}</div> : null}
      </div>
      <div className="row-side">
        <span className="time">{timeLabel(conversation.searchMatch?.source === "message" ? conversation.searchMatch.createdAt : conversation.startedAt)}</span>
        {conversation.unreadCount > 0 && <span className="count">{conversation.unreadCount}</span>}
      </div>
    </Link>
  );
}
