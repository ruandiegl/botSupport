import { Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { ConversationLabelBadge } from "@/components/ui/ConversationLabelBadge";
import { useLabels } from "@/hooks/use-labels";

export function LabelFilter({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const { data, isLoading } = useLabels();
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="select justify-between" />}>
        <Tags /> {value.length ? `${value.length} etiqueta${value.length > 1 ? "s" : ""}` : "Todas as etiquetas"}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 bg-popover">
        <PopoverTitle>Filtrar por etiquetas</PopoverTitle>
        <PopoverDescription>Exibe conversas que tenham uma das etiquetas selecionadas.</PopoverDescription>
        <div className="mt-3 grid max-h-64 gap-1 overflow-y-auto">
          {isLoading ? <span className="text-sm text-muted-foreground">Carregando...</span> : data?.items.map((label) => (
            <label key={label.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
              <Checkbox checked={value.includes(label.id)} onCheckedChange={() => toggle(label.id)} />
              <ConversationLabelBadge label={label} />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
