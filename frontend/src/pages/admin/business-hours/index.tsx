import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, Save, Trash2, Power, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useListDepartments } from "@/pages/admin/departments/hooks/use-departments";
import { useBusinessHours, useCreateBusinessHours, useDisableBusinessHours, useUpdateBusinessHours, type BusinessHoursException, type BusinessHoursInterval, type BusinessHoursPayload, type BusinessHoursPolicy } from "./hooks/use-business-hours";

const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const defaultMessage = "Olá, {{nome}}! Nosso atendimento está fechado no momento. Retornaremos {{proximaAbertura}}.";
const defaultDraft = (): Draft => ({
  id: undefined, departmentId: null, enabled: false, mode: "SCHEDULE_AND_ONLINE", timezone: "America/Sao_Paulo",
  outsideMessage: defaultMessage, noAgentMessage: "No momento não há atendentes online. Retornaremos assim que possível.",
  noticeFrequency: "ONCE_PER_WINDOW", messageCooldownMinutes: 60, revision: undefined,
  intervals: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, start: "08:00", end: "18:00" })),
  exceptions: [],
});
type Draft = Omit<BusinessHoursPayload, "revision"> & { id?: string; revision?: number };

function fromPolicy(policy: BusinessHoursPolicy): Draft {
  return { ...policy, intervals: policy.intervals.map(({ id: _id, ...item }) => item), exceptions: policy.exceptions.map(({ id: _id, ...item }) => item) };
}

