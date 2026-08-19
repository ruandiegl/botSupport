import { useEffect, useMemo, useState } from "react";
import { Headphones, MessageCircle, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useActiveAgent } from "@/app/Shell";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useListAgents, useListConversations, useListDepartments, type ConversationFilters } from "./hooks/use-queue";
import { ConversationRow } from "./components/ConversationRow";
import { QueueCard } from "./components/QueueCard";
import { DateRangeFilter, type DateRangeValue } from "./components/DateRangeFilter";
import { LabelFilter } from "./components/LabelFilter";

const CONVERSATIONS_PER_PAGE = 5;

function QueryState({ loading, error, empty, children, retry }: { loading?: boolean; error?: boolean; empty?: boolean; children?: React.ReactNode; retry?: () => void }) {
  if (loading) return <div className="panel loading"><div className="skeleton short" /><div className="skeleton" /><div className="skeleton" /></div>;
  if (error) return (
    <div className="panel error-state">
      <RefreshCw size={24} /><h3>Não foi possível carregar as conversas</h3><p className="subtle">Verifique a conexão com o servidor backend ou banco de dados.</p>
      <Button variant="outline" size="sm" style={{ marginTop: 15 }} onClick={retry} data-testid="button-retry">Tentar novamente</Button>
    </div>
  );
  if (empty) return <div className="panel empty-state"><MessageCircle size={28} /><h3>Nenhuma conversa encontrada</h3><p className="subtle">Quando novos contatos chegarem via WhatsApp, eles aparecerão nesta fila.</p></div>;
  return <>{children}</>;
}

const statusLabels: Record<string, string> = {
  ALL: "Todos os status", OPEN: "Em aberto", IN_PROGRESS: "Em atendimento", CLOSED: "Encerradas",
};

const defaultDateRange: DateRangeValue = { preset: "ALL", dateField: "lastActivityAt", from: "", to: "" };
// Keep each metric as a distinct filter.  "Em atendimento" is the global
// IN_PROGRESS view, while "Com você" is the same status scoped to the
// current agent; sharing the MINE key made the first click apply the wrong
// query and required a second interaction to reach the expected list.
type MetricFilter = "ACTIVE" | "OPEN" | "IN_PROGRESS" | "ALL" | "CLOSED";

