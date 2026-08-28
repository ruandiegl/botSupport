import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, MessageSquarePlus, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useActiveAgent } from "@/app/Shell";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useListConversations, useListDepartments, type ConversationFilters } from "./hooks/use-queue";
import { ConversationRow } from "./components/ConversationRow";
import { QueueCard } from "./components/QueueCard";
import { DateRangeFilter, type DateRangeValue } from "./components/DateRangeFilter";
import { LabelFilter } from "./components/LabelFilter";
import { AgentWorkloadCard } from "./components/AgentWorkloadCard";
import { StartConversationDialog } from "@/pages/contacts/components/StartConversationDialog";
import { GlobalConversationSearch } from "./components/GlobalConversationSearch";

const CONVERSATIONS_PER_PAGE = 6;

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

const channelLabels: Record<"ALL" | "PRIVATE" | "GROUP", string> = {
  ALL: "Todos os canais",
  PRIVATE: "Conversas privadas",
  GROUP: "Grupos",
};

const defaultDateRange: DateRangeValue = { preset: "ALL", dateField: "lastActivityAt", from: "", to: "" };
// Keep each metric as a distinct filter.  "Em atendimento" is the global
// IN_PROGRESS view, while "Com você" is the same status scoped to the
// current agent; sharing the MINE key made the first click apply the wrong
// query and required a second interaction to reach the expected list.
type MetricFilter = "OPEN" | "IN_PROGRESS" | "ALL" | "CLOSED";

const QUEUE_RETURN_STATE_KEY = "gtfbot.queue.return-state.v1";

type PersistedQueueState = {
  onlyMine: boolean;
  status: string;
  metricFilter: MetricFilter | null;
  channel: "ALL" | "PRIVATE" | "GROUP";
  department: string;
  search: string;
  dateRange: DateRangeValue;
  currentPage: number;
  labelIds: string[];
};

function loadPersistedQueueState(onlyMine: boolean): PersistedQueueState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(QUEUE_RETURN_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedQueueState>;
    if (parsed.onlyMine !== onlyMine) return null;
    if (!parsed.dateRange || !Array.isArray(parsed.labelIds)) return null;
    if (!["ALL", "PRIVATE", "GROUP"].includes(parsed.channel ?? "")) return null;
    if (typeof parsed.status !== "string" || typeof parsed.department !== "string" || typeof parsed.search !== "string") return null;
    if (typeof parsed.currentPage !== "number" || parsed.currentPage < 1) return null;
    return {
      onlyMine,
      status: parsed.status,
      metricFilter: parsed.metricFilter === null || ["OPEN", "IN_PROGRESS", "ALL", "CLOSED"].includes(parsed.metricFilter ?? "")
        ? (parsed.metricFilter ?? null)
        : null,
      channel: parsed.channel as PersistedQueueState["channel"],
      department: parsed.department,
      search: parsed.search,
      dateRange: parsed.dateRange,
      currentPage: Math.floor(parsed.currentPage),
      labelIds: parsed.labelIds.filter((id): id is string => typeof id === "string"),
    };
  } catch {
    return null;
  }
}

type GroupCatalogSummary = {
  items?: Array<{ id: string }>;
};

