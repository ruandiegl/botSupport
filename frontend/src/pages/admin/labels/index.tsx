import { useState } from "react";
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import type { ConversationLabel } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { useLabels } from "@/hooks/use-labels";
import { useCreateLabel, useDeleteLabel, useUpdateLabel } from "./hooks/use-labels-admin";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ConversationLabelBadge } from "@/components/ui/ConversationLabelBadge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const empty = { name: "", slug: "", color: "#2D89C8", icon: "" };

export default function LabelsAdmin() {
  const { can } = useAuth();
  const { data, isLoading, isError, refetch } = useLabels();
  const create = useCreateLabel();
  const update = useUpdateLabel();
  const remove = useDeleteLabel();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ConversationLabel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationLabel | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const reset = () => { setSelected(null); setForm(empty); };
  const edit = (label: ConversationLabel) => { setSelected(label); setForm({ name: label.name, slug: label.slug, color: label.color, icon: label.icon || "" }); };
  const save = async () => {
    const payload = { ...form, name: form.name.trim(), slug: form.slug.trim().toUpperCase(), icon: form.icon.trim() || null };
    if (selected) await update.mutateAsync({ id: selected.id, data: payload }); else await create.mutateAsync(payload);
    reset();
  };
  const visible = (data?.items || []).filter((label) => `${label.name} ${label.slug}`.toLowerCase().includes(q.toLowerCase()));
  const invalid = form.name.trim().length < 2 || !/^[A-Z0-9_]{2,40}$/.test(form.slug.trim().toUpperCase()) || !/^#[0-9A-Fa-f]{6}$/.test(form.color);

  return <div className="content">
    <PageHeader eyebrow="Administração / organização" title="Etiquetas de chamados" description="Crie etiquetas visuais para organizar, localizar e priorizar conversas." action={can("labels", "create") ? <Button onClick={reset}><Plus /> Nova etiqueta</Button> : undefined} />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="size-4" /> Etiquetas disponíveis</CardTitle><CardDescription>{data?.total || 0} etiquetas cadastradas</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 rounded-lg border bg-background px-3"><Search className="size-4 text-muted-foreground" /><Input className="border-0 shadow-none" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar etiqueta" /></div>
          {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : isError ? <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button> : <div className="grid gap-2">
            {visible.map((label) => <div key={label.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
              <div className="min-w-0"><ConversationLabelBadge label={label} /><p className="mt-1 text-xs text-muted-foreground">{label.slug} · {label.usageCount || 0} conversas{label.isSystem ? " · sistema" : ""}</p></div>
              {!label.isSystem && <div className="flex gap-1"><Button variant="ghost" size="icon-sm" onClick={() => edit(label)} disabled={!can("labels", "update")} title="Editar etiqueta"><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(label)} disabled={!can("labels", "delete")} title="Excluir etiqueta" className="text-destructive"><Trash2 /></Button></div>}
            </div>)}
          </div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{selected ? "Editar etiqueta" : "Nova etiqueta"}</CardTitle><CardDescription>Use nomes curtos e cores com bom contraste.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <Field><FieldLabel htmlFor="label-name">Nome</FieldLabel><Input id="label-name" value={form.name} onChange={(event) => setForm((old) => ({ ...old, name: event.target.value }))} placeholder="Ex.: Financeiro" /></Field>
          <Field><FieldLabel htmlFor="label-slug">Identificador</FieldLabel><Input id="label-slug" value={form.slug} onChange={(event) => setForm((old) => ({ ...old, slug: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} placeholder="FINANCEIRO" /></Field>
          <Field><FieldLabel htmlFor="label-color">Cor</FieldLabel><div className="flex gap-2"><Input id="label-color" type="color" className="w-14 p-1" value={form.color} onChange={(event) => setForm((old) => ({ ...old, color: event.target.value }))} /><Input value={form.color} onChange={(event) => setForm((old) => ({ ...old, color: event.target.value }))} /></div></Field>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={reset}>Limpar</Button><Button disabled={invalid || create.isPending || update.isPending || (selected ? !can("labels", "update") : !can("labels", "create"))} onClick={() => setSaveConfirmOpen(true)}>Salvar etiqueta</Button></div>
        </FieldGroup></CardContent>
      </Card>
    </div>
    <ConfirmationDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen} tone="warning" title={selected ? "Salvar alteração?" : "Criar etiqueta?"} description="A etiqueta ficará disponível nos filtros e nas conversas." confirmLabel="Confirmar" onConfirm={save} />
    <ConfirmationDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} tone="danger" title="Excluir etiqueta?" description="A etiqueta será removida de todas as conversas. Esta ação não exclui chamados." confirmLabel="Excluir etiqueta" details={deleteTarget ? <ConversationLabelBadge label={deleteTarget} /> : null} onConfirm={async () => { if (deleteTarget) await remove.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} />
  </div>;
}
