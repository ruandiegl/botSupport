import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, CircleUserRound, Headphones, RefreshCw, UsersRound } from "lucide-react";
import { Link } from "wouter";
import type { AgentRole, AgentWorkloadItem, AssignedConversationSummary } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentWorkload } from "../hooks/use-agent-workload";

const roleLabels: Record<AgentRole, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  AGENT: "Atendente",
};

const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function AssignedConversation({ conversation }: { conversation: AssignedConversationSummary }) {
  return (
    <Link href={`/conversation/${conversation.id}`} className="agent-workload-conversation">
      <span className="agent-workload-conversation-copy">
        <strong>{conversation.contactName || "Contato sem nome"}</strong>
        <span>{conversation.departmentName || "Sem departamento"} · última atividade {formatTime(conversation.lastActivityAt)}</span>
      </span>
      {conversation.unreadCount > 0 ? <Badge variant="secondary">{conversation.unreadCount} não lida(s)</Badge> : null}
    </Link>
  );
}

function AgentWorkloadRow({ agent }: { agent: AgentWorkloadItem }) {
  const [expanded, setExpanded] = useState(agent.activeConversationCount > 0);
  const count = agent.conversations.length;

  useEffect(() => {
    if (agent.activeConversationCount > 0) setExpanded(true);
  }, [agent.activeConversationCount]);

  return (
    <div className="agent-workload-row">
      <Button
        type="button"
        variant="ghost"
        className="agent-workload-trigger"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {count > 0 ? (expanded ? <ChevronDown data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />) : <span className="agent-workload-chevron-spacer" aria-hidden="true" />}
        <span className="agent-workload-avatar" aria-hidden="true">{initials(agent.name) || <CircleUserRound />}</span>
        <span className="agent-workload-agent-copy">
          <strong>{agent.name}</strong>
          <span>{roleLabels[agent.role] ?? agent.role}{agent.departmentName ? ` · ${agent.departmentName}` : ""}</span>
        </span>
        <span className={`agent-workload-presence ${agent.isOnline ? "online" : "offline"}`}>
          <i aria-hidden="true" />{agent.isOnline ? "Online" : "Offline"}
        </span>
        <Badge variant={count > 0 ? "default" : "outline"}>{count} {count === 1 ? "chamado" : "chamados"}</Badge>
      </Button>
      {expanded && count > 0 ? (
        <div className="agent-workload-conversations" aria-label={`Chamados de ${agent.name}`}>
          {agent.conversations.map((conversation) => <AssignedConversation key={conversation.id} conversation={conversation} />)}
        </div>
      ) : null}
      {expanded && count === 0 ? <p className="agent-workload-empty">Nenhum chamado assumido.</p> : null}
    </div>
  );
}

export function AgentWorkloadCard({ enabled = true }: { enabled?: boolean }) {
  const { data, isLoading, isError, refetch } = useAgentWorkload(enabled);
  const summary = useMemo(() => data ? `${data.totals.online} online · ${data.totals.offline} offline` : "Presença da equipe", [data]);

  if (!enabled) return null;

  return (
    <Card className="agent-workload-card">
      <CardHeader>
        <CardTitle className="agent-workload-title"><UsersRound data-icon="inline-start" />Atendentes online</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="agent-workload-content">
        {isLoading ? <div className="agent-workload-loading"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div> : null}
        {isError ? (
          <Alert variant="destructive">
            <RefreshCw />
            <AlertTitle>Presença indisponível</AlertTitle>
            <AlertDescription className="agent-workload-error"><span>Não foi possível carregar a equipe agora.</span><Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button></AlertDescription>
          </Alert>
        ) : null}
        {!isLoading && !isError && !data?.items.length ? <div className="agent-workload-empty-state"><Headphones /><span>Nenhum atendente ativo no escopo.</span></div> : null}
        {!isLoading && !isError && data?.items.length ? (
          <div className="agent-workload-list">
            {data.items.map((agent, index) => <div key={agent.id}><AgentWorkloadRow agent={agent} />{index < data.items.length - 1 ? <Separator /> : null}</div>)}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
