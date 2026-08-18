import { Clock3, Sparkles, Tags, TrendingUp } from "lucide-react";
import type { Conversation, Shortcut } from "@/types";
import { getInitials } from "@/app/Shell";
import { Status } from "@/pages/queue/components/ConversationRow";
import { useAvailableShortcuts } from "../hooks/use-shortcuts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatShortcutMessage } from "@/lib/utils";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ConversationLabelBadge } from "@/components/ui/ConversationLabelBadge";
import { useAssignConversationLabel, useLabels, useRemoveConversationLabel } from "@/hooks/use-labels";

export function DetailPanel({
  conversation,
  canUseShortcuts,
  onInsertShortcut,
  agentDeptName,
  agentName: currentAgentName,
  canManageLabels,
}: {
  conversation: Conversation;
  canUseShortcuts: boolean;
  onInsertShortcut: (shortcut: Shortcut) => void;
  agentDeptName?: string;
  agentName?: string;
  canManageLabels: boolean;
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
  const { data: labelCatalog } = useLabels(canManageLabels);
  const assignLabel = useAssignConversationLabel(conversation.id);
  const removeLabel = useRemoveConversationLabel(conversation.id);
  const activeLabelIds = new Set((conversation.labels || []).map((label) => label.id));

  const agentName = currentAgentName || conversation.assignedAgentName || "Atendente";
  const contactName = conversation.contact.name || "Cliente";
  const departmentName = agentDeptName || conversation.departmentName || "Suporte";

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

      {conversation.assignments?.length ? (
        <div className="detail-section">
          <div className="detail-label">Histórico de responsáveis</div>
          <div className="flex flex-col gap-2">
            {conversation.assignments.slice(0, 4).map((assignment) => (
              <div key={assignment.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                <strong>{assignment.toAgent?.name || "Atendente"}</strong>
                <span className="subtle"> · {assignment.action === "DELEGATE" ? "delegado" : "assumido"}</span>
                <div className="subtle">por {assignment.actorAgent?.name || "Sistema"} · {new Date(assignment.createdAt).toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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

      <div className="detail-section">
        <div className="flex items-center justify-between gap-2">
          <div className="detail-label">Etiquetas</div>
          {canManageLabels ? (
            <Popover>
              <PopoverTrigger render={<Button variant="outline" size="sm" />}><Tags /> Gerenciar</PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-72 bg-popover">
                <PopoverTitle>Etiquetas do chamado</PopoverTitle>
                <PopoverDescription>Selecione as etiquetas que ajudam a organizar esta conversa.</PopoverDescription>
                <div className="mt-3 grid max-h-64 gap-1 overflow-y-auto">
                  {labelCatalog?.items.map((label) => (
                    <label key={label.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
                      <Checkbox
                        checked={activeLabelIds.has(label.id)}
                        disabled={assignLabel.isPending || removeLabel.isPending}
                        onCheckedChange={(checked) => checked ? assignLabel.mutate(label.id) : removeLabel.mutate(label.id)}
                      />
                      <ConversationLabelBadge label={label} />
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {conversation.labels?.length ? conversation.labels.map((label) => <ConversationLabelBadge key={label.id} label={label} />) : <span className="subtle">Sem etiquetas</span>}
        </div>
        {conversation.groupChatName ? <p className="mt-2 text-xs text-muted-foreground">Originada no grupo <strong>{conversation.groupChatName}</strong></p> : null}
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
