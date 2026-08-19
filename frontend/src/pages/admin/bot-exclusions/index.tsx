import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Pencil, Plus, Power, Search, ShieldOff, Trash2, XCircle } from "lucide-react";
import type { BotExclusion } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBotExclusions, useCreateBotExclusion, useRemoveBotExclusion, useUpdateBotExclusion } from "./hooks/use-bot-exclusions";

const emptyForm = { phone: "", label: "", reason: "" };

function displayPhone(phone: string) {
  if (phone.length === 13) return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  return `+${phone}`;
}

export default function BotExclusionsAdmin() {
  const { can } = useAuth();
  const [scope, setScope] = useState<"ACTIVE" | "ALL">("ACTIVE");
  const { data, isLoading, isError, refetch } = useBotExclusions(scope === "ACTIVE");
  const create = useCreateBotExclusion();
  const update = useUpdateBotExclusion();
  const remove = useRemoveBotExclusion();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BotExclusion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<BotExclusion | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const reset = () => { setEditing(null); setForm(emptyForm); };
  const startEdit = (item: BotExclusion) => { setEditing(item); setForm({ phone: item.phone, label: item.label || "", reason: item.reason || "" }); };
  const visible = useMemo(() => (data?.items || []).filter((item) => `${item.phone} ${item.label || ""} ${item.reason || ""}`.toLowerCase().includes(query.toLowerCase())), [data?.items, query]);
  const invalid = form.phone.replace(/\D/g, "").length < 7;
  const saving = create.isPending || update.isPending;

  const save = async () => {
    const payload = { phone: form.phone, label: form.label.trim() || null, reason: form.reason.trim() || null };
    if (editing) await update.mutateAsync({ id: editing.id, data: payload }); else await create.mutateAsync(payload);
    reset();
  };

  return <div className="content">
    <PageHeader eyebrow="Administração / automação" title="Contatos ignorados pelo bot" description="Impeça respostas automáticas para números que também são bots ou não devem iniciar atendimentos." action={can("bot_exclusions", "create") ? <Button onClick={reset}><Plus /> Novo bloqueio</Button> : undefined} />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldOff className="size-4" /> Lista de bloqueios</CardTitle><CardDescription>{data?.total || 0} números cadastrados · o histórico de mensagens continua preservado</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border bg-background px-3"><Search className="size-4 text-muted-foreground" /><Input aria-label="Buscar número bloqueado" className="border-0 shadow-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por número, nome ou motivo" /></div><Select value={scope} onValueChange={(value) => setScope((value as "ACTIVE" | "ALL") || "ACTIVE")}><SelectTrigger className="w-full sm:w-36" aria-label="Filtro de status"><SelectValue>{scope === "ACTIVE" ? "Ativos" : "Todos"}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start" alignItemWithTrigger={false}><SelectGroup><SelectItem value="ACTIVE">Ativos</SelectItem><SelectItem value="ALL">Todos</SelectItem></SelectGroup></SelectContent></Select></div>
          {isLoading ? <p className="text-sm text-muted-foreground">Carregando bloqueios...</p> : isError ? <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"><span>Não foi possível carregar a lista.</span><Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button></div> : visible.length === 0 ? <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center"><Ban className="mb-3 size-8 text-muted-foreground" /><p className="font-medium">Nenhum número bloqueado</p><p className="mt-1 text-sm text-muted-foreground">Adicione um contato para interromper as respostas automáticas.</p></div> : <div className="grid gap-2">{visible.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{item.label || displayPhone(item.phone)}</span><Badge variant={item.isActive ? "secondary" : "outline"}>{item.isActive ? <><CheckCircle2 className="size-3" /> Ativo</> : <><XCircle className="size-3" /> Desativado</>}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{displayPhone(item.phone)}</p>{item.reason ? <p className="mt-1 truncate text-xs text-muted-foreground">{item.reason}</p> : null}</div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon-sm" onClick={() => startEdit(item)} disabled={!can("bot_exclusions", "update")} title="Editar bloqueio"><Pencil /></Button>{!item.isActive ? <Button variant="ghost" size="icon-sm" onClick={() => update.mutate({ id: item.id, data: { isActive: true } })} disabled={!can("bot_exclusions", "update") || update.isPending} title="Reativar bloqueio"><Power /></Button> : <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(item)} disabled={!can("bot_exclusions", "delete")} title="Desativar bloqueio" className="text-destructive"><Trash2 /></Button>}</div></div>)}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{editing ? "Editar bloqueio" : "Novo bloqueio"}</CardTitle><CardDescription>O contato continuará visível no histórico, mas o bot não enviará mensagens automáticas.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <Field><FieldLabel htmlFor="bot-exclusion-phone">Número do WhatsApp</FieldLabel><Input id="bot-exclusion-phone" inputMode="tel" value={form.phone} onChange={(event) => setForm((old) => ({ ...old, phone: event.target.value }))} placeholder="Ex.: +55 (24) 99999-9999" /><FieldDescription>Use o DDI e o DDD para evitar bloquear o contato errado.</FieldDescription></Field>
          <Field><FieldLabel htmlFor="bot-exclusion-label">Nome ou identificação (opcional)</FieldLabel><Input id="bot-exclusion-label" value={form.label} onChange={(event) => setForm((old) => ({ ...old, label: event.target.value }))} placeholder="Ex.: Bot de testes" /></Field>
          <Field><FieldLabel htmlFor="bot-exclusion-reason">Motivo (opcional)</FieldLabel><Input id="bot-exclusion-reason" value={form.reason} onChange={(event) => setForm((old) => ({ ...old, reason: event.target.value }))} placeholder="Ex.: Evitar conversa automática entre bots" /></Field>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={reset}>Limpar</Button><Button disabled={invalid || saving || (editing ? !can("bot_exclusions", "update") : !can("bot_exclusions", "create"))} onClick={() => setSaveConfirmOpen(true)}>{saving ? "Salvando..." : editing ? "Salvar alteração" : "Adicionar número"}</Button></div>
        </FieldGroup></CardContent>
      </Card>
    </div>
    <ConfirmationDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen} tone="warning" title={editing ? "Salvar alteração?" : "Adicionar número à lista?"} description="O bot deixará de responder automaticamente a este número. O envio manual do atendente continuará funcionando." confirmLabel="Confirmar" onConfirm={save} />
    <ConfirmationDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} tone="danger" title="Desativar bloqueio?" description="Este contato poderá voltar a receber respostas automáticas. O registro será mantido para auditoria." confirmLabel="Desativar bloqueio" details={deleteTarget ? <span className="font-medium">{displayPhone(deleteTarget.phone)}</span> : null} onConfirm={async () => { if (deleteTarget) await remove.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} />
  </div>;
}
