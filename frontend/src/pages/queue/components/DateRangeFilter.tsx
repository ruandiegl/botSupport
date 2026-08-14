import { useMemo, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

export type DatePreset = "ALL" | "TODAY" | "24H" | "7D" | "30D" | "CUSTOM";
export type DateField = "lastActivityAt" | "createdAt";

export interface DateRangeValue {
  preset: DatePreset;
  dateField: DateField;
  from: string;
  to: string;
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

const presetLabels: Record<DatePreset, string> = {
  ALL: "Qualquer período",
  TODAY: "Hoje",
  "24H": "Últimas 24h",
  "7D": "Últimos 7 dias",
  "30D": "Últimos 30 dias",
  CUSTOM: "Personalizado",
};

const dateFieldLabels: Record<DateField, string> = {
  lastActivityAt: "Última atividade",
  createdAt: "Data de criação",
};

function asLocalDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfLocalDayExclusive(date: Date) {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + 1);
  return next;
}

function capToNow(date: Date) {
  const now = new Date();
  return date.getTime() > now.getTime() ? now : date;
}

function toIsoRange(preset: DatePreset, fromInput: string, toInput: string) {
  if (preset === "ALL") return { from: "", to: "" };
  if (preset === "24H") {
    const now = new Date();
    return { from: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), to: now.toISOString() };
  }
  if (preset === "CUSTOM") {
    if (!fromInput) return { from: "", to: "" };
    const from = startOfLocalDay(new Date(`${fromInput}T00:00:00`));
    const to = capToNow(endOfLocalDayExclusive(new Date(`${(toInput || fromInput)}T00:00:00`)));
    return { from: from.toISOString(), to: to.toISOString() };
  }
  const now = new Date();
  const from = startOfLocalDay(now);
  if (preset === "TODAY") return { from: from.toISOString(), to: capToNow(endOfLocalDayExclusive(now)).toISOString() };
  const days = preset === "7D" ? 7 : 30;
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString(), to: capToNow(endOfLocalDayExclusive(now)).toISOString() };
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draftField, setDraftField] = useState<DateField>(value.dateField);
  const [draftFrom, setDraftFrom] = useState(value.from ? asLocalDateInput(new Date(value.from)) : "");
  const [draftTo, setDraftTo] = useState(value.to ? asLocalDateInput(new Date(new Date(value.to).getTime() - 1)) : "");

  const label = useMemo(() => {
    if (customOpen) return presetLabels.CUSTOM;
    if (value.preset !== "CUSTOM") return presetLabels[value.preset];
    if (!value.from) return presetLabels.CUSTOM;
    const from = asLocalDateInput(new Date(value.from));
    const to = value.to ? asLocalDateInput(new Date(new Date(value.to).getTime() - 1)) : from;
    return from === to ? from : `${from} – ${to}`;
  }, [customOpen, value]);

  const resetDraft = () => {
    setDraftField(value.dateField);
    setDraftFrom(value.from ? asLocalDateInput(new Date(value.from)) : "");
    setDraftTo(value.to ? asLocalDateInput(new Date(new Date(value.to).getTime() - 1)) : "");
  };

  const handlePresetChange = (next: string | null) => {
    const preset = (next as DatePreset) ?? "ALL";
    if (preset === "CUSTOM") {
      resetDraft();
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    onChange({ preset, dateField: value.dateField, ...toIsoRange(preset, "", "") });
  };

  const applyCustom = () => {
    onChange({ preset: "CUSTOM", dateField: draftField, ...toIsoRange("CUSTOM", draftFrom, draftTo) });
    setCustomOpen(false);
  };

  const cancelCustom = () => {
    setCustomOpen(false);
    resetDraft();
  };

  const showingCustom = customOpen || value.preset === "CUSTOM";
  const selectValue = customOpen ? "CUSTOM" : value.preset;

  return (
    <div className="date-range-filter">
      <Select value={selectValue} onValueChange={handlePresetChange}>
        <SelectTrigger className="select date-range-trigger" data-testid="select-date-filter" aria-label="Período">
          <CalendarDays data-icon="inline-start" />
          <SelectValue>{label}</SelectValue>
        </SelectTrigger>
        <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
          <SelectGroup>
            {(Object.keys(presetLabels) as DatePreset[]).map((preset) => (
              <SelectItem key={preset} value={preset}>{presetLabels[preset]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {showingCustom ? (
        <Popover open={customOpen} onOpenChange={(next) => { if (next) resetDraft(); setCustomOpen(next); }}>
          <PopoverTrigger render={<Button variant="outline" size="default" className="date-range-custom-trigger" />}>
            {value.from ? "Editar datas" : "Definir datas"}
          </PopoverTrigger>
          <PopoverContent align="start" className="date-range-popover">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <PopoverTitle>Período personalizado</PopoverTitle>
                <PopoverDescription>Escolha o intervalo e o campo usado na busca.</PopoverDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
                  De
                  <Input type="date" value={draftFrom} max={asLocalDateInput(new Date())} onChange={(event) => setDraftFrom(event.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
                  Até
                  <Input type="date" value={draftTo} min={draftFrom || undefined} max={asLocalDateInput(new Date())} onChange={(event) => setDraftTo(event.target.value)} />
                </label>
              </div>
              <Select value={draftField} onValueChange={(next) => setDraftField((next as DateField) ?? "lastActivityAt")}>
                <SelectTrigger className="w-full" aria-label="Campo de data">
                  <SelectValue>{dateFieldLabels[draftField]}</SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                  <SelectGroup>
                    <SelectItem value="lastActivityAt">Última atividade</SelectItem>
                    <SelectItem value="createdAt">Data de criação</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={cancelCustom}>Cancelar</Button>
                <Button size="sm" onClick={applyCustom}><Check data-icon="inline-start" /> Aplicar</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
