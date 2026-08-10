import { useState } from "react";
import { MoreHorizontal, RefreshCw } from "lucide-react";
import { getInitials } from "@/app/Shell";
import { useListAgents, useListDepartments } from "./hooks/use-agents";

export default function AgentsAdmin() {
  const { data: agents, isLoading, isError, refetch } = useListAgents();
  const { data: departments } = useListDepartments();
  const [filter, setFilter] = useState("ALL");

  const rows = (agents || []).filter(
    (item) =>
      filter === "ALL" || (filter === "ONLINE" ? item.isOnline : item.departmentId === filter)
  );

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Administração / equipe</div>
          <h1>Atendentes</h1>
          <p className="subtle" style={{ marginTop: 9 }}>
            Presença e distribuição da equipe em tempo real.
          </p>
        </div>
        <div className="tag">
          <span style={{ color: "#3a9b7c", marginRight: 5 }}>●</span>
          {(agents || []).filter((item) => item.isOnline).length} online agora
        </div>
      </div>

      <div className="toolbar">
        <select
          className="select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          data-testid="select-agent-filter"
        >
          <option value="ALL">Toda a equipe</option>
          <option value="ONLINE">Somente online</option>
          {(departments || []).map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
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
            <button className="btn btn-muted" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Atendente</th>
                <th>Função</th>
                <th>Departamento</th>
                <th>Presença</th>
                <th />
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
                  <td>
                    <button className="btn btn-ghost" data-testid={`button-agent-details-${item.id}`}>
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