export default function BusinessHoursAdmin() {
  const { data: policies = [], isLoading, isError, refetch } = useBusinessHours();
  const { data: departments = [] } = useListDepartments();
  const create = useCreateBusinessHours();
  const update = useUpdateBusinessHours();
  const disable = useDisableBusinessHours();
  const [draft, setDraft] = useState<Draft>(() => defaultDraft());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      const policy = policies.find((item) => item.id === selectedId);
      if (policy) setDraft(fromPolicy(policy));
    } else if (policies.length) {
      setSelectedId(policies[0].id);
      setDraft(fromPolicy(policies[0]));
    }
  }, [policies, selectedId]);

  const scopeLabel = useMemo(() => draft.departmentId ? departments.find((item) => item.id === draft.departmentId)?.name || "Departamento" : "Global", [departments, draft.departmentId]);
  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateInterval = (index: number, key: keyof BusinessHoursInterval, value: string | number) => setDraft((current) => ({ ...current, intervals: current.intervals.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const removeInterval = (index: number) => setDraft((current) => ({ ...current, intervals: current.intervals.filter((_, itemIndex) => itemIndex !== index) }));
  const addInterval = () => setDraft((current) => ({ ...current, intervals: [...current.intervals, { weekday: 1, start: "08:00", end: "18:00" }] }));
  const addException = () => setDraft((current) => ({ ...current, exceptions: [...current.exceptions, { localDate: new Date().toISOString().slice(0, 10), kind: "CLOSED", intervals: [], reason: "" }] }));
  const updateException = (index: number, key: keyof BusinessHoursException, value: any) => setDraft((current) => ({ ...current, exceptions: current.exceptions.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const removeException = (index: number) => setDraft((current) => ({ ...current, exceptions: current.exceptions.filter((_, itemIndex) => itemIndex !== index) }));

  const save = async () => {
    setFeedback(null);
    const payload: BusinessHoursPayload = { departmentId: draft.departmentId, enabled: draft.enabled, mode: draft.mode, timezone: draft.timezone, outsideMessage: draft.outsideMessage, noAgentMessage: draft.noAgentMessage || null, noticeFrequency: draft.noticeFrequency, messageCooldownMinutes: draft.messageCooldownMinutes, intervals: draft.intervals, exceptions: draft.exceptions, revision: draft.revision };
    try {
      if (draft.id) await update.mutateAsync({ id: draft.id, data: payload });
      else await create.mutateAsync(payload);
      setFeedback("Horários salvos. A regra passa a valer para novas mensagens.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar os horários.");
    }
  };

  const selectPolicy = (policy: BusinessHoursPolicy) => { setSelectedId(policy.id); setDraft(fromPolicy(policy)); setFeedback(null); };
  const startNew = () => { setSelectedId(null); setDraft(defaultDraft()); setFeedback(null); };
  const disablePolicy = async () => { if (!draft.id || !draft.revision) return; try { await disable.mutateAsync({ id: draft.id, revision: draft.revision }); setDraft((current) => ({ ...current, enabled: false })); setFeedback("Política desativada."); } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível desativar."); } };

  return (
    <div className="content">
      <PageHeader eyebrow="Administração / atendimento" title="Horários de funcionamento" description="Defina quando o bot deve avisar o cliente que a equipe está fechada ou sem atendentes online." action={<Button onClick={startNew}><Plus size={15} /> Nova política</Button>} />
      {feedback ? <Alert className="mb-4"><AlertDescription>{feedback}</AlertDescription></Alert> : null}
      <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.32fr)_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader><CardTitle>Políticas configuradas</CardTitle><CardDescription>Uma regra específica de departamento tem prioridade sobre a global.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <div className="text-sm text-muted-foreground">Carregando políticas...</div> : isError ? <Button variant="outline" onClick={() => refetch()}><RefreshCw size={14} /> Tentar novamente</Button> : null}
            {!isLoading && !isError && policies.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma política cadastrada.</p> : null}
            {policies.map((policy) => <button key={policy.id} type="button" onClick={() => selectPolicy(policy)} className={"w-full rounded-lg border p-3 text-left transition-colors " + (selectedId === policy.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50")}><div className="flex items-center justify-between gap-2"><span className="font-medium">{policy.departmentId ? departments.find((item) => item.id === policy.departmentId)?.name || "Departamento" : "Global"}</span><span className={"text-xs " + (policy.enabled ? "text-emerald-600" : "text-muted-foreground")}>{policy.enabled ? "Ativa" : "Inativa"}</span></div><span className="text-xs text-muted-foreground">{policy.timezone}</span></button>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><CalendarClock size={18} /> {draft.id ? "Editar política" : "Nova política"}</CardTitle><CardDescription>Escopo atual: {scopeLabel}. A mensagem é enviada no máximo uma vez por janela.</CardDescription></div><Checkbox checked={draft.enabled} onCheckedChange={(checked) => updateDraft("enabled", Boolean(checked))} aria-label="Ativar política" /></div></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="field"><span>Escopo</span><Select value={draft.departmentId || "GLOBAL"} onValueChange={(value) => updateDraft("departmentId", value === "GLOBAL" ? null : value || null)}><SelectTrigger><SelectValue>{scopeLabel}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start"><SelectGroup><SelectItem value="GLOBAL">Global</SelectItem>{departments.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup></SelectContent></Select></label>
              <label className="field"><span>Modo de verificação</span><Select value={draft.mode} onValueChange={(value) => updateDraft("mode", (value || "SCHEDULE_AND_ONLINE") as Draft["mode"])}><SelectTrigger><SelectValue>{draft.mode === "SCHEDULE_ONLY" ? "Somente horário" : draft.mode === "ONLINE_ONLY" ? "Somente atendentes online" : "Horário e atendentes online"}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start"><SelectGroup><SelectItem value="SCHEDULE_AND_ONLINE">Horário e atendentes online</SelectItem><SelectItem value="SCHEDULE_ONLY">Somente horário</SelectItem><SelectItem value="ONLINE_ONLY">Somente atendentes online</SelectItem></SelectGroup></SelectContent></Select></label>
              <label className="field"><span>Fuso horário</span><Input value={draft.timezone} onChange={(event) => updateDraft("timezone", event.target.value)} placeholder="America/Sao_Paulo" /></label>
            </div>

            <section className="space-y-3"><div className="flex items-center justify-between"><div><h3 className="font-medium">Horários semanais</h3><p className="text-sm text-muted-foreground">Você pode cadastrar mais de um intervalo no mesmo dia.</p></div><Button variant="outline" size="sm" onClick={addInterval}><Plus size={14} /> Intervalo</Button></div><div className="space-y-2">{draft.intervals.map((interval, index) => <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_110px_110px_auto]" key={index}><Select value={String(interval.weekday)} onValueChange={(value) => updateInterval(index, "weekday", Number(value))}><SelectTrigger><SelectValue>{weekDays[interval.weekday]}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start"><SelectGroup>{weekDays.map((day, weekday) => <SelectItem key={weekday} value={String(weekday)}>{day}</SelectItem>)}</SelectGroup></SelectContent></Select><TimePicker value={interval.start} onChange={(value) => updateInterval(index, "start", value)} aria-label="Início" /><TimePicker value={interval.end} onChange={(value) => updateInterval(index, "end", value)} aria-label="Fim" /><Button variant="ghost" size="icon-sm" onClick={() => removeInterval(index)} aria-label="Remover intervalo"><Trash2 size={15} /></Button></div>)}</div></section>

            <div className="grid gap-5 md:grid-cols-2"><label className="field"><span>Mensagem fora do horário</span><Textarea rows={5} value={draft.outsideMessage} onChange={(event) => updateDraft("outsideMessage", event.target.value)} placeholder={defaultMessage} /><small className="text-muted-foreground">Variáveis: {"{{nome}}"}, {"{{departamento}}"}, {"{{proximaAbertura}}"}</small></label><label className="field"><span>Mensagem sem atendente online</span><Textarea rows={5} value={draft.noAgentMessage || ""} onChange={(event) => updateDraft("noAgentMessage", event.target.value)} placeholder="Deixe vazio para usar a mensagem fora do horário." /></label></div>

            <section className="space-y-3"><div className="flex items-center justify-between"><div><h3 className="font-medium">Exceções de calendário</h3><p className="text-sm text-muted-foreground">Feche feriados ou informe horários especiais para uma data.</p></div><Button variant="outline" size="sm" onClick={addException}><Plus size={14} /> Exceção</Button></div>{draft.exceptions.map((exception, index) => <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-[150px_1fr_auto]" key={index}><Input type="date" value={exception.localDate} onChange={(event) => updateException(index, "localDate", event.target.value)} /><Select value={exception.kind} onValueChange={(value) => updateException(index, "kind", value)}><SelectTrigger><SelectValue>{exception.kind === "CLOSED" ? "Fechado" : "Horário especial"}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start"><SelectGroup><SelectItem value="CLOSED">Fechado</SelectItem><SelectItem value="SPECIAL_HOURS">Horário especial</SelectItem></SelectGroup></SelectContent></Select><Button variant="ghost" size="icon-sm" onClick={() => removeException(index)} aria-label="Remover exceção"><Trash2 size={15} /></Button><Input className="sm:col-span-2" value={exception.reason || ""} onChange={(event) => updateException(index, "reason", event.target.value)} placeholder="Motivo opcional" /></div>)}</section>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4"><label className="field mr-auto max-w-[220px]"><span>Frequência</span><Select value={draft.noticeFrequency} onValueChange={(value) => updateDraft("noticeFrequency", (value || "ONCE_PER_WINDOW") as Draft["noticeFrequency"])}><SelectTrigger><SelectValue>{draft.noticeFrequency === "COOLDOWN" ? "Com intervalo mínimo" : "Uma vez por janela"}</SelectValue></SelectTrigger><SelectContent side="bottom" align="start"><SelectGroup><SelectItem value="ONCE_PER_WINDOW">Uma vez por janela</SelectItem><SelectItem value="COOLDOWN">Com intervalo mínimo</SelectItem></SelectGroup></SelectContent></Select></label>{draft.noticeFrequency === "COOLDOWN" ? <label className="field max-w-[120px]"><span>Minutos</span><Input type="number" min={5} max={1440} value={draft.messageCooldownMinutes} onChange={(event) => updateDraft("messageCooldownMinutes", Number(event.target.value))} /></label> : null}{draft.id ? <Button variant="outline" onClick={() => disablePolicy()} disabled={disable.isPending}><Power size={14} /> Desativar</Button> : null}<Button onClick={save} disabled={create.isPending || update.isPending}><Save size={14} /> Salvar política</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


