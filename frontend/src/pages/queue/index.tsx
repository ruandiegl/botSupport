import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Clock3, Search, Headphones, RefreshCw } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import { useListConversations, useListDepartments } from "./hooks/use-queue";
import { ConversationRow } from "./components/ConversationRow";
import { QueueCard } from "./components/QueueCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Agent } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const CONVERSATIONS_PER_PAGE = 5;

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
        <Button
          variant="outline"
          size="sm"
          style={{ marginTop: 15 }}
          onClick={retry}
          data-testid="button-retry"
        >
          Tentar novamente
        </Button>
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
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / CONVERSATIONS_PER_PAGE));
  const paginatedConversations = useMemo(() => {
    const start = (currentPage - 1) * CONVERSATIONS_PER_PAGE;
    return filtered.slice(start, start + CONVERSATIONS_PER_PAGE);
  }, [filtered, currentPage]);
  const firstVisible = filtered.length ? (currentPage - 1) * CONVERSATIONS_PER_PAGE + 1 : 0;
  const lastVisible = Math.min(currentPage * CONVERSATIONS_PER_PAGE, filtered.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [status, department, search, onlyMine, currentAgentId]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  // Métricas 100% dinâmicas extraídas do banco
  const active = all.filter((item) => item.status !== "CLOSED").length;
  const queue = all.filter((item) => item.status === "QUEUED").length;
  const mine = all.filter(
    (item) => item.assignedAgentId === currentAgentId && item.status !== "CLOSED"
  ).length;
  const unread = all.reduce((sum, item) => sum + item.unreadCount, 0);

  const onlineAgents = agents.filter((a) => a.isOnline);
  const onlineNames = onlineAgents.map((a) => a.name).join(", ");
  const statusLabels: Record<string, string> = {
    ALL: "Todos os status",
    QUEUED: "Na fila",
    IN_PROGRESS: "Em atendimento",
    BOT: "No bot",
    CLOSED: "Encerradas",
  };
  const departmentLabel = department === "ALL"
    ? "Todos os departamentos"
    : departments?.find((item) => item.id === department)?.name || "Todos os departamentos";

  return (
    <div className="content">
      <PageHeader
        eyebrow={onlyMine ? "Seu turno / acompanhamento" : "Central de atendimento / agora"}
        title={onlyMine ? "Meus atendimentos" : "Fila de atendimento"}
        description={
          onlyMine
            ? "Acompanhe os contatos que estão sob sua responsabilidade."
            : "Visão em tempo real do fluxo de atendimento e triagem do WhatsApp."
        }
        action={!onlyMine ? (
          <Button
            variant="default"
            size="lg"
            onClick={() => setStatus(status === "QUEUED" ? "ALL" : "QUEUED")}
            data-testid="button-focus-queue"
          >
            <Clock3 size={15} /> {status === "QUEUED" ? "Ver tudo" : "Focar na fila"}
          </Button>
        ) : undefined}
      />

      <div className="stats">
        <MetricCard label="Em aberto" value={active} note={<><b>{all.length}</b> total de chamados</>} />
        <MetricCard label="Na fila" value={queue} note="aguardando atendimento" tone="warning" />
        <MetricCard label="Com você" value={mine} note="atendimentos sob sua gestão" tone="success" />
        <MetricCard label="Não lidas" value={unread} note="mensagens recebidas" tone="info" />
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <Input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, telefone ou mensagem"
            data-testid="input-search-conversations"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "ALL")}>
          <SelectTrigger className="select" data-testid="select-status-filter">
            <SelectValue>{statusLabels[status] || "Todos os status"}</SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
            <SelectGroup>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="QUEUED">Na fila</SelectItem>
              <SelectItem value="IN_PROGRESS">Em atendimento</SelectItem>
              <SelectItem value="BOT">No bot</SelectItem>
              <SelectItem value="CLOSED">Encerradas</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={department} onValueChange={(value) => setDepartment(value ?? "ALL")}>
          <SelectTrigger className="select" data-testid="select-department-filter">
            <SelectValue>{departmentLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
            <SelectGroup>
              <SelectItem value="ALL">Todos os departamentos</SelectItem>
              {(departments || []).map((item) => <SelectItem value={item.id} key={item.id}>{item.name}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
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
            {paginatedConversations.map((item) => (
              <ConversationRow key={item.id} conversation={item} />
            ))}
            {filtered.length > 0 ? (
              <div className="conversation-pagination">
                <span className="subtle">Exibindo {firstVisible}–{lastVisible} de {filtered.length}</span>
                <Pagination className="sm:w-auto sm:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : 0}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        onClick={(event) => { event.preventDefault(); goToPage(currentPage - 1); }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink href="#" isActive={page === currentPage} aria-label={`Ir para a página ${page}`} onClick={(event) => { event.preventDefault(); goToPage(page); }}>{page}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : 0}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        onClick={(event) => { event.preventDefault(); goToPage(currentPage + 1); }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
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
