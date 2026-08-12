import { Clock3, Sparkles, TrendingUp } from "lucide-react";
import type { Conversation, Shortcut } from "@/types";
import { getInitials } from "@/app/Shell";
import { Status } from "@/pages/queue/components/ConversationRow";
import { useAvailableShortcuts } from "../hooks/use-shortcuts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatShortcutMessage } from "@/lib/utils";

export function DetailPanel({
  conversation,
  canUseShortcuts,
  onInsertShortcut,
}: {
  conversation: Conversation;
  canUseShortcuts: boolean;
  onInsertShortcut: (shortcut: Shortcut) => void;
}) {
  const { data: shortcuts = [], isLoading } = useAvailableShortcuts(
    conversation.id,
    "",
    "ALL",
    canUseShortcuts
  );
  const mostUsed = [...shortcuts]
    .filter((shortcut) => shortcut.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 3);
  const mostUsedIds = new Set(mostUsed.map((shortcut) => shortcut.id));
  const recent = [...shortcuts]
    .filter((shortcut) => shortcut.lastUsedAt && !mostUsedIds.has(shortcut.id))
    .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
    .slice(0, 3);
  const available = shortcuts.slice(0, 4);

  const agentName = conversation.assignedAgentName || "Atendente";
  const contactName = conversation.contact.name || "Cliente";
  const departmentName = conversation.departmentName || "Suporte";

  const renderShortcut = (shortcut: Shortcut) => {
    const formattedMessage = formatShortcutMessage(shortcut.message, { agentName, contactName, departmentName });
    return (
      <Button
        key={shortcut.id}
        variant="ghost"
        size="sm"
        className="detail-shortcut-button"
        onClick={() => onInsertShortcut({ ...shortcut, message: formattedMessage })}
        title={formattedMessage}
      >
        <Sparkles data-icon="inline-start" />
        <span className="detail-shortcut-copy">
          <strong>{shortcut.title}</strong>
          <small>{formattedMessage}</small>
        </span>
        {shortcut.usageCount > 0 && <Badge variant="secondary">{shortcut.usageCount}</Badge>}
      </Button>
    );
  };

  return (
    <aside className="detail-panel">
      <div className="detail-section">
        <div className="detail-label">Contexto do atendimento</div>
        <Status status={conversation.status} />
        <div className="detail-value">
          <strong>{conversation.departmentName || "Sem departamento atribuído"}</strong>
          <span className="subtle">departamento responsável</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">Responsável</div>
        <div className="agent-cell">
          <div className="avatar coral">
            {getInitials(conversation.assignedAgentName || "Pendente")}
          </div>
          <div>
            <strong style={{ fontSize: 12 }}>
              {conversation.assignedAgentName || "Ainda não assumido"}
            </strong>
            <div className="subtle">
              {conversation.assignedAgentId
                ? "Atendimento em andamento"
                : "Aguardando atendimento"}
            </div>
          </div>
        </div>
      </div>

      {canUseShortcuts && (
        <div className="detail-shortcuts">
          <div className="detail-shortcuts-heading">
            <div>
              <div className="detail-label">Atalhos rápidos</div>
              <p>Insira uma mensagem no chat com um clique.</p>
            </div>
            <Sparkles />
          </div>

          {isLoading ? (
            <p className="detail-shortcut-empty">Carregando atalhos...</p>
          ) : shortcuts.length === 0 ? (
            <p className="detail-shortcut-empty">Nenhum atalho disponível para esta conversa.</p>
          ) : mostUsed.length === 0 && recent.length === 0 ? (
            <div className="detail-shortcut-group">
              <div className="detail-shortcut-group-title"><Sparkles /> Disponíveis</div>
              {available.map(renderShortcut)}
            </div>
          ) : (
            <>
              {mostUsed.length > 0 && (
                <div className="detail-shortcut-group">
                  <div className="detail-shortcut-group-title"><TrendingUp /> Mais usados</div>
                  {mostUsed.map(renderShortcut)}
                </div>
              )}
              {recent.length > 0 && (
                <>
                  <Separator />
                  <div className="detail-shortcut-group">
                    <div className="detail-shortcut-group-title"><Clock3 /> Usados recentemente</div>
                    {recent.map(renderShortcut)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}
