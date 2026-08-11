import { useMemo, useState } from "react";
import { Archive, BookOpenText, Pencil, Plus, Search, Sparkles, ToggleLeft, ToggleRight, Users } from "lucide-react";
import type { Shortcut, ShortcutScope, ShortcutType } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { useListDepartments } from "@/pages/admin/departments/hooks/use-departments";
import { useArchiveShortcut, useCreateShortcut, useListShortcuts, useSetShortcutActive, useUpdateShortcut } from "./hooks/use-shortcuts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const typeLabels: Record<ShortcutType, string> = { GREETING: "Saudação", CLOSING: "Encerramento", DEPARTMENT: "Departamento", PERSONAL: "Pessoal", GENERAL: "Geral" };
const scopeLabels: Record<ShortcutScope, string> = { GLOBAL: "Global", DEPARTMENT: "Departamento", PERSONAL: "Pessoal" };
const blank = { title: "", message: "", type: "GENERAL" as ShortcutType, scope: "GLOBAL" as ShortcutScope, departmentId: "", isActive: true, sortOrder: 0 };

export default function ShortcutsAdmin() {
  const { user, can } = useAuth();
  const { data: departments = [] } = useListDepartments();
  const [filters, setFilters] = useState({ q: "", type: "ALL" as ShortcutType | "ALL", scope: "ALL" as ShortcutScope | "ALL", active: "ALL" as "ALL" | "true" | "false" });
  const { data, isLoading, isError, error, refetch } = useListShortcuts(filters);
  const create = useCreateShortcut();
  const update = useUpdateShortcut();
  const publish = useSetShortcutActive();
  const archive = useArchiveShortcut();
  const [selected, setSelected] = useState<Shortcut | null>(null);
  const [form, setForm] = useState({ ...blank, scope: user?.role === "AGENT" ? "PERSONAL" as ShortcutScope : "GLOBAL" as ShortcutScope });
  const [deleteTarget, setDeleteTarget] = useState<Shortcut | null>(null);
  const [publishTarget, setPublishTarget] = useState<Shortcut | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const canPublish = can("shortcuts", "publish");
  const canDelete = can("shortcuts", "delete");

  const visibleScopes = useMemo(() => user?.role === "AGENT" ? ["PERSONAL" as const] : ["GLOBAL", "DEPARTMENT", "PERSONAL"] as const, [user?.role]);
  const reset = () => { setSelected(null); setForm({ ...blank, scope: user?.role === "AGENT" ? "PERSONAL" : "GLOBAL" }); };
  const edit = (item: Shortcut) => {
    setSelected(item);
    setForm({ title: item.title, message: item.message, type: item.type, scope: item.scope, departmentId: item.departmentId || "", isActive: item.isActive, sortOrder: item.sortOrder });
  };
  const save = async () => {
    const payload = { ...form, departmentId: form.scope === "DEPARTMENT" ? form.departmentId : null, isActive: canPublish ? form.isActive : true };
    if (selected) await update.mutateAsync({ id: selected.id, data: payload });
    else await create.mutateAsync({ data: payload });
    reset();
  };
  const invalid = form.title.trim().length < 2 || !form.message.trim() || (form.scope === "DEPARTMENT" && !form.departmentId);

  return (
    <div className="content shortcuts-admin">
      <PageHeader eyebrow="Administração / atendimento" title="Atalhos e procedimentos" description="Centralize mensagens rápidas globais, por departamento e pessoais para uso nos chats." action={
        <Button variant="default" size="lg" onClick={reset}><Plus data-icon="inline-start" /> Novo atalho</Button>
      } />

      <Card className="shortcut-filter-card">
        <CardContent className="shortcut-filter-grid">
          <div className="shortcut-search"><Search size={16} /><Input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Buscar por título ou mensagem" /></div>
          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value as any })}>
            <SelectTrigger className="w-full"><SelectValue>{filters.type === "ALL" ? "Todos os tipos" : typeLabels[filters.type]}</SelectValue></SelectTrigger><SelectContent side="bottom"><SelectItem value="ALL">Todos os tipos</SelectItem>{Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.scope} onValueChange={(value) => setFilters({ ...filters, scope: value as any })}>
            <SelectTrigger className="w-full"><SelectValue>{filters.scope === "ALL" ? "Todos os escopos" : scopeLabels[filters.scope]}</SelectValue></SelectTrigger><SelectContent side="bottom"><SelectItem value="ALL">Todos os escopos</SelectItem>{Object.entries(scopeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.active} onValueChange={(value) => setFilters({ ...filters, active: value as any })}>
            <SelectTrigger className="w-full"><SelectValue>{filters.active === "ALL" ? "Todos os status" : filters.active === "true" ? "Ativos" : "Inativos"}</SelectValue></SelectTrigger><SelectContent side="bottom"><SelectItem value="ALL">Todos os status</SelectItem><SelectItem value="true">Ativos</SelectItem><SelectItem value="false">Inativos</SelectItem></SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="shortcuts-layout">
        <section className="shortcut-list-column">
          <div className="shortcut-list-heading"><div><h2>Biblioteca de mensagens</h2><p>{data?.total || 0} atalhos visíveis para você</p></div></div>
          {isLoading ? <Card><CardContent className="loading"><div className="skeleton short" /><div className="skeleton" /></CardContent></Card> : isError ? (
            <Card><CardContent className="error-state"><p>{error?.message || "Não foi possível carregar os atalhos."}</p><Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button></CardContent></Card>
          ) : data?.items.length === 0 ? (
            <Card><CardContent className="shortcut-empty"><Sparkles size={26} /><strong>Nenhum atalho encontrado</strong><span>Crie uma mensagem ou ajuste os filtros.</span></CardContent></Card>
          ) : data?.items.map((item) => (
            <Card key={item.id} className={`shortcut-card ${!item.isActive ? "is-inactive" : ""}`}>
              <CardHeader>
                <div className="shortcut-card-heading"><span className="shortcut-card-icon">{item.scope === "PERSONAL" ? <Users size={16} /> : <BookOpenText size={16} />}</span><div><CardTitle>{item.title}</CardTitle><CardDescription>{item.department?.name || item.owner?.name || scopeLabels[item.scope]}</CardDescription></div></div>
                <CardAction><Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Ativo" : "Inativo"}</Badge></CardAction>
              </CardHeader>
              <CardContent>
                <p className="shortcut-message-preview">{item.message}</p>
                <div className="shortcut-card-meta"><Badge variant="outline">{typeLabels[item.type]}</Badge><span>{item.usageCount} usos</span><span>Atualizado em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}</span></div>
                <div className="shortcut-card-actions">
                  {can("shortcuts", "update") && <Button variant="outline" size="sm" onClick={() => edit(item)}><Pencil data-icon="inline-start" /> Editar</Button>}
                  {canPublish && <Button variant="outline" size="sm" onClick={() => setPublishTarget(item)}>{item.isActive ? <ToggleLeft data-icon="inline-start" /> : <ToggleRight data-icon="inline-start" />}{item.isActive ? "Desativar" : "Ativar"}</Button>}
                  {canDelete && <Button variant="ghost" size="sm" className="shortcut-delete" onClick={() => setDeleteTarget(item)}><Archive data-icon="inline-start" /> Arquivar</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="shortcut-form-card">
          <CardHeader><CardTitle>{selected ? "Editar atalho" : "Novo atalho"}</CardTitle><CardDescription>A mensagem será inserida no chat sem envio automático.</CardDescription></CardHeader>
          <CardContent className="form-stack">
            <div className="field"><label htmlFor="shortcut-title">Título</label><Input id="shortcut-title" maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Saudação para primeiro contato" /></div>
            <div className="field"><label htmlFor="shortcut-message">Mensagem</label><Textarea id="shortcut-message" maxLength={4000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Digite a mensagem que ficará disponível no chat" className="min-h-36" /><span className="field-hint">{form.message.length}/4000 caracteres</span></div>
            <div className="shortcut-form-row">
              <div className="field"><label>Tipo</label><Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as ShortcutType })}><SelectTrigger className="w-full"><SelectValue>{typeLabels[form.type]}</SelectValue></SelectTrigger><SelectContent side="bottom">{Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
              <div className="field"><label>Escopo</label><Select value={form.scope} onValueChange={(value) => setForm({ ...form, scope: value as ShortcutScope, departmentId: value === "DEPARTMENT" ? form.departmentId : "" })}><SelectTrigger className="w-full"><SelectValue>{scopeLabels[form.scope]}</SelectValue></SelectTrigger><SelectContent side="bottom">{visibleScopes.map((value) => <SelectItem key={value} value={value}>{scopeLabels[value]}</SelectItem>)}</SelectContent></Select></div>
            </div>
            {form.scope === "DEPARTMENT" && <div className="field"><label>Departamento</label><Select value={form.departmentId || null} onValueChange={(value) => setForm({ ...form, departmentId: value || "" })}><SelectTrigger className="w-full"><SelectValue placeholder="Selecione o departamento">{departments.find((department) => department.id === form.departmentId)?.name}</SelectValue></SelectTrigger><SelectContent side="bottom">{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectContent></Select></div>}
            <div className="field"><label htmlFor="shortcut-order">Ordem de exibição</label><Input id="shortcut-order" type="number" min={0} max={9999} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} /></div>
            {(create.error || update.error) && <p className="form-error">{(create.error || update.error)?.message}</p>}
            <div className="form-actions"><Button variant="outline" size="sm" onClick={reset}>Limpar</Button><Button variant="default" size="lg" disabled={invalid || create.isPending || update.isPending} onClick={() => setSaveConfirmOpen(true)}>{create.isPending || update.isPending ? "Salvando..." : selected ? "Salvar alterações" : "Criar atalho"}</Button></div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        tone="warning"
        title={selected ? "Salvar alterações do atalho?" : "Criar este atalho?"}
        description="A mensagem ficará disponível conforme o tipo e o escopo selecionados."
        confirmLabel={selected ? "Salvar alterações" : "Criar atalho"}
        details={<span><strong>{form.title}</strong> · {typeLabels[form.type]} · {scopeLabels[form.scope]}</span>}
        onConfirm={save}
        testId="button-confirm-save-shortcut"
      />
      <ConfirmationDialog
        open={Boolean(publishTarget)}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        tone="warning"
        title={publishTarget?.isActive ? "Desativar este atalho?" : "Ativar este atalho?"}
        description="A disponibilidade da mensagem nos chats será alterada imediatamente."
        confirmLabel={publishTarget?.isActive ? "Desativar atalho" : "Ativar atalho"}
        details={<strong>{publishTarget?.title}</strong>}
        onConfirm={async () => {
          if (!publishTarget) return;
          await publish.mutateAsync({ id: publishTarget.id, isActive: !publishTarget.isActive });
          setPublishTarget(null);
        }}
        testId="button-confirm-publish-shortcut"
      />
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tone="danger"
        title="Arquivar este atalho?"
        description="Ele deixará de aparecer nos chats, mas o histórico de auditoria será preservado."
        confirmLabel="Arquivar atalho"
        details={<strong>{deleteTarget?.title}</strong>}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await archive.mutateAsync({ id: deleteTarget.id });
          setDeleteTarget(null);
        }}
        testId="button-confirm-archive-shortcut"
      />
    </div>
  );
}