export default function QueuePage(props?: { onlyMine?: boolean } & Record<string, unknown>) {
  const onlyMine = props?.onlyMine ?? false;
  const { activeAgent } = useActiveAgent();
  const { can } = useAuth();
  const currentAgentId = activeAgent?.id || "";
  const [restoredState] = useState(() => loadPersistedQueueState(onlyMine));
  // The initial operational view excludes CLOSED conversations.  The status
  // select can still opt into the complete history explicitly.
  const [status, setStatus] = useState(restoredState?.status ?? "ALL");
  const [metricFilter, setMetricFilter] = useState<MetricFilter | null>(restoredState ? restoredState.metricFilter : (onlyMine ? null : "ALL"));
  const [channel, setChannel] = useState<"ALL" | "PRIVATE" | "GROUP">(restoredState?.channel ?? "ALL");
  const [department, setDepartment] = useState(restoredState?.department ?? "ALL");
  const [search, setSearch] = useState(restoredState?.search ?? "");
  const [dateRange, setDateRange] = useState<DateRangeValue>(restoredState?.dateRange ?? defaultDateRange);
  const [currentPage, setCurrentPage] = useState(restoredState?.currentPage ?? 1);
  const [labelIds, setLabelIds] = useState<string[]>(restoredState?.labelIds ?? []);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const isGlobalSearch = search.trim().length > 0;
  const skipInitialPageReset = useRef(true);

  const queryStatus = metricFilter === "ALL"
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
    // A search is intentionally independent from the operational card and
    // toolbar filters: it always searches every conversation the server
    // permits the current user to see, including closed conversations.
    status: isGlobalSearch ? "ALL" : queryStatus,
    channel: isGlobalSearch ? "ALL" : channel,
    departmentId: isGlobalSearch ? "ALL" : department,
    search,
    dateField: dateRange.dateField,
    from: isGlobalSearch ? "" : dateRange.from,
    to: isGlobalSearch ? "" : dateRange.to,
    page: currentPage,
    limit: CONVERSATIONS_PER_PAGE,
    assignedAgentId: isGlobalSearch ? undefined : queryMine ? "me" : undefined,
    fallbackAssignedAgentId: currentAgentId,
    openOnly: isGlobalSearch ? false : metricFilter === "ALL",
    sort: "operational",
    labelIds: isGlobalSearch ? [] : labelIds,
  };
  const { data: result, isLoading, isError, refetch } = useListConversations(filters);
  const { data: departments } = useListDepartments();
  const { data: groupCatalog } = useQuery<GroupCatalogSummary>({
    // Share the catalog cache with the embedded group workspace so selecting
    // the card does not trigger a second Z-API synchronization request.
    queryKey: ["groups", ""],
    queryFn: () => apiFetch<GroupCatalogSummary>("/zapi/groups"),
    enabled: !onlyMine && can("groups", "view"),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const all = result?.items ?? [];
  const locallyFiltered = useMemo(() => all.filter((item) => {
    const matchesMine = isGlobalSearch || !queryMine || item.assignedAgentId === currentAgentId;
    const itemIsGroup = item.channel === "GROUP" || Boolean(item.groupChatName);
    const matchesChannel = isGlobalSearch || channel === "ALL" || (channel === "GROUP" ? itemIsGroup : !itemIsGroup);
    // Group rows are a continuous WhatsApp stream. A closed ticket from the
    // same group must never leak into this view; the live monitor (including a
    // DRAFT monitor) remains visible independently of ticket status.
    const matchesLiveGroup = isGlobalSearch || channel !== "GROUP" || item.status !== "CLOSED";
    const matchesDepartment = isGlobalSearch || department === "ALL" || item.departmentId === department;
    const searchText = `${item.contact.name} ${item.contact.phone} ${item.contact.email ?? ""} ${item.groupChatName ?? ""} ${item.lastMessage} ${item.searchMatch?.snippet ?? ""}`.toLowerCase();
    const matchesSearch = !search.trim() || searchText.includes(search.trim().toLowerCase());
    const timestamp = dateRange.dateField === "createdAt" ? item.startedAt : item.lastActivityAt ?? item.startedAt;
    const matchesDate = isGlobalSearch || ((!dateRange.from || timestamp >= dateRange.from) && (!dateRange.to || timestamp < dateRange.to));
    const matchesOpen = isGlobalSearch || metricFilter !== "ALL" || item.status !== "CLOSED";
    const matchesStatus = isGlobalSearch || metricFilter !== "CLOSED" || item.status === "CLOSED";
    return matchesMine && matchesChannel && matchesLiveGroup && matchesDepartment && matchesSearch && matchesDate && matchesOpen && matchesStatus;
  }), [all, channel, currentAgentId, dateRange, department, metricFilter, onlyMine, queryMine, search]);

  const visibleConversations = result?.legacy ? locallyFiltered.slice((currentPage - 1) * CONVERSATIONS_PER_PAGE, currentPage * CONVERSATIONS_PER_PAGE) : locallyFiltered;
  const total = result?.legacy ? locallyFiltered.length : result?.total ?? locallyFiltered.length;
  const totalPages = result?.legacy ? Math.max(1, Math.ceil(total / CONVERSATIONS_PER_PAGE)) : Math.max(1, result?.totalPages ?? 1);
  const firstVisible = total ? (currentPage - 1) * CONVERSATIONS_PER_PAGE + 1 : 0;
  const lastVisible = Math.min(currentPage * CONVERSATIONS_PER_PAGE, total);

  useEffect(() => {
    if (skipInitialPageReset.current) {
      skipInitialPageReset.current = false;
      return;
    }
    setCurrentPage(1);
  }, [status, channel, department, search, onlyMine, currentAgentId, dateRange, metricFilter, labelIds]);
  useEffect(() => { setCurrentPage((page) => Math.min(page, totalPages)); }, [totalPages]);
  useEffect(() => {
    if (!restoredState || typeof window === "undefined") return;
    window.sessionStorage.removeItem(QUEUE_RETURN_STATE_KEY);
  }, [restoredState]);

  const preserveQueueState = () => {
    if (typeof window === "undefined") return;
    try {
      const state: PersistedQueueState = {
        onlyMine,
        status,
        metricFilter,
        channel,
        department,
        search,
        dateRange,
        currentPage,
        labelIds,
      };
      window.sessionStorage.setItem(QUEUE_RETURN_STATE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private browsing; navigation still works.
    }
  };

  const activateMetric = (next: MetricFilter) => {
    // Metric cards select the operational scope.  Clear the channel filter so
    // a previous click on "Grupos" never traps the user in the group list.
    setChannel("ALL");
    if (next === "ALL") {
      setMetricFilter("ALL");
      setStatus("ALL");
      return;
    }
    const isActive = metricFilter === next;
    const selected: MetricFilter | null = isActive ? null : next;
    setMetricFilter(selected);
    setStatus(selected === "OPEN" ? "OPEN" : selected === "IN_PROGRESS" ? "IN_PROGRESS" : selected === "CLOSED" ? "CLOSED" : "ALL");
  };
  const activateGroups = () => {
    // Groups is only a channel filter.  Keep the status/date/department
    // choices intact so the user can return to the private queue without the
    // other cards being reset. Status does not apply to the continuous group
    // stream, so reset a stale status selection such as "Encerradas".
    setMetricFilter("ALL");
    setStatus("ALL");
    setChannel("GROUP");
    setCurrentPage(1);
  };
  const metricCounts = result?.counts ?? { all: 0, open: 0, inProgress: 0, closed: 0, mine: 0, unread: 0 };
  const groupCount = groupCatalog?.items?.length ?? 0;
  const allConversationCount = metricCounts.open + metricCounts.inProgress;
  const channelLabel = isGlobalSearch ? "Busca global" : channelLabels[channel];
  const departmentLabel = isGlobalSearch ? "Busca global" : department === "ALL" ? "Todos os departamentos" : departments?.find((item) => item.id === department)?.name || "Departamento";
  const conversationMatches = isGlobalSearch
    ? visibleConversations
      .filter((item) => item.searchConversationMatch || (!item.searchMatches?.length && item.searchMatch?.source !== "message"))
      .map((item) => item.searchConversationMatch ? { ...item, searchMatch: item.searchConversationMatch } : item)
    : visibleConversations;
  const messageMatches = isGlobalSearch
    ? visibleConversations.flatMap((item) => {
      const matches = item.searchMatches?.length
        ? item.searchMatches
        : item.searchMatch?.source === "message" ? [item.searchMatch] : [];
      return matches.map((match) => ({ ...item, searchMatch: match }));
    })
    : [];
  const renderRows = (items: typeof visibleConversations) => items.map((item, index) => <ConversationRow key={`${item.id}-${item.searchMatch?.messageId ?? item.searchMatch?.source ?? index}`} conversation={item} searchQuery={isGlobalSearch ? search : undefined} onOpen={preserveQueueState} />);

  return (
    <div className="content queue-page">
      <PageHeader
        eyebrow={onlyMine ? "Seu turno / acompanhamento" : "Central de atendimento / agora"}
        title={onlyMine ? "Meus atendimentos" : "Fila de atendimento"}
        description={onlyMine ? "Acompanhe os contatos que estão sob sua responsabilidade." : "Comece pela fila de contatos que aguardam atendimento."}
        action={!onlyMine && can("contacts", "create") ? <Button variant="success" onClick={() => setNewConversationOpen(true)}><MessageSquarePlus data-icon="inline-start" />Nova conversa</Button> : undefined}
      />

      <div className="stats">
        <MetricCard label="Em aberto" value={metricCounts.open} note="aguardando atendimento" tone="warning" onClick={() => activateMetric("OPEN")} selected={metricFilter === "OPEN" || (!metricFilter && queryStatus === "OPEN")} ariaLabel="Filtrar conversas em aberto" testId="metric-open" />
        <MetricCard label="Em atendimento" value={metricCounts.inProgress} note="atendimentos em curso" tone="success" onClick={() => activateMetric("IN_PROGRESS")} selected={metricFilter === "IN_PROGRESS" || (!metricFilter && queryStatus === "IN_PROGRESS")} ariaLabel="Filtrar atendimentos em curso" testId="metric-in-progress" />
        {!onlyMine ? <MetricCard label="Todas as conversas" value={allConversationCount} note="em aberto e em atendimento" tone="info" onClick={() => activateMetric("ALL")} selected={metricFilter === "ALL" && channel !== "GROUP"} ariaLabel="Mostrar todas as conversas em andamento" testId="metric-all" /> : null}
        {!onlyMine ? <MetricCard label="Encerradas" value={metricCounts.closed} note="atendimentos finalizados" tone="primary" onClick={() => activateMetric("CLOSED")} selected={metricFilter === "CLOSED" || (!metricFilter && queryStatus === "CLOSED")} ariaLabel="Filtrar conversas encerradas" testId="metric-closed" /> : null}
        {!onlyMine && can("groups", "view") ? <MetricCard label="Grupos" value={groupCount} note="mensagens contínuas por grupo" tone="success" onClick={activateGroups} selected={!isGlobalSearch && channel === "GROUP"} ariaLabel="Filtrar grupos do WhatsApp" testId="metric-groups" /> : null}
      </div>

      <div className="toolbar queue-toolbar">
        <GlobalConversationSearch
          value={search}
          onChange={setSearch}
        />
        <Select value={isGlobalSearch ? "ALL" : queryStatus} onValueChange={(value) => { setMetricFilter(null); setStatus(value ?? "ALL"); }} disabled={isGlobalSearch}>
          <SelectTrigger className="select" data-testid="select-status-filter"><SelectValue>{isGlobalSearch ? "Todos os status" : statusLabels[queryStatus] || "Todos os status"}</SelectValue></SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup>{Object.entries(statusLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Select value={isGlobalSearch ? "ALL" : department} onValueChange={(value) => setDepartment(value ?? "ALL")} disabled={isGlobalSearch}>
          <SelectTrigger className="select" data-testid="select-department-filter"><SelectValue>{departmentLabel}</SelectValue></SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup><SelectItem value="ALL">Todos os departamentos</SelectItem>{(departments || []).map((item) => <SelectItem value={item.id} key={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Select value={isGlobalSearch ? "ALL" : channel} onValueChange={(value) => setChannel((value as "ALL" | "PRIVATE" | "GROUP") || "ALL")} disabled={isGlobalSearch}>
          <SelectTrigger className="select" data-testid="select-channel-filter"><SelectValue>{channelLabel}</SelectValue></SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup>{Object.entries(channelLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <LabelFilter value={labelIds} onChange={setLabelIds} />
        <div className="queue-sort-hint"><SlidersHorizontal /> Ordenado por urgência</div>
      </div>

      <div className="split-layout">
        <div className={`panel conversation-list${channel === "GROUP" ? " conversation-list-groups" : ""}`}>
          <div className="panel-header"><div className="panel-title"><MessageCircle size={17} /><h2>{isGlobalSearch ? "Resultados da busca" : onlyMine ? "Conversas assumidas" : channel === "GROUP" ? "Grupos" : queryStatus === "OPEN" ? "Em aberto" : queryStatus === "IN_PROGRESS" ? "Em atendimento" : queryStatus === "CLOSED" ? "Encerradas" : "Todas as conversas"}</h2></div><span className="subtle">{total} registros</span></div>
          <QueryState loading={isLoading} error={isError} empty={!visibleConversations.length} retry={() => refetch()}>
            {isGlobalSearch ? <div className="search-results-stack">
              <section className="search-results-section" aria-labelledby="search-conversations-heading">
                <div className="search-results-heading"><h3 id="search-conversations-heading">Conversas</h3><span>{conversationMatches.length}</span></div>
                {conversationMatches.length ? renderRows(conversationMatches) : <p className="search-results-empty">Nenhuma conversa corresponde ao termo.</p>}
              </section>
              <section className="search-results-section" aria-labelledby="search-messages-heading">
                <div className="search-results-heading"><h3 id="search-messages-heading">Mensagens</h3><span>{messageMatches.length}</span></div>
                {messageMatches.length ? renderRows(messageMatches) : <p className="search-results-empty">Nenhuma mensagem corresponde ao termo.</p>}
              </section>
            </div> : renderRows(visibleConversations)}
            {total > 0 ? <div className="conversation-pagination"><span className="subtle">Exibindo {firstVisible}–{lastVisible} de {total}</span><Pagination className="sm:w-auto sm:justify-end"><PaginationContent><PaginationItem><PaginationPrevious href="#" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.max(1, page - 1)); }} /></PaginationItem>{Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((page) => <PaginationItem key={page}><PaginationLink href="#" isActive={page === currentPage} aria-label={`Ir para a página ${page}`} onClick={(event) => { event.preventDefault(); setCurrentPage(page); }}>{page}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.min(totalPages, page + 1)); }} /></PaginationItem></PaginationContent></Pagination></div> : null}
          </QueryState>
        </div>
        <div className="right-stack"><AgentWorkloadCard enabled={can("queue", "view_all")} /><QueueCard conversations={all} fixedCounts={metricCounts} /></div>
      </div>
      <StartConversationDialog open={newConversationOpen} onOpenChange={setNewConversationOpen} />
    </div>
  );
}