export default function QueuePage(props?: { onlyMine?: boolean } & Record<string, unknown>) {
  const onlyMine = props?.onlyMine ?? false;
  const { activeAgent } = useActiveAgent();
  const currentAgentId = activeAgent?.id || "";
  // There is one explicit metric state.  The queue starts unfiltered (all
  // conversations), while operational sorting still puts OPEN first.
  const [status, setStatus] = useState("ALL");
  const [metricFilter, setMetricFilter] = useState<MetricFilter | null>(null);
  const [department, setDepartment] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultDateRange);
  const [currentPage, setCurrentPage] = useState(1);
  const [labelIds, setLabelIds] = useState<string[]>([]);

  const queryStatus = metricFilter === "ALL" || metricFilter === "ACTIVE"
    ? "ALL"
    : metricFilter === "OPEN"
    ? "OPEN"
    : metricFilter === "IN_PROGRESS"
    ? "IN_PROGRESS"
    : metricFilter === "CLOSED"
    ? "CLOSED"
    : status;
  const queryMine = onlyMine;
  const filters: ConversationFilters = {
    status: queryStatus,
    departmentId: department,
    search,
    dateField: dateRange.dateField,
    from: dateRange.from,
    to: dateRange.to,
    page: currentPage,
    limit: CONVERSATIONS_PER_PAGE,
    assignedAgentId: queryMine ? "me" : undefined,
    fallbackAssignedAgentId: currentAgentId,
    openOnly: metricFilter === "ACTIVE",
    sort: "operational",
    labelIds,
  };
  const { data: result, isLoading, isError, refetch } = useListConversations(filters);
  const { data: departments } = useListDepartments();
  const { data: agents = [] } = useListAgents();

  const all = result?.items ?? [];
  const locallyFiltered = useMemo(() => all.filter((item) => {
    const matchesMine = !queryMine || item.assignedAgentId === currentAgentId;
    const matchesDepartment = department === "ALL" || item.departmentId === department;
    const searchText = `${item.contact.name} ${item.contact.phone} ${item.lastMessage}`.toLowerCase();
    const matchesSearch = !search.trim() || searchText.includes(search.trim().toLowerCase());
    const timestamp = dateRange.dateField === "createdAt" ? item.startedAt : item.lastActivityAt ?? item.startedAt;
    const matchesDate = (!dateRange.from || timestamp >= dateRange.from) && (!dateRange.to || timestamp < dateRange.to);
    const matchesOpen = metricFilter !== "ACTIVE" || item.status !== "CLOSED";
    const matchesStatus = metricFilter !== "CLOSED" || item.status === "CLOSED";
    return matchesMine && matchesDepartment && matchesSearch && matchesDate && matchesOpen && matchesStatus;
  }), [all, currentAgentId, dateRange, department, metricFilter, onlyMine, queryMine, search]);

  const visibleConversations = result?.legacy ? locallyFiltered.slice((currentPage - 1) * CONVERSATIONS_PER_PAGE, currentPage * CONVERSATIONS_PER_PAGE) : locallyFiltered;
  const total = result?.legacy ? locallyFiltered.length : result?.total ?? locallyFiltered.length;
  const totalPages = result?.legacy ? Math.max(1, Math.ceil(total / CONVERSATIONS_PER_PAGE)) : Math.max(1, result?.totalPages ?? 1);
  const firstVisible = total ? (currentPage - 1) * CONVERSATIONS_PER_PAGE + 1 : 0;
  const lastVisible = Math.min(currentPage * CONVERSATIONS_PER_PAGE, total);

  useEffect(() => { setCurrentPage(1); }, [status, department, search, onlyMine, currentAgentId, dateRange, metricFilter, labelIds]);
  useEffect(() => { setCurrentPage((page) => Math.min(page, totalPages)); }, [totalPages]);

  const activateMetric = (next: MetricFilter) => {
    const isActive = metricFilter === next;
    const selected: MetricFilter | null = isActive ? null : next;
    setMetricFilter(selected);
    setStatus(selected === "OPEN" ? "OPEN" : selected === "IN_PROGRESS" ? "IN_PROGRESS" : selected === "CLOSED" ? "CLOSED" : "ALL");
  };
  const metricCounts = result?.counts ?? { all: 0, open: 0, inProgress: 0, closed: 0, mine: 0, unread: 0 };
  const allConversationCount = metricCounts.all ?? metricCounts.open + metricCounts.inProgress + metricCounts.closed;
  const activeConversationCount = metricCounts.open + metricCounts.inProgress;
  const onlineAgents = agents.filter((agent) => agent.isOnline);
  const onlineNames = onlineAgents.map((agent) => agent.name).join(", ");
  const departmentLabel = department === "ALL" ? "Todos os departamentos" : departments?.find((item) => item.id === department)?.name || "Departamento";

  return (
    <div className="content queue-page">
      <PageHeader
        eyebrow={onlyMine ? "Seu turno / acompanhamento" : "Central de atendimento / agora"}
        title={onlyMine ? "Meus atendimentos" : "Fila de atendimento"}
        description={onlyMine ? "Acompanhe os contatos que estão sob sua responsabilidade." : "Comece pela fila de contatos que aguardam atendimento."}
      />

      <div className="stats">
        {!onlyMine ? <MetricCard label="Em andamento" value={activeConversationCount} note="em aberto e em atendimento" tone="primary" onClick={() => activateMetric("ACTIVE")} selected={metricFilter === "ACTIVE"} ariaLabel="Filtrar conversas em andamento" testId="metric-active" /> : null}
        <MetricCard label="Em aberto" value={metricCounts.open} note="aguardando atendimento" tone="warning" onClick={() => activateMetric("OPEN")} selected={metricFilter === "OPEN" || (!metricFilter && queryStatus === "OPEN")} ariaLabel="Filtrar conversas em aberto" testId="metric-open" />
        <MetricCard label="Em atendimento" value={metricCounts.inProgress} note="atendimentos em curso" tone="success" onClick={() => activateMetric("IN_PROGRESS")} selected={metricFilter === "IN_PROGRESS" || (!metricFilter && queryStatus === "IN_PROGRESS")} ariaLabel="Filtrar atendimentos em curso" testId="metric-in-progress" />
        {!onlyMine ? <MetricCard label="Todas as conversas" value={allConversationCount} note="visão completa da operação" tone="info" onClick={() => activateMetric("ALL")} selected={metricFilter === "ALL" || (!metricFilter && queryStatus === "ALL")} ariaLabel="Mostrar todas as conversas" testId="metric-all" /> : null}
        {!onlyMine ? <MetricCard label="Encerradas" value={metricCounts.closed} note="atendimentos finalizados" tone="primary" onClick={() => activateMetric("CLOSED")} selected={metricFilter === "CLOSED" || (!metricFilter && queryStatus === "CLOSED")} ariaLabel="Filtrar conversas encerradas" testId="metric-closed" /> : null}
      </div>

      <div className="toolbar queue-toolbar">
        <div className="search"><Search size={15} /><Input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, telefone ou mensagem" data-testid="input-search-conversations" /></div>
        <Select value={queryStatus} onValueChange={(value) => { setMetricFilter(null); setStatus(value ?? "ALL"); }}>
          <SelectTrigger className="select" data-testid="select-status-filter"><SelectValue>{statusLabels[queryStatus] || "Todos os status"}</SelectValue></SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup>{Object.entries(statusLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Select value={department} onValueChange={(value) => setDepartment(value ?? "ALL")}>
          <SelectTrigger className="select" data-testid="select-department-filter"><SelectValue>{departmentLabel}</SelectValue></SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup><SelectItem value="ALL">Todos os departamentos</SelectItem>{(departments || []).map((item) => <SelectItem value={item.id} key={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <LabelFilter value={labelIds} onChange={setLabelIds} />
        <div className="queue-sort-hint"><SlidersHorizontal /> Ordenado por urgência</div>
      </div>

      <div className="split-layout">
        <div className="panel conversation-list">
          <div className="panel-header"><div className="panel-title"><MessageCircle size={17} /><h2>{onlyMine ? "Conversas assumidas" : metricFilter === "ACTIVE" ? "Conversas em andamento" : queryStatus === "OPEN" ? "Em aberto" : queryStatus === "IN_PROGRESS" ? "Em atendimento" : queryStatus === "CLOSED" ? "Encerradas" : "Todas as conversas"}</h2></div><span className="subtle">{total} registros</span></div>
          <QueryState loading={isLoading} error={isError} empty={!visibleConversations.length} retry={() => refetch()}>
            {visibleConversations.map((item) => <ConversationRow key={item.id} conversation={item} />)}
            {total > 0 ? <div className="conversation-pagination"><span className="subtle">Exibindo {firstVisible}–{lastVisible} de {total}</span><Pagination className="sm:w-auto sm:justify-end"><PaginationContent><PaginationItem><PaginationPrevious href="#" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.max(1, page - 1)); }} /></PaginationItem>{Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((page) => <PaginationItem key={page}><PaginationLink href="#" isActive={page === currentPage} aria-label={`Ir para a página ${page}`} onClick={(event) => { event.preventDefault(); setCurrentPage(page); }}>{page}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.min(totalPages, page + 1)); }} /></PaginationItem></PaginationContent></Pagination></div> : null}
          </QueryState>
        </div>
        <div className="right-stack"><QueueCard conversations={all} fixedCounts={metricCounts} /><div className="panel service-card"><div className="service-icon"><Headphones size={16} /></div><div><h3>Plantão de suporte</h3><p>{onlineAgents.length > 0 ? `${onlineAgents.length} atendente(s) online: ${onlineNames}` : "Nenhum atendente online no momento."}</p></div></div></div>
      </div>
    </div>
  );
}
