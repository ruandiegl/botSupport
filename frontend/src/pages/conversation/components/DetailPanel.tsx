import { FileText, Clock3, Zap } from "lucide-react";
import type { Conversation } from "@/types";
import { getInitials } from "@/app/Shell";
import { Status } from "@/pages/queue/components/ConversationRow";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Department } from "@/types";

export function DetailPanel({
  conversation,
  onInsertPreset,
}: {
  conversation: Conversation;
  onInsertPreset: (text: string) => void;
}) {
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => apiFetch<Department[]>("/departments"),
  });

  const dept = departments.find((d) => d.id === conversation.departmentId);
  const procedures = dept?.procedures || [];

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

      <div className="detail-section">
        <div className="detail-label">Procedimentos e Atalhos</div>
        <div className="detail-actions">
          <button
            className="btn btn-muted"
            onClick={() =>
              onInsertPreset("Olá! Estou acompanhando seu atendimento e vou ajudar com isso.")
            }
            data-testid="button-insert-greeting"
          >
            <FileText size={14} /> Inserir saudação
          </button>
          <button
            className="btn btn-muted"
            onClick={() =>
              onInsertPreset("Recebi sua mensagem. Vou verificar os detalhes e retorno em seguida.")
            }
            data-testid="button-insert-followup"
          >
            <Clock3 size={14} /> Inserir acompanhamento
          </button>

          {procedures.map((p) => (
            <button
              key={p.id}
              className="btn btn-muted"
              onClick={() => onInsertPreset(`*Procedimento: ${p.title}*\n${p.content}`)}
              title={p.content}
              data-testid={`button-insert-procedure-${p.id}`}
            >
              <Zap size={14} /> {p.title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="detail-label">Identificação</div>
        <span className="tag">WhatsApp</span>
        <span className="tag" style={{ marginLeft: 5 }}>
          {conversation.id}
        </span>
      </div>
    </aside>
  );
}
