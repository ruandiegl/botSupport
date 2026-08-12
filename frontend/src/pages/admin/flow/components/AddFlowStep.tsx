import { useState } from "react";
import { Plus } from "lucide-react";
import type { FlowNodeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const branchTypes: Array<{ value: FlowNodeType; label: string }> = [
  { value: "MESSAGE", label: "Mensagem" },
  { value: "TRIAGE", label: "Triagem (aguarda resposta)" },
  { value: "HANDOFF", label: "Encaminhamento para fila" },
  { value: "END", label: "Finalização" },
];

export function AddFlowStep({
  mode,
  onAdd,
}: {
  mode: "main" | "branch";
  onAdd: (type: FlowNodeType) => void;
}) {
  const options = mode === "main" ? branchTypes.filter((item) => item.value === "MESSAGE") : branchTypes;
  const [type, setType] = useState<FlowNodeType>(options[0].value);
  return (
    <div className="flow-add-step">
      <Select value={type} onValueChange={(value) => value && setType(value as FlowNodeType)}>
        <SelectTrigger aria-label="Tipo da nova etapa"><SelectValue /></SelectTrigger>
        <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
          <SelectGroup>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={() => onAdd(type)}><Plus data-icon="inline-start" />Adicionar</Button>
    </div>
  );
}
