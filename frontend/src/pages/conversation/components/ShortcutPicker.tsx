import { useDeferredValue, useState } from "react";
import { Search, Sparkles, Zap } from "lucide-react";
import type { Shortcut, ShortcutType } from "@/types";
import { useAvailableShortcuts } from "../hooks/use-shortcuts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const typeLabels: Record<ShortcutType, string> = {
  GREETING: "Saudação", CLOSING: "Encerramento", DEPARTMENT: "Departamento", PERSONAL: "Pessoal", GENERAL: "Geral",
};

export function ShortcutPicker({ conversationId, onSelect }: { conversationId: string; onSelect: (shortcut: Shortcut) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ShortcutType | "ALL">("ALL");
  const deferredSearch = useDeferredValue(search.trim());
  const { data = [], isLoading } = useAvailableShortcuts(conversationId, deferredSearch, type, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Sparkles data-icon="inline-start" /> Atalhos
      </DialogTrigger>
      <DialogContent className="shortcut-picker-dialog sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Atalhos e procedimentos</DialogTitle>
          <DialogDescription>Escolha uma mensagem para inserir no campo. Você poderá editá-la antes de enviar.</DialogDescription>
        </DialogHeader>
        <div className="shortcut-picker-filters">
          <div className="shortcut-search">
            <Search size={16} />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título ou mensagem" autoFocus />
          </div>
          <Select value={type} onValueChange={(value) => setType(value as ShortcutType | "ALL")}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue>{type === "ALL" ? "Todos os tipos" : typeLabels[type]}</SelectValue></SelectTrigger>
            <SelectContent side="bottom" align="end">
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              {Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="shortcut-picker-list">
          {isLoading ? <p className="subtle">Carregando atalhos...</p> : data.length === 0 ? (
            <div className="shortcut-empty"><Sparkles size={22} /><strong>Nenhum atalho encontrado</strong><span>Ajuste os filtros ou cadastre uma nova mensagem.</span></div>
          ) : data.map((shortcut) => (
            <button key={shortcut.id} type="button" className="shortcut-picker-item" onClick={() => { onSelect(shortcut); setOpen(false); }}>
              <span className="shortcut-picker-icon"><Zap size={15} /></span>
              <span className="shortcut-picker-copy"><strong>{shortcut.title}</strong><span>{shortcut.message}</span></span>
              <Badge variant="secondary">{typeLabels[shortcut.type]}</Badge>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
