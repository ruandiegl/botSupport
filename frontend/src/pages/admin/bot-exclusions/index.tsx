import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Pencil, Plus, Power, Search, ShieldOff, Trash2, XCircle } from "lucide-react";
import type { BotExclusion } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBotExclusions, useCreateBotExclusion, useRemoveBotExclusion, useUpdateBotExclusion } from "./hooks/use-bot-exclusions";
import { BotExclusionEditModal } from "./components/BotExclusionEditModal";
import { BotExclusionFormFields, formatPhoneInput, type BotExclusionFormValues } from "./components/BotExclusionFormFields";

const emptyForm: BotExclusionFormValues = { phone: "", label: "", reason: "" };

function displayPhone(phone: string) {
  if (phone.length === 13) return "+" + phone.slice(0, 2) + " (" + phone.slice(2, 4) + ") " + phone.slice(4, 9) + "-" + phone.slice(9);
  return "+" + phone;
}

export default function BotExclusionsAdmin() {
  const { can } = useAuth();
  const [scope, setScope] = useState<"ACTIVE" | "ALL">("ACTIVE");
  const { data, isLoading, isError, refetch } = useBotExclusions(scope === "ACTIVE");
  const create = useCreateBotExclusion();
  const update = useUpdateBotExclusion();
  const remove = useRemoveBotExclusion();
  const [query, setQuery] = useState("");
  const [createForm, setCreateForm] = useState<BotExclusionFormValues>(emptyForm);
  const [editing, setEditing] = useState<BotExclusion | null>(null);
  const [editForm, setEditForm] = useState<BotExclusionFormValues>(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BotExclusion | null>(null);
  const [confirmAction, setConfirmAction] = useState<"create" | "edit" | null>(null);

  const visible = useMemo(
    () => (data?.items || []).filter((item) => (item.phone + " " + (item.label || "") + " " + (item.reason || "")).toLowerCase().includes(query.toLowerCase())),
    [data?.items, query],
  );
  const createInvalid = createForm.phone.replace(/\D/g, "").length < 7;
  const saving = create.isPending || update.isPending;

  const resetCreate = () => {
    create.reset();
    setCreateForm(emptyForm);
  };

  const startEdit = (item: BotExclusion) => {
    update.reset();
    setEditing(item);
    setEditForm({ phone: formatPhoneInput(item.phone), label: item.label || "", reason: item.reason || "" });
    setEditOpen(true);
  };

  const closeEdit = (open: boolean) => {
    if (open || update.isPending) return;
    setEditOpen(false);
    setEditing(null);
    setEditForm(emptyForm);
    update.reset();
  };

  const saveCreate = async () => {
    await create.mutateAsync({ phone: createForm.phone, label: createForm.label.trim() || null, reason: createForm.reason.trim() || null });
    setConfirmAction(null);
    resetCreate();
  };

  const saveEdit = async () => {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, data: { phone: editForm.phone, label: editForm.label.trim() || null, reason: editForm.reason.trim() || null } });
    setConfirmAction(null);
    setEditOpen(false);
    setEditing(null);
    setEditForm(emptyForm);
  };

  const cancelConfirmation = (open: boolean) => {
    if (open) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action === "edit") setEditOpen(true);
  };

  return (
    <div className="content">
      <PageHeader eyebrow="Administração / automação" title="Contatos ignorados pelo bot" description="Impeça respostas automáticas para números que também são bots ou não devem iniciar atendimentos." action={can("bot_exclusions", "create") ? <Button onClick={resetCreate}><Plus data-icon="inline-start" /> Novo bloqueio</Button> : undefined} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldOff data-icon="inline-start" /> Lista de bloqueios</CardTitle>
            <CardDescription>{data?.total || 0} números cadastrados · o histórico de mensagens continua preservado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-background px-3">
                <Search data-icon="inline-start" className="text-muted-foreground" />
                <Input aria-label="Buscar número bloqueado" className="border-0 shadow-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por número, nome ou motivo" />
              </div>
              <Select value={scope} onValueChange={(value) => setScope((value as "ACTIVE" | "ALL") || "ACTIVE")}>
                <SelectTrigger className="w-full sm:w-36" aria-label="Filtro de status"><SelectValue>{scope === "ACTIVE" ? "Ativos" : "Todos"}</SelectValue></SelectTrigger>
                <SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup><SelectItem value="ACTIVE">Ativos</SelectItem><SelectItem value="ALL">Todos</SelectItem></SelectGroup></SelectContent>
              </Select>
            </div>

            {isLoading ? <p className="text-sm text-muted-foreground">Carregando bloqueios...</p> : isError ? (
              <Alert variant="destructive"><AlertDescription className="flex items-center justify-between gap-3"><span>Não foi possível carregar a lista.</span><Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button></AlertDescription></Alert>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center"><Ban className="mb-3 size-8 text-muted-foreground" /><p className="font-medium">Nenhum número bloqueado</p><p className="mt-1 text-sm text-muted-foreground">Adicione um contato para interromper as respostas automáticas.</p></div>
            ) : (
              <div className="grid gap-2">
                {visible.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{item.label || displayPhone(item.phone)}</span><Badge variant={item.isActive ? "secondary" : "outline"}>{item.isActive ? <><CheckCircle2 data-icon="inline-start" /> Ativo</> : <><XCircle data-icon="inline-start" /> Desativado</>}</Badge></div>
                      <p className="mt-1 text-sm text-muted-foreground">{displayPhone(item.phone)}</p>
                      {item.reason ? <p className="mt-1 truncate text-xs text-muted-foreground">{item.reason}</p> : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => startEdit(item)} disabled={!can("bot_exclusions", "update")} title="Editar bloqueio"><Pencil /></Button>
                      {!item.isActive ? <Button variant="ghost" size="icon-sm" onClick={() => update.mutate({ id: item.id, data: { isActive: true } })} disabled={!can("bot_exclusions", "update") || update.isPending} title="Reativar bloqueio"><Power /></Button> : <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(item)} disabled={!can("bot_exclusions", "delete")} title="Desativar bloqueio" className="text-destructive"><Trash2 /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Novo bloqueio</CardTitle><CardDescription>O contato continuará visível no histórico, mas o bot não enviará mensagens automáticas.</CardDescription></CardHeader>
          <CardContent>
            <BotExclusionFormFields form={createForm} onChange={(patch) => setCreateForm((old) => ({ ...old, ...patch }))} />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={resetCreate}>Limpar</Button>
              <Button disabled={createInvalid || saving || !can("bot_exclusions", "create")} onClick={() => setConfirmAction("create")}>{create.isPending ? "Salvando..." : "Adicionar número"}</Button>
            </div>
            {create.error ? <Alert variant="destructive" className="mt-4" aria-live="polite"><AlertDescription>{create.error.message}</AlertDescription></Alert> : null}
          </CardContent>
        </Card>
      </div>

      <BotExclusionEditModal open={editOpen} target={editing} form={editForm} onChange={(patch) => setEditForm((old) => ({ ...old, ...patch }))} onOpenChange={closeEdit} onRequestSave={() => { setEditOpen(false); setConfirmAction("edit"); }} pending={update.isPending} error={update.error?.message || null} />

      <ConfirmationDialog open={Boolean(confirmAction)} onOpenChange={cancelConfirmation} tone="warning" title={confirmAction === "edit" ? "Salvar alteração?" : "Adicionar número à lista?"} description="O bot deixará de responder automaticamente a este número. O envio manual do atendente continuará funcionando." confirmLabel={confirmAction === "edit" ? "Salvar alteração" : "Adicionar número"} details={<span className="font-medium">{confirmAction === "edit" ? editForm.phone : createForm.phone}</span>} onConfirm={confirmAction === "edit" ? saveEdit : saveCreate} />

      <ConfirmationDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} tone="danger" title="Desativar bloqueio?" description="Este contato poderá voltar a receber respostas automáticas. O registro será mantido para auditoria." confirmLabel="Desativar bloqueio" details={deleteTarget ? <span className="font-medium">{displayPhone(deleteTarget.phone)}</span> : null} onConfirm={async () => { if (deleteTarget) await remove.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} />
    </div>
  );
}
