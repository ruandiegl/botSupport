import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, RefreshCw, RotateCcw, Save } from "lucide-react";
import type { FlowNode, FlowNodeType, FlowRevision } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { FlowBuilder } from "./components/FlowBuilder";
import {
  addRoute,
  createNode,
  duplicateNode,
  insertNode,
  moveNode,
  rebuildTransitions,
  removeNode,
  reorderContainer,
  replaceNode,
  validateFlow,
} from "./lib/flow-model";
import {
  useGetFlow,
  useListDepartments,
  usePublishFlowDraft,
  useSaveFlowDraft,
} from "./hooks/use-flow";
import "./styles.css";

const cloneRevision = (revision: FlowRevision) => structuredClone(revision);

export default function FlowAdmin() {
  const { data: serverDraft, isLoading, isError, refetch } = useGetFlow();
  const { data: departments = [] } = useListDepartments();
  const saveDraft = useSaveFlowDraft();
  const publishDraft = usePublishFlowDraft();
  const [draft, setDraft] = useState<FlowRevision | null>(null);
  const [baseline, setBaseline] = useState<FlowRevision | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!serverDraft || isDirty) return;
    const next = cloneRevision(serverDraft);
    setDraft(next);
    setBaseline(cloneRevision(serverDraft));
    setSelectedNodeId((current) => next.nodes.some((node) => node.id === current) ? current : next.nodes[0]?.id ?? "");
  }, [serverDraft, isDirty]);

  useEffect(() => {
    const warnUnsaved = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnUnsaved);
    return () => window.removeEventListener("beforeunload", warnUnsaved);
  }, [isDirty]);

  const validation = useMemo(() => draft ? validateFlow(draft) : { valid: false, issues: [] }, [draft]);
  const selectedNode = draft?.nodes.find((node) => node.id === selectedNodeId) ?? draft?.nodes[0];
  const pending = saveDraft.isPending || publishDraft.isPending;

  const commitLocal = (next: FlowRevision, selectedId?: string) => {
    setDraft(next);
    setIsDirty(true);
    setFeedback(null);
    if (selectedId) setSelectedNodeId(selectedId);
  };

  const changeNode = (node: FlowNode) => {
    if (!draft) return;
    let next = replaceNode(draft, node);
    if (node.type === "ROUTE") {
      next = {
        ...next,
        nodes: next.nodes.map((item) => item.config.parentRouteId === node.id && item.type === "HANDOFF"
          ? { ...item, departmentId: node.departmentId }
          : item),
      };
    }
    commitLocal(rebuildTransitions(next));
  };

  const addNewRoute = () => {
    if (!draft) return;
    const result = addRoute(draft);
    commitLocal(result.revision, result.routeId);
  };

  const addStep = (type: FlowNodeType, parentRouteId?: string) => {
    if (!draft) return;
    const node = createNode(type);
    commitLocal(insertNode(draft, node, parentRouteId), node.id);
  };

  const duplicateSelected = () => {
    if (!draft || !selectedNode) return;
    const result = duplicateNode(draft, selectedNode.id);
    commitLocal(result.revision, result.nodeId);
  };

  const confirmDelete = () => {
    if (!draft || !deleteNodeId) return;
    const next = removeNode(draft, deleteNodeId);
    commitLocal(next, next.nodes[0]?.id);
    setDeleteNodeId(null);
  };

  const save = async () => {
    if (!draft) return;
    if (!validation.valid) {
      const first = validation.issues.find((issue) => issue.nodeId);
      if (first?.nodeId) setSelectedNodeId(first.nodeId);
      setFeedback("Corrija as pendências destacadas antes de salvar o rascunho.");
      return;
    }
    try {
      const saved = await saveDraft.mutateAsync(draft);
      setDraft(cloneRevision(saved));
      setBaseline(cloneRevision(saved));
      setIsDirty(false);
      setFeedback("Rascunho salvo com sucesso.");
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : "Não foi possível salvar o rascunho.");
    }
  };

  const publish = async () => {
    if (!draft) return;
    if (!validation.valid) {
      const first = validation.issues.find((issue) => issue.nodeId);
      if (first?.nodeId) setSelectedNodeId(first.nodeId);
      throw new Error("Existem pendências no fluxo. Corrija os cards destacados antes de publicar.");
    }
    const published = await publishDraft.mutateAsync(draft);
    setDraft(cloneRevision(published));
    setBaseline(cloneRevision(published));
    setIsDirty(false);
    setFeedback("Fluxo publicado. Novas conversas usarão esta versão.");
  };

  const discard = () => {
    if (!baseline) return;
    const restored = cloneRevision(baseline);
    setDraft(restored);
    setSelectedNodeId(restored.nodes[0]?.id ?? "");
    setIsDirty(false);
    setFeedback("Alterações locais descartadas.");
  };

  if (isLoading) {
    return <div className="content flow-admin"><div className="flow-loading"><Skeleton className="h-10 w-80" /><div className="flow-loading-grid"><Skeleton className="h-[620px]" /><Skeleton className="h-[620px]" /></div></div></div>;
  }

  if (isError || !draft || !selectedNode) {
    return (
      <div className="content flow-admin">
        <Empty className="flow-error-empty">
          <EmptyHeader><EmptyMedia variant="icon"><AlertCircle /></EmptyMedia><EmptyTitle>Não foi possível carregar o fluxo</EmptyTitle><EmptyDescription>Verifique a conexão com a API e tente novamente.</EmptyDescription></EmptyHeader>
          <EmptyContent><Button variant="default" onClick={() => refetch()}><RefreshCw data-icon="inline-start" />Tentar novamente</Button></EmptyContent>
        </Empty>
      </div>
    );
  }

  const deleteTarget = draft.nodes.find((node) => node.id === deleteNodeId);
  const positiveFeedback = Boolean(feedback && (feedback.includes("sucesso") || feedback.includes("publicado") || feedback.includes("descartadas")));
  const canPublish = isDirty || draft.status === "DRAFT";
  return (
    <div className="content flow-admin">
      <PageHeader
        eyebrow="Administração / automação"
        title="Fluxo do bot"
        description="Monte a jornada completa, configure a triagem de cada rota e publique quando estiver pronta."
        action={
          <div className="flow-page-actions">
            <Badge variant={isDirty ? "secondary" : "default"}>{isDirty ? "Rascunho alterado" : draft.status === "PUBLISHED" ? "Publicado" : "Rascunho salvo"}</Badge>
            <Button variant="outline" disabled={!isDirty || pending} onClick={() => setDiscardConfirmOpen(true)}><RotateCcw data-icon="inline-start" />Descartar</Button>
            <Button variant="secondary" disabled={!isDirty || pending} onClick={save}>{saveDraft.isPending ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}{saveDraft.isPending ? "Salvando..." : "Salvar rascunho"}</Button>
            <Button variant="default" disabled={!canPublish || pending} onClick={() => setPublishConfirmOpen(true)}>{publishDraft.isPending ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />}{publishDraft.isPending ? "Publicando..." : "Publicar"}</Button>
          </div>
        }
      />

      {feedback ? <Alert variant={positiveFeedback ? "default" : "destructive"} className="flow-feedback"><AlertTitle>{positiveFeedback ? "Tudo certo" : "Atenção"}</AlertTitle><AlertDescription>{feedback}</AlertDescription></Alert> : null}
      {!validation.valid ? <Alert variant="destructive" className="flow-feedback"><AlertTitle>{validation.issues.length} pendência(s) no rascunho</AlertTitle><AlertDescription>Os cards com problemas estão identificados. A publicação permanece bloqueada até a correção.</AlertDescription></Alert> : null}

      <FlowBuilder
        revision={draft}
        selectedNode={selectedNode}
        departments={departments}
        issues={validation.issues}
        onSelect={setSelectedNodeId}
        onChangeNode={changeNode}
        onReorder={(containerId, activeId, overId) => commitLocal(reorderContainer(draft, containerId, activeId, overId), activeId)}
        onMove={(nodeId, direction) => commitLocal(moveNode(draft, nodeId, direction), nodeId)}
        onAddRoute={addNewRoute}
        onAddStep={addStep}
        onDuplicate={duplicateSelected}
        onDelete={() => setDeleteNodeId(selectedNode.id)}
      />

      <ConfirmationDialog
        open={publishConfirmOpen}
        onOpenChange={setPublishConfirmOpen}
        tone="warning"
        title="Publicar esta versão do fluxo?"
        description="O rascunho validado passará a orientar somente as novas conversas. Atendimentos em andamento permanecem na versão anterior."
        confirmLabel="Publicar fluxo"
        details={<span><strong>{draft.name ?? "Fluxo principal"}</strong> · {draft.nodes.length} etapas · versão {draft.version}</span>}
        onConfirm={publish}
        testId="button-confirm-publish-flow"
      />
      <ConfirmationDialog
        open={deleteNodeId !== null}
        onOpenChange={(open) => !open && setDeleteNodeId(null)}
        tone="danger"
        title={deleteTarget?.type === "ROUTE" ? "Excluir rota e suas etapas?" : "Excluir esta etapa?"}
        description={deleteTarget?.type === "ROUTE" ? "A rota inteira e sua sequência de triagem serão removidas do rascunho." : "A etapa será removida e as etapas restantes serão reconectadas na ordem atual."}
        confirmLabel={deleteTarget?.type === "ROUTE" ? "Excluir rota" : "Excluir etapa"}
        details={<strong>{deleteTarget?.name}</strong>}
        onConfirm={confirmDelete}
        testId="button-confirm-delete-flow-node"
      />
      <ConfirmationDialog
        open={discardConfirmOpen}
        onOpenChange={setDiscardConfirmOpen}
        tone="warning"
        title="Descartar alterações locais?"
        description="O editor voltará ao último rascunho salvo. Esta ação não altera a versão publicada."
        confirmLabel="Descartar alterações"
        onConfirm={discard}
        testId="button-confirm-discard-flow"
      />
    </div>
  );
}
