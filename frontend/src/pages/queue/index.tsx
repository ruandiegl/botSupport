import { useState, useMemo } from "react";
import { MessageCircle, Clock3, Search, Headphones, RefreshCw } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import { useListConversations, useListDepartments } from "./hooks/use-queue";
import { ConversationRow } from "./components/ConversationRow";
import { QueueCard } from "./components/QueueCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Agent } from "@/types";

function QueryState({
  loading,
  error,
  empty,
  children,
  retry,
}: {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  children?: React.ReactNode;
  retry?: () => void;
}) {
  if (loading)
    return (
      <div className="panel loading">
        <div className="skeleton short" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  if (error)
    return (
      <div className="panel error-state">
        <RefreshCw size={24} />
        <h3>Não foi possível carregar as conversas</h3>
        <p className="subtle">Verifique a conexão com o servidor backend ou banco de dados.</p>
        <button
          className="btn btn-muted"
          style={{ marginTop: 15 }}
          onClick={retry}
          data-testid="button-retry"
        >
          Tentar novamente
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="panel empty-state">
        <MessageCircle size={28} />
        <h3>Nenhuma conversa encontrada</h3>
        <p className="subtle">Quando novos contatos chegarem via WhatsApp, eles aparecerão nesta fila.</p>
      </div>
    );
  return <>{children}</>;
}

export default function QueuePage(props?: { onlyMine?: boolean } & Record<string, any>) {
  const onlyMine = props?.onlyMine ?? false;
  const { activeAgent } = useActiveAgent();
  const currentAgentId = activeAgent?.id || "";

  const [status, setStatus] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data: conversations, isLoading, isError, refetch } = useListConversations(status, department);
  const { data: departments } = useListDepartments();
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: () => apiFetch<Agent[]>("/agents"),
  });

  const all = conversations || [];

  const filtered = useMemo(() => {
    return all.filter((item) => {
      const matchMine = !onlyMine || item.assignedAgentId === currentAgentId;
      const matchDept = department === "ALL" || item.departmentId === department;
      const matchSearch = `${item.contact.name} ${item.contact.phone} ${item.lastMessage}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchMine && matchDept && matchSearch;
    });
  }, [all, department, onlyMine, search, currentAgentId]);

  // Métricas 100% dinâmicas extraídas do banco
  const active = all.filter((item) => item.status !== "CLOSED").length;
  const queue = all.filter((item) => item.status === "QUEUED").length;
  const mine = all.filter(
    (item) => item.assignedAgentId === currentAgentId && item.status !== "CLOSED"
  ).length;
  const unread = all.reduce((sum, item) => sum + item.unreadCount, 0);

  const onlineAgents = agents.filter((a) => a.isOnline);
  const onlineNames = onlineAgents.map((a) => a.name).join(", ");

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {onlyMine ? "Seu turno / acompanhamento" : "Central de atendimento / agora"}
          </div>
          <h1>{onlyMine ? "Meus atendimentos" : "Fila de atendimento"}</h1>
          <p className="subtle" style={{ marginTop: 9 }}>
            {onlyMine
              ? "Acompanhe os contatos que estão sob sua responsabilidade."
              : "Visão em tempo real do fluxo de atendimento e triagem do WhatsApp."}
          </p>
        </div>
        {!onlyMine && (
          <button
            className="btn btn-primary"
            onClick={() => setStatus(status === "QUEUED" ? "ALL" : "QUEUED")}
            data-testid="button-focus-queue"
          >
            <Clock3 size={15} /> {status === "QUEUED" ? "Ver tudo" : "Focar na fila"}
          </button>
        )}
      </div>

      <div className="stats">
        <div className="panel stat">
          <div className="stat-label">Em aberto</div>
          <div className="stat-value">{active}</div>
          <div className="stat-note">
            <b>{all.length}</b> total de chamados
          </div>
        </div>
        <div className="panel stat">
          <div className="stat-label">Na fila</div>
          <div className="stat-value">{queue}</div>
          <div className="stat-note">
            aguardando atendimento
          </div>
        </div>
        <div className="panel stat">
          <div className="stat-label">Com você</div>
          <div className="stat-value">{mine}</div>
          <div className="stat-note">atendimentos sob sua gestão</div>
        </div>
        <div className="panel stat">
          <div className="stat-label">Não lidas</div>
          <div className="stat-value">{unread}</div>
          <div className="stat-note">mensagens recebidas</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, telefone ou mensagem"
            data-testid="input-search-conversations"
          />
        </div>
        <select
          className="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          data-testid="select-status"
        >
          <option value="ALL">Todos os status</option>
          <option value="QUEUED">Na fila</option>
          <option value="IN_PROGRESS">Em atendimento</option>
          <option value="BOT">No bot</option>
          <option value="CLOSED">Encerradas</option>
        </select>
        <select
          className="select"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          data-testid="select-department"
        >
          <option value="ALL">Todos os departamentos</option>
          {(departments || []).map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="split-layout">
        <div className="panel conversation-list">
          <div className="panel-header">
            <div className="panel-title">
              <MessageCircle size={17} />
              <h2>{onlyMine ? "Conversas assumidas" : "Conversas recentes"}</h2>
            </div>
            <span className="subtle">{filtered.length} registros</span>
          </div>
          <QueryState
            loading={isLoading}
            error={isError}
            empty={!filtered.length}
            retry={() => refetch()}
          >
            {filtered.map((item) => (
              <ConversationRow key={item.id} conversation={item} />
            ))}
          </QueryState>
        </div>

        <div className="right-stack">
          <QueueCard conversations={all} />
          <div className="panel service-card">
            <div className="service-icon">
              <Headphones size={16} />
            </div>
            <div>
              <h3>Plantão de suporte</h3>
              <p>
                {onlineAgents.length > 0
                  ? `${onlineAgents.length} atendente(s) online: ${onlineNames}`
                  : "Nenhum atendente online no momento."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
