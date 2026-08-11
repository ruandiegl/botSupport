import { useEffect, useState } from "react";
import { Bot, Check, ChevronDown, MessageCircle, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { FlowDefinition, FlowOption } from "@/types";
import { useGetFlow, useListDepartments, useUpdateFlow } from "./hooks/use-flow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type SelectedNode = "greeting" | "menu" | `option-${number}`;

const emptyOption = (): FlowOption => ({ label: "Nova rota", departmentId: "", procedureMessage: "" });

export default function FlowAdmin() {
  const { data: flow, isLoading, isError, refetch } = useGetFlow();
  const { data: departments = [] } = useListDepartments();
  const update = useUpdateFlow();
  const [draft, setDraft] = useState<FlowDefinition | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNode>("greeting");
  const [draggedRoute, setDraggedRoute] = useState<number | null>(null);
  const [dragOverRoute, setDragOverRoute] = useState<number | null>(null);
  const [deleteRouteIndex, setDeleteRouteIndex] = useState<number | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const current = draft || flow;
  const hasDraft = Boolean(draft);

  useEffect(() => {
    if (flow && !draft) setSelectedNode("greeting");
  }, [flow, draft]);

  const change = (next: FlowDefinition) => setDraft(next);
  const updateField = (field: "name" | "greeting" | "menuMessage", value: string) => {
    if (current) change({ ...current, [field]: value });
  };
  const updateOption = (index: number, field: keyof FlowOption, value: string) => {
    if (!current) return;
    change({ ...current, options: current.options.map((item, i) => i === index ? { ...item, [field]: value } : item) });
  };
  const addRoute = () => {
    if (!current) return;
    const options = [...current.options, emptyOption()];
    change({ ...current, options });
    setSelectedNode(`option-${options.length - 1}`);
  };
  const removeRoute = (index: number) => {
    if (!current) return;
    setDeleteRouteIndex(index);
  };
  const confirmRemoveRoute = () => {
    if (!current || deleteRouteIndex === null) return;
    const index = deleteRouteIndex;
    const options = current.options.filter((_, i) => i !== index);
    change({ ...current, options });
    setSelectedNode(options.length ? `option-${Math.max(0, index - 1)}` : "menu");
    setDeleteRouteIndex(null);
  };
  const reorderRoute = (from: number, to: number) => {
    if (!current || from === to) return;
    const options = [...current.options];
    const [moved] = options.splice(from, 1);
    options.splice(to, 0, moved);
    change({ ...current, options });
    setSelectedNode(`option-${to}`);
    setDragOverRoute(null);
  };
  const publish = async () => {
    if (!current || !hasDraft) return;
    await update.mutateAsync({ data: { name: current.name, greeting: current.greeting, menuMessage: current.menuMessage, options: current.options } });
    setDraft(null);
  };

  const selectedIndex = selectedNode.startsWith("option-") ? Number(selectedNode.slice(7)) : -1;
  const selectedOption = current?.options[selectedIndex];
  const departmentName = (id: string) => departments.find((item) => item.id === id)?.name || "Sem departamento";

  if (isLoading) return <div className="content"><div className="panel loading"><div className="skeleton short" /><div className="skeleton" /></div></div>;
  if (isError || !current) return <div className="content"><div className="panel error-state"><RefreshCw size={24} /><p>Falha ao carregar fluxo.</p><Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button></div></div>;

  return (
    <div className="content flow-admin">
      <PageHeader
        eyebrow="Administração / automação"
        title="Fluxo do bot"
        description="Configure a conversa automática antes de chegar à equipe."
        action={<div className="flow-page-actions"><span className={`flow-draft-status ${hasDraft ? "is-draft" : ""}`}>{hasDraft ? "Rascunho não publicado" : "Publicado"}</span><Button variant="default" size="lg" disabled={!hasDraft || update.isPending} onClick={() => setPublishConfirmOpen(true)}><Check data-icon="inline-start" />{update.isPending ? "Publicando..." : "Publicar alterações"}</Button></div>}
      />

      <div className="flow-workspace">
        <section className="panel flow-map-panel">
          <div className="panel-header"><div className="panel-title"><Bot /><h2>Mapa da conversa</h2></div><span className="flow-map-status">{hasDraft ? "rascunho" : "versão publicada"}</span></div>
          <div className="flow-canvas flow-map-canvas">
            <button className={`flow-node ${selectedNode === "greeting" ? "selected" : ""}`} onClick={() => setSelectedNode("greeting")}><div className="flow-node-head"><h3>Boas-vindas</h3><span>Entrada</span></div><p>{current.greeting || "Mensagem de boas-vindas"}</p></button>
            <div className="flow-arrow"><ChevronDown /></div>
            <button className={`flow-node highlight ${selectedNode === "menu" ? "selected" : ""}`} onClick={() => setSelectedNode("menu")}><div className="flow-node-head"><h3>Menu principal</h3><span>Decisão</span></div><p>{current.menuMessage || "Mensagem do menu"}</p></button>
            {current.options.map((option, index) => <div key={`route-slot-${index}`} className="flow-route-slot" onDragOver={(event) => { event.preventDefault(); if (draggedRoute !== null && draggedRoute !== index) setDragOverRoute(index); }} onDrop={() => { if (draggedRoute !== null) reorderRoute(draggedRoute, index); setDraggedRoute(null); setDragOverRoute(null); }}>
              {dragOverRoute === index && draggedRoute !== index && <div className="flow-drop-preview"><span>Soltar rota aqui</span></div>}
              <div className={`flow-route-group ${draggedRoute === index ? "is-dragging" : ""}`}><div className="flow-arrow"><ChevronDown /></div><button draggable className={`flow-node ${selectedNode === `option-${index}` ? "selected" : ""}`} onDragStart={() => { setDraggedRoute(index); setDragOverRoute(null); }} onDragEnd={() => { setDraggedRoute(null); setDragOverRoute(null); }} onClick={() => setSelectedNode(`option-${index}`)}><div className="flow-node-head"><h3>{option.label || "Nova rota"}</h3><span>Rota {index + 1}</span></div><p>{option.procedureMessage || "Mensagem de encaminhamento"}</p><span className="flow-node-department">{departmentName(option.departmentId)}</span></button></div>
            </div>)}
            {draggedRoute !== null && dragOverRoute === current.options.length && <div className="flow-drop-preview" onDragOver={(event) => event.preventDefault()} onDrop={() => { reorderRoute(draggedRoute, current.options.length); setDraggedRoute(null); setDragOverRoute(null); }}><span>Soltar rota aqui</span></div>}
            <Button className="flow-add-route" variant="outline" onClick={addRoute}><Plus data-icon="inline-start" />Adicionar rota</Button>
          </div>
        </section>

        <section className="panel flow-editor-panel">
          <div className="panel-header"><div className="panel-title"><Pencil /><h2>Editar: {selectedNode === "greeting" ? "Boas-vindas" : selectedNode === "menu" ? "Menu principal" : selectedOption?.label || "Rota"}</h2></div></div>
          <div className="form-stack flow-editor-form">
            {selectedNode === "greeting" && <>
              <div className="field"><label htmlFor="flow-name">Nome do fluxo</label><Input id="flow-name" value={current.name} onChange={(e) => updateField("name", e.target.value)} /></div>
              <div className="field"><label htmlFor="flow-greeting">Mensagem de saudação</label><Textarea id="flow-greeting" value={current.greeting} onChange={(e) => updateField("greeting", e.target.value)} /></div>
              <WhatsAppPreview title="Prévia no WhatsApp"><div className="whatsapp-bubble">{current.greeting || "Digite uma saudação para visualizar."}</div></WhatsAppPreview>
            </>}
            {selectedNode === "menu" && <>
              <div className="field"><label htmlFor="flow-menu">Mensagem do menu</label><Textarea id="flow-menu" value={current.menuMessage} onChange={(e) => updateField("menuMessage", e.target.value)} /></div>
              <div className="flow-editor-section"><div className="detail-label">Botões do WhatsApp</div>{current.options.map((option, index) => <div className="flow-route-edit" key={`route-edit-${index}`}><Input value={option.label} onChange={(e) => updateOption(index, "label", e.target.value)} placeholder={`Rota ${index + 1}`} /><Button variant="ghost" size="icon-sm" onClick={() => { setSelectedNode(`option-${index}`); }} aria-label="Editar rota"><Pencil /></Button></div>)}<Button className="flow-add-route" variant="outline" onClick={addRoute}><Plus data-icon="inline-start" />Adicionar rota</Button></div>
              <WhatsAppPreview title="Prévia completa"><div className="whatsapp-bubble">{current.menuMessage}</div><div className="whatsapp-options">{current.options.map((option, index) => <button key={index} onClick={() => setSelectedNode(`option-${index}`)}>{option.label || `Rota ${index + 1}`}</button>)}</div></WhatsAppPreview>
            </>}
            {selectedNode.startsWith("option-") && selectedOption && <>
              <div className="field"><label htmlFor="route-label">Nome da rota / texto do botão</label><Input id="route-label" value={selectedOption.label} onChange={(e) => updateOption(selectedIndex, "label", e.target.value)} /></div>
              <div className="field"><label>Departamento</label><Select value={selectedOption.departmentId || undefined} onValueChange={(value) => updateOption(selectedIndex, "departmentId", value || "")}><SelectTrigger><SelectValue>{departmentName(selectedOption.departmentId)}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup>{departments.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="field"><label htmlFor="route-message">Mensagem de encaminhamento</label><Textarea id="route-message" value={selectedOption.procedureMessage} onChange={(e) => updateOption(selectedIndex, "procedureMessage", e.target.value)} /></div>
              <Button className="flow-add-route" variant="outline" onClick={addRoute}><Plus data-icon="inline-start" />Adicionar botão à rota</Button>
              <Button variant="destructive" onClick={() => removeRoute(selectedIndex)}><Trash2 data-icon="inline-start" />Excluir esta rota</Button>
            </>}
          </div>
        </section>
      </div>
      <ConfirmationDialog
        open={publishConfirmOpen}
        onOpenChange={setPublishConfirmOpen}
        tone="warning"
        title="Publicar alterações do fluxo?"
        description="O rascunho passará a orientar novas conversas no WhatsApp."
        confirmLabel="Publicar fluxo"
        details={<span><strong>{current.name}</strong> · {current.options.length} rota(s)</span>}
        onConfirm={publish}
        testId="button-confirm-publish-flow"
      />
      <ConfirmationDialog
        open={deleteRouteIndex !== null}
        onOpenChange={(open) => !open && setDeleteRouteIndex(null)}
        tone="danger"
        title="Excluir esta rota?"
        description="A rota será removida do rascunho. A mudança só chegará aos clientes após a publicação."
        confirmLabel="Excluir rota"
        details={<strong>{deleteRouteIndex !== null ? current.options[deleteRouteIndex]?.label : ""}</strong>}
        onConfirm={confirmRemoveRoute}
        testId="button-confirm-delete-flow-route"
      />
    </div>
  );
}

function WhatsAppPreview({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="whatsapp-preview"><div className="whatsapp-preview-header"><MessageCircle />{title}</div>{children}<span className="whatsapp-time">agora</span></div>;
}
