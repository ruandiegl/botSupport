import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Archive, BookOpenText, Pencil, Plus, Search, Sparkles, ToggleLeft, ToggleRight, Users } from "lucide-react";
import type { Shortcut, ShortcutScope, ShortcutType } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { useListDepartments } from "@/pages/admin/departments/hooks/use-departments";
import { useArchiveShortcut, useCreateShortcut, useListShortcuts, useSetShortcutActive, useUpdateShortcut } from "./hooks/use-shortcuts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ShortcutEditModal } from "./components/ShortcutEditModal";
import { ShortcutFormFields, scopeLabels, typeLabels, type ShortcutFormValues } from "./components/ShortcutFormFields";

const blank: ShortcutFormValues = { title: "", message: "", type: "GENERAL", scope: "GLOBAL", departmentId: "", isActive: true, sortOrder: 0 };
type ConfirmAction = "inline-create" | "modal-create" | "edit" | null;

function formPayload(form: ShortcutFormValues, canPublish: boolean) {
  return { ...form, departmentId: form.scope === "DEPARTMENT" ? form.departmentId : null, isActive: canPublish ? form.isActive : true };
}

function isInvalid(form: ShortcutFormValues) {
  return form.title.trim().length < 2 || !form.message.trim() || (form.scope === "DEPARTMENT" && !form.departmentId);
}

