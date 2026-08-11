import { useState } from "react";
import { RefreshCw, UserPlus, Pencil, Trash2 } from "lucide-react";
import { getInitials } from "@/app/Shell";
import {
  useListAgents,
  useListDepartments,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useSetAgentStatus,
} from "./hooks/use-agents";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentModal } from "./components/AgentModal";
import type { Agent } from "@/types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function AgentsAdmin() {
  const { data: agents, isLoading, isError, refetch } = useListAgents();
  const { data: departments = [] } = useListDepartments();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const setAgentStatus = useSetAgentStatus();

  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [statusTarget, setStatusTarget] = useState<Agent | null>(null);
  const filterLabel = filter === "ALL"
    ? "Toda a equipe"
    : filter === "ONLINE"
      ? "Somente online"
      : departments.find((item) => item.id === filter)?.name || "Toda a equipe";

  const rows = (agents || []).filter(
    (item) =>
      filter === "ALL" || (filter === "ONLINE" ? item.isOnline : item.departmentId === filter)
  );

  const handleOpenCreate = () => {
    setSelectedAgent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handleDelete = (agent: Agent) => {
    setDeleteTarget(agent);
  };

  const handleToggleStatus = (agent: Agent) => {
    setStatusTarget(agent);
  };

  const handleSaveModal = async (data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    departmentId?: string | null;
  }) => {
    if (selectedAgent) {
      await updateAgent.mutateAsync({
        id: selectedAgent.id,
        data,
      });
    } else {
      await createAgent.mutateAsync(data);
    }
  };

  return (
    <div className="content">
      <PageHeader
        eyebrow="Administração / equipe"
        title="Atendentes"
        description="Presença, permissões e cadastro de atendentes em tempo real."
        action={
          <div className="flex items-center gap-3">
            <div className="tag">
              <span style={{ color: "#10b981", marginRight: 5 }}>●</span>
              {(agents || []).filter((item) => item.isOnline).length} online agora
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={handleOpenCreate}
              data-testid="button-create-agent"
            >
              <UserPlus size={15} /> Novo Atendente
            </Button>
          </div>
        }
      />

      <div className="toolbar">
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value ?? "ALL")}
        >
          <SelectTrigger className="select"><SelectValue>{filterLabel}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup>
            <SelectItem value="ALL">Toda a equipe</SelectItem>
            <SelectItem value="ONLINE">Somente online</SelectItem>
            {departments.map((item) => <SelectItem value={item.id} key={item.id}>{item.name}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>
      </div>

      <div className="panel">
        {isLoading ? (
          <div className="panel loading">
            <div className="skeleton short" />
            <div className="skeleton" />
          </div>
        ) : isError ? (
          <div className="panel error-state">
            <RefreshCw size={24} />
            <p>Falha ao carregar atendentes.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Atendente</th>
                <th>Função</th>
                <th>Departamento</th>
                <th>Presença</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="agent-cell">
                      <div className="avatar coral">{getInitials(item.name)}</div>
                      <div>
                        <strong>{item.name}</strong>
                        <div className="subtle">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="tag">{item.role}</span>
                  </td>
                  <td>{item.departmentName || "Todos"}</td>
                  <td>
                    <span className={`presence-chip ${item.isOnline ? "" : "offline"}`}>
                      {item.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td><span className={`tag ${item.isActive ? "" : "opacity-60"}`}>{item.isActive ? "Ativo" : "Inativo"}</span></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(item)} title={item.isActive ? "Desativar atendente" : "Ativar atendente"}>{item.isActive ? "Desativar" : "Ativar"}</Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Editar atendente"
                        data-testid={`button-edit-agent-${item.id}`}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item)}
                        title="Excluir atendente"
                        data-testid={`button-delete-agent-${item.id}`}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        agent={selectedAgent}
        departments={departments}
        isSaving={createAgent.isPending || updateAgent.isPending}
      />
      <ConfirmationDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        tone="warning"
        title={statusTarget?.isActive ? "Desativar este atendente?" : "Ativar este atendente?"}
        description="O status de acesso do usuário será alterado imediatamente."
        confirmLabel={statusTarget?.isActive ? "Desativar atendente" : "Ativar atendente"}
        details={<strong>{statusTarget?.name}</strong>}
        onConfirm={async () => {
          if (!statusTarget) return;
          await setAgentStatus.mutateAsync({ id: statusTarget.id, isActive: !statusTarget.isActive });
          setStatusTarget(null);
        }}
        testId="button-confirm-agent-status"
      />
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tone="danger"
        title="Excluir este atendente?"
        description="O usuário perderá o acesso e vínculos operacionais poderão ser afetados."
        confirmLabel="Excluir atendente"
        details={<strong>{deleteTarget?.name}</strong>}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteAgent.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        testId="button-confirm-delete-agent"
      />
    </div>
  );
}
