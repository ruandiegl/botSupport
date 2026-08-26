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
  onOpen,
}: {
  conversation: Conversation;
  selected?: boolean;
  searchQuery?: string;
  onOpen?: () => void;
}) {
  const isGroup = conversation.channel === "GROUP" || Boolean(conversation.groupChatName);
  const displayName = isGroup ? (conversation.groupChatName || "Grupo do WhatsApp") : conversation.contact.name;
  return (
    <Link
      href={`/conversation/${conversation.id}`}
      onClick={onOpen}
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
        <div className="conversation-status-row">
          <Status status={conversation.status} />
          <span className="conversation-department">
            {conversation.departmentName || "Sem departamento"}
          </span>
          {conversation.status !== "CLOSED" ? <span className="conversation-age"><Clock3 /> {conversation.status === "OPEN" ? "aguardando" : "atividade"} {ageLabel(conversation)}</span> : null}
          {conversation.labels?.length ? (
            <span className="conversation-labels-inline" title={conversation.labels.map((label) => label.name).join(", ")}>
              <ConversationLabelBadge label={conversation.labels[0]} />
              {conversation.labels.length > 1 ? <span className="conversation-label-more">+{conversation.labels.length - 1}</span> : null}
            </span>
          ) : null}
        </div>
      </div>
      <div className="row-side">
        <span className="time">{timeLabel(conversation.searchMatch?.source === "message" ? conversation.searchMatch.createdAt : conversation.startedAt)}</span>
        {conversation.unreadCount > 0 && <span className="count">{conversation.unreadCount}</span>}
      </div>
    </Link>
  );
}
