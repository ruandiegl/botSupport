import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import type { FlowDecisionOption } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createDecisionOption, getDecisionOptions, MAX_ROUTE_DECISION_OPTIONS } from "../../lib/flow-model";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

function SortableDecisionOption({
  option,
  index,
  total,
  onUpdate,
  onMove,
  onRemove,
}: {
  option: FlowDecisionOption;
  index: number;
  total: number;
  onUpdate: (option: FlowDecisionOption) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.optionKey });
  return (
    <Field
      ref={setNodeRef}
      className="flow-decision-option"
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flow-decision-option-header">
        <strong>Opção {index + 1}</strong>
        <div className="flow-decision-option-actions">
          <Button variant="ghost" size="icon-sm" className="flow-drag-handle" aria-label={`Arrastar opção ${index + 1}`} {...attributes} {...listeners}>
            <GripVertical />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Mover opção para cima" onClick={() => onMove(-1)}>
            <ArrowUp />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={index === total - 1} aria-label="Mover opção para baixo" onClick={() => onMove(1)}>
            <ArrowDown />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Excluir opção" onClick={onRemove}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <FieldLabel htmlFor={`flow-option-label-${option.optionKey}`}>Texto do botão</FieldLabel>
      <Input id={`flow-option-label-${option.optionKey}`} value={option.label} maxLength={80} placeholder="Ex.: Acesso e senha" onChange={(event) => onUpdate({ ...option, label: event.target.value })} />
      <FieldLabel htmlFor={`flow-option-description-${option.optionKey}`}>Descrição opcional</FieldLabel>
      <Input id={`flow-option-description-${option.optionKey}`} value={option.description ?? ""} maxLength={120} placeholder="Ajude o contato a entender esta escolha" onChange={(event) => onUpdate({ ...option, description: event.target.value })} />
    </Field>
  );
}

export function DecisionStepEditor({ node, issues, onChange }: StepEditorProps) {
  const routeDecision = Boolean(node.config.parentRouteId);
  const options = getDecisionOptions(node);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const updateOptions = (next: FlowDecisionOption[]) => onChange({
    ...node,
    config: { ...node.config, decisionScope: "ROUTE", decisionOptions: next },
  });
  const updateAt = (index: number, option: FlowDecisionOption) => updateOptions(options.map((item, current) => current === index ? option : item));
  const moveAt = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;
    updateOptions(arrayMove(options, index, target));
  };
  const finishDrag = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = options.findIndex((option) => option.optionKey === active.id);
    const to = options.findIndex((option) => option.optionKey === over.id);
    if (from >= 0 && to >= 0) updateOptions(arrayMove(options, from, to));
  };

  return (
    <FieldGroup>
      <FieldDescription>
        {routeDecision
          ? "Estas opções serão enviadas depois que o contato escolher esta rota. A escolha fica registrada e o fluxo segue para a próxima etapa."
          : "As rotas abaixo serão exibidas como opções desta decisão principal."}
      </FieldDescription>
      <NameField node={node} error={issueFor(issues, "name")} onChange={onChange} />
      <MessageField node={node} label="Pergunta ou instrução" error={issueFor(issues, "content")} onChange={onChange} />
      {routeDecision ? (
        <FieldSet>
          <FieldLegend>Botões desta rota</FieldLegend>
          <FieldDescription>Arraste pelo puxador ou use as setas. Alterar a ordem não muda a identidade do botão.</FieldDescription>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={finishDrag}>
            <SortableContext items={options.map((option) => option.optionKey)} strategy={verticalListSortingStrategy}>
              <div className="flow-decision-options">
                {options.map((option, index) => (
                  <SortableDecisionOption
                    key={option.optionKey}
                    option={option}
                    index={index}
                    total={options.length}
                    onUpdate={(next) => updateAt(index, next)}
                    onMove={(direction) => moveAt(index, direction)}
                    onRemove={() => updateOptions(options.filter((item) => item.optionKey !== option.optionKey))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {issueFor(issues, "decisionOptions") ? <FieldError>{issueFor(issues, "decisionOptions")}</FieldError> : null}
          <Button variant="outline" size="sm" disabled={options.length >= MAX_ROUTE_DECISION_OPTIONS} onClick={() => updateOptions([...options, createDecisionOption()])}>
            <Plus data-icon="inline-start" />Adicionar botão
          </Button>
        </FieldSet>
      ) : null}
    </FieldGroup>
  );
}