export default function ShortcutsAdmin() {
  const { user, can } = useAuth();
  const { data: departments = [] } = useListDepartments();
  const [filters, setFilters] = useState({ q: "", type: "ALL" as ShortcutType | "ALL", scope: "ALL" as ShortcutScope | "ALL", active: "ALL" as "ALL" | "true" | "false" });
  const { data, isLoading, isError, error, refetch } = useListShortcuts(filters);
  const create = useCreateShortcut();
  const update = useUpdateShortcut();
  const publish = useSetShortcutActive();
  const archive = useArchiveShortcut();
  const canPublish = can("shortcuts", "publish");
  const canDelete = can("shortcuts", "delete");

  const [createForm, setCreateForm] = useState<ShortcutFormValues>({ ...blank, scope: user?.role === "AGENT" ? "PERSONAL" : "GLOBAL" });
  const [editing, setEditing] = useState<Shortcut | null>(null);
  const [editForm, setEditForm] = useState<ShortcutFormValues>(blank);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Shortcut | null>(null);
  const [publishTarget, setPublishTarget] = useState<Shortcut | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const visibleScopes = useMemo(() => user?.role === "AGENT" ? ["PERSONAL" as const] : ["GLOBAL", "DEPARTMENT", "PERSONAL"] as const, [user?.role]);
  const systemGreeting = useMemo(() => data?.items.find((item) => item.type === "GREETING" && item.scope === "GLOBAL"), [data?.items]);
  const systemClosing = useMemo(() => data?.items.find((item) => item.type === "CLOSING" && item.scope === "GLOBAL" && !item.title.toLowerCase().includes("interação") && !item.title.toLowerCase().includes("inativid")), [data?.items]);
  const systemInactivityClosing = useMemo(() => data?.items.find((item) => item.type === "CLOSING" && item.scope === "GLOBAL" && (item.title.toLowerCase().includes("interação") || item.title.toLowerCase().includes("inativid"))), [data?.items]);

  const resetCreate = () => {
    create.reset();
    setCreateForm({ ...blank, scope: user?.role === "AGENT" ? "PERSONAL" : "GLOBAL" });
  };

  const openEdit = (item: Shortcut) => {
    update.reset();
    setEditing(item);
    setEditForm({ title: item.title, message: item.message, type: item.type, scope: item.scope, departmentId: item.departmentId || "", isActive: item.isActive, sortOrder: item.sortOrder });
    setEditOpen(true);
  };

  const openSystemCreate = (form: ShortcutFormValues) => {
    create.reset();
    setEditing(null);
    setEditForm(form);
    setEditOpen(true);
  };

  const closeEdit = (open: boolean) => {
    if (open || update.isPending || create.isPending) return;
    setEditOpen(false);
    setEditing(null);
    setEditForm(blank);
    update.reset();
    create.reset();
  };

  const insertVariable = (setter: Dispatch<SetStateAction<ShortcutFormValues>>, variable: string) => {
    setter((previous) => ({ ...previous, message: previous.message + (previous.message && !previous.message.endsWith(" ") ? " " : "") + variable }));
  };

  const saveInlineCreate = async () => {
    await create.mutateAsync({ data: formPayload(createForm, canPublish) });
    setConfirmAction(null);
    resetCreate();
  };

  const saveModalCreate = async () => {
    await create.mutateAsync({ data: formPayload(editForm, canPublish) });
    setConfirmAction(null);
    setEditOpen(false);
    setEditForm(blank);
    create.reset();
  };

  const saveEdit = async () => {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, data: formPayload(editForm, canPublish) });
    setConfirmAction(null);
    setEditOpen(false);
    setEditing(null);
    setEditForm(blank);
  };

  const cancelConfirmation = (open: boolean) => {
    if (open) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action === "edit" || action === "modal-create") setEditOpen(true);
  };

  const setupSystemGreeting = () => {
    if (systemGreeting) return openEdit(systemGreeting);
    openSystemCreate({ ...blank, title: "Saudação ao Assumir Chamado", message: "Olá, {contactName}! Meu nome é {agentName}, sou da equipe {departmentName} e assumi o seu atendimento. Como posso te ajudar hoje?", type: "GREETING", scope: "GLOBAL", sortOrder: 0 });
  };

  const setupSystemClosing = () => {
    if (systemClosing) return openEdit(systemClosing);
    openSystemCreate({ ...blank, title: "Encerramento Normal", message: "Olá, {contactName}! O seu chamado foi encerrado por {agentName}. Caso precise de novo suporte, estamos à disposição. Obrigado pelo contato!", type: "CLOSING", scope: "GLOBAL", sortOrder: 0 });
  };

  const setupSystemInactivityClosing = () => {
    if (systemInactivityClosing) return openEdit(systemInactivityClosing);
    openSystemCreate({ ...blank, title: "Encerramento por Falta de Interação", message: "Olá, {contactName}! Seu atendimento está sendo encerrado por falta de interação/resposta. Caso ainda precise de ajuda, envie uma nova mensagem para iniciar um novo atendimento. Obrigado!", type: "CLOSING", scope: "GLOBAL", sortOrder: 1 });
  };

  const modalError = editing ? update.error?.message : create.error?.message;
  const modalPending = editing ? update.isPending : create.isPending;

  return (
    <div className="content shortcuts-admin">
      <PageHeader eyebrow="Administração / atendimento" title="Atalhos e procedimentos" description="Centralize mensagens rápidas globais, por departamento e pessoais para uso nos chats." action={can("shortcuts", "create") ? <Button variant="default" size="lg" onClick={resetCreate}><Plus data-icon="inline-start" /> Novo atalho</Button> : undefined} />
      <Card className="system-messages-banner mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles data-icon="inline-start" className="text-sky-500" /> Mensagens de Sistema (Assumir e Encerrar Chamado)</CardTitle>
          <CardDescription>Configure as mensagens automáticas ou pré-definidas enviadas ao assumir ou encerrar chamados. Use variáveis como {"{agentName}"}, {"{contactName}"} e {"{departmentName}"}.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SystemMessageCard label="Saudação ao Assumir" color="text-sky-500" item={systemGreeting} fallback="Olá, {contactName}! Meu nome é {agentName}, sou da equipe {departmentName} e assumi o seu atendimento. Como posso te ajudar hoje?" action={setupSystemGreeting} actionLabel={systemGreeting ? "Editar saudação" : "Configurar saudação"} />
          <SystemMessageCard label="Encerramento Normal" color="text-emerald-500" item={systemClosing} fallback="Olá, {contactName}! O seu chamado foi encerrado por {agentName}. Caso precise de novo suporte, estamos à disposição. Obrigado pelo contato!" action={setupSystemClosing} actionLabel={systemClosing ? "Editar encerramento" : "Configurar encerramento"} />
          <SystemMessageCard label="Falta de Interação" color="text-amber-500" item={systemInactivityClosing} fallback="Olá, {contactName}! Seu atendimento está sendo encerrado por falta de interação/resposta. Caso ainda precise de ajuda, envie uma nova mensagem. Obrigado!" action={setupSystemInactivityClosing} actionLabel={systemInactivityClosing ? "Editar inatividade" : "Configurar inatividade"} />
        </CardContent>
      </Card>

      <Card className="shortcut-filter-card">
        <CardContent className="shortcut-filter-grid">
          <div className="shortcut-search"><Search data-icon="inline-start" /><Input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Buscar por título ou mensagem" /></div>
          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value as ShortcutType | "ALL" })}><SelectTrigger className="w-full"><SelectValue>{filters.type === "ALL" ? "Todos os tipos" : typeLabels[filters.type]}</SelectValue></SelectTrigger><SelectContent side="bottom"><SelectGroup><SelectItem value="ALL">Todos os tipos</SelectItem>{Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent></Select>
          <Select value={filters.scope} onValueChange={(value) => setFilters({ ...filters, scope: value as ShortcutScope | "ALL" })}><SelectTrigger className="w-full"><SelectValue>{filters.scope === "ALL" ? "Todos os escopos" : scopeLabels[filters.scope]}</SelectValue></SelectTrigger><SelectContent side="bottom"><SelectGroup><SelectItem value="ALL">Todos os escopos</SelectItem>{Object.entries(scopeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent></Select>
          <Select value={filters.active} onValueChange={(value) => setFilters({ ...filters, active: value as "ALL" | "true" | "false" })}><SelectTrigger className="w-full"><SelectValue>{filters.active === "ALL" ? "Todos os status" : filters.active === "true" ? "Ativos" : "Inativos"}</SelectValue></SelectTrigger><SelectContent side="bottom"><SelectGroup><SelectItem value="ALL">Todos os status</SelectItem><SelectItem value="true">Ativos</SelectItem><SelectItem value="false">Inativos</SelectItem></SelectGroup></SelectContent></Select>
        </CardContent>
      </Card>

      <div className="shortcuts-layout">
        <section className="shortcut-list-column">
          <div className="shortcut-list-heading"><div><h2>Biblioteca de mensagens</h2><p>{data?.total || 0} atalhos visíveis para você</p></div></div>
          {isLoading ? <Card><CardContent className="loading"><div className="skeleton short" /><div className="skeleton" /></CardContent></Card> : isError ? (
            <Card><CardContent className="error-state"><p>{error?.message || "Não foi possível carregar os atalhos."}</p><Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button></CardContent></Card>
          ) : data?.items.length === 0 ? (
            <Card><CardContent className="shortcut-empty"><Sparkles data-icon="inline-start" /><strong>Nenhum atalho encontrado</strong><span>Crie uma mensagem ou ajuste os filtros.</span></CardContent></Card>
          ) : data?.items.map((item) => (
            <Card key={item.id} className={!item.isActive ? "shortcut-card is-inactive" : "shortcut-card"}>
              <CardHeader>
                <div className="shortcut-card-heading"><span className="shortcut-card-icon">{item.scope === "PERSONAL" ? <Users /> : <BookOpenText />}</span><div><CardTitle>{item.title}</CardTitle><CardDescription>{item.department?.name || item.owner?.name || scopeLabels[item.scope]}</CardDescription></div></div>
                <CardAction><Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Ativo" : "Inativo"}</Badge></CardAction>
              </CardHeader>
              <CardContent>
                <p className="shortcut-message-preview">{item.message}</p>
                <div className="shortcut-card-meta"><Badge variant="outline">{typeLabels[item.type]}</Badge><span>{item.usageCount} usos</span><span>Atualizado em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}</span></div>
                <div className="shortcut-card-actions">
                  {can("shortcuts", "update") && <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil data-icon="inline-start" /> Editar</Button>}
                  {canPublish && <Button variant="outline" size="sm" onClick={() => setPublishTarget(item)}>{item.isActive ? <ToggleLeft data-icon="inline-start" /> : <ToggleRight data-icon="inline-start" />}{item.isActive ? "Desativar" : "Ativar"}</Button>}
                  {canDelete && <Button variant="ghost" size="sm" className="shortcut-delete" onClick={() => setDeleteTarget(item)}><Archive data-icon="inline-start" /> Arquivar</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="shortcut-form-card">
          <CardHeader><CardTitle>Novo atalho</CardTitle><CardDescription>A mensagem será inserida no chat sem envio automático.</CardDescription></CardHeader>
          <CardContent className="form-stack">
            <ShortcutFormFields form={createForm} onChange={(patch) => setCreateForm((old) => ({ ...old, ...patch }))} departments={departments} visibleScopes={visibleScopes} onInsertVariable={(variable) => insertVariable(setCreateForm, variable)} />
            {(create.error && !confirmAction) ? <Alert variant="destructive" aria-live="polite"><AlertDescription>{create.error.message}</AlertDescription></Alert> : null}
            <div className="form-actions"><Button variant="outline" size="sm" onClick={resetCreate}>Limpar</Button><Button variant="default" size="lg" disabled={isInvalid(createForm) || create.isPending || !can("shortcuts", "create")} onClick={() => setConfirmAction("inline-create")}>{create.isPending ? "Salvando..." : "Criar atalho"}</Button></div>
          </CardContent>
        </Card>
      </div>

      <ShortcutEditModal open={editOpen} target={editing} isCreating={!editing} form={editForm} departments={departments} visibleScopes={visibleScopes} onChange={(patch) => setEditForm((old) => ({ ...old, ...patch }))} onInsertVariable={(variable) => insertVariable(setEditForm, variable)} onOpenChange={closeEdit} onRequestSave={() => { setEditOpen(false); setConfirmAction(editing ? "edit" : "modal-create"); }} pending={modalPending} error={modalError || null} />

      <ConfirmationDialog open={Boolean(confirmAction)} onOpenChange={cancelConfirmation} tone="warning" title={confirmAction === "edit" ? "Salvar alterações do atalho?" : confirmAction === "modal-create" ? "Criar mensagem de sistema?" : "Criar este atalho?"} description="A mensagem ficará disponível conforme o tipo e o escopo selecionados." confirmLabel={confirmAction === "edit" ? "Salvar alterações" : confirmAction === "modal-create" ? "Criar mensagem" : "Criar atalho"} details={<span><strong>{confirmAction === "inline-create" ? createForm.title : editForm.title}</strong> · {typeLabels[confirmAction === "inline-create" ? createForm.type : editForm.type]} · {scopeLabels[confirmAction === "inline-create" ? createForm.scope : editForm.scope]}</span>} onConfirm={confirmAction === "edit" ? saveEdit : confirmAction === "modal-create" ? saveModalCreate : saveInlineCreate} />
      <ConfirmationDialog open={Boolean(publishTarget)} onOpenChange={(open) => !open && setPublishTarget(null)} tone="warning" title={publishTarget?.isActive ? "Desativar este atalho?" : "Ativar este atalho?"} description="A disponibilidade da mensagem nos chats será alterada imediatamente." confirmLabel={publishTarget?.isActive ? "Desativar atalho" : "Ativar atalho"} details={<strong>{publishTarget?.title}</strong>} onConfirm={async () => { if (!publishTarget) return; await publish.mutateAsync({ id: publishTarget.id, isActive: !publishTarget.isActive }); setPublishTarget(null); }} />
      <ConfirmationDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} tone="danger" title="Arquivar este atalho?" description="Ele deixará de aparecer nos chats, mas o histórico de auditoria será preservado." confirmLabel="Arquivar atalho" details={<strong>{deleteTarget?.title}</strong>} onConfirm={async () => { if (!deleteTarget) return; await archive.mutateAsync({ id: deleteTarget.id }); setDeleteTarget(null); }} />
    </div>
  );
}

interface SystemMessageCardProps {
  label: string;
  color: string;
  item?: Shortcut;
  fallback: string;
  action: () => void;
  actionLabel: string;
}

function SystemMessageCard({ label, color, item, fallback, action, actionLabel }: SystemMessageCardProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-3">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2"><strong className={"text-xs font-bold uppercase tracking-wider " + color}>{label}</strong><Badge variant={item?.isActive ? "default" : "outline"}>{item ? (item.isActive ? "Ativo" : "Inativo") : "Não criado"}</Badge></div>
        <p className="line-clamp-3 text-xs italic text-muted-foreground">"{item?.message || fallback}"</p>
      </div>
      <Button variant="outline" size="sm" onClick={action}><Pencil data-icon="inline-start" /> {actionLabel}</Button>
    </div>
  );
}
