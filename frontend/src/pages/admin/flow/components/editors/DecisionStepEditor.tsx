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
import { ArrowDown, ArrowUp, FolderTree, GripVertical, List, Plus, Trash2 } from "lucide-react";
import type { FlowDecisionGroup, FlowDecisionOption } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  createDecisionGroup,
  createDecisionOption,
  getDecisionGroups,
  getDecisionOptions,
  MAX_DECISION_GROUPS,
  MAX_ROUTE_DECISION_OPTIONS,
} from "../../lib/flow-model";
import { MessageField, NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

function SortableDecisionOption({ option, index, total, onUpdate, onMove, onRemove }: {
  option: FlowDecisionOption;
  index: number;
  total: number;
  onUpdate: (option: FlowDecisionOption) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.optionKey });
  return (
    <Field ref={setNodeRef} className="flow-decision-option" data-dragging={isDragging || undefined} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div className="flow-decision-option-header">
        <strong>Opção {index + 1}</strong>
        <div className="flow-decision-option-actions">
          <Button variant="ghost" size="icon-sm" className="flow-drag-handle" aria-label={`Arrastar opção ${index + 1}`} {...attributes} {...listeners}><GripVertical /></Button>
          <Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Mover opção para cima" onClick={() => onMove(-1)}><ArrowUp /></Button>
          <Button variant="ghost" size="icon-sm" disabled={index === total - 1} aria-label="Mover opção para baixo" onClick={() => onMove(1)}><ArrowDown /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Excluir opção" onClick={onRemove}><Trash2 /></Button>
        </div>
      </div>
      <FieldLabel htmlFor={`flow-option-label-${option.optionKey}`}>Texto do botão</FieldLabel>
      <Input id={`flow-option-label-${option.optionKey}`} value={option.label} maxLength={80} placeholder="Ex.: Acesso e senha" onChange={(event) => onUpdate({ ...option, label: event.target.value })} />
      <FieldLabel htmlFor={`flow-option-description-${option.optionKey}`}>Descrição opcional</FieldLabel>
      <Input id={`flow-option-description-${option.optionKey}`} value={option.description ?? ""} maxLength={120} placeholder="Ajude o contato a entender esta escolha" onChange={(event) => onUpdate({ ...option, description: event.target.value })} />
    </Field>
  );
}

function CategoryItemEditor({ item, index, total, onUpdate, onMove, onRemove }: {
  item: FlowDecisionOption;
  index: number;
  total: number;
  onUpdate: (item: FlowDecisionOption) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <Field className="flow-category-item">
      <div className="flow-decision-option-header">
        <strong>Item {index + 1}</strong>
        <div className="flow-decision-option-actions">
          <Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Mover item para cima" onClick={() => onMove(-1)}><ArrowUp /></Button>
          <Button variant="ghost" size="icon-sm" disabled={index === total - 1} aria-label="Mover item para baixo" onClick={() => onMove(1)}><ArrowDown /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Excluir item" onClick={onRemove}><Trash2 /></Button>
        </div>
      </div>
      <FieldLabel htmlFor={`flow-category-item-label-${item.optionKey}`}>Nome do item</FieldLabel>
      <Input id={`flow-category-item-label-${item.optionKey}`} value={item.label} maxLength={80} placeholder="Ex.: Player" onChange={(event) => onUpdate({ ...item, label: event.target.value })} />
      <FieldLabel htmlFor={`flow-category-item-description-${item.optionKey}`}>Descrição opcional</FieldLabel>
      <Input id={`flow-category-item-description-${item.optionKey}`} value={item.description ?? ""} maxLength={120} placeholder="Ex.: Player do AR" onChange={(event) => onUpdate({ ...item, description: event.target.value })} />
    </Field>
  );
}

function CategoryEditor({ group, index, total, onUpdate, onMove, onRemove }: {
  group: FlowDecisionGroup;
  index: number;
  total: number;
  onUpdate: (group: FlowDecisionGroup) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const updateItem = (itemIndex: number, item: FlowDecisionOption) => onUpdate({ ...group, items: group.items.map((current, indexValue) => indexValue === itemIndex ? item : current) });
  const moveItem = (itemIndex: number, direction: -1 | 1) => {
    const target = itemIndex + direction;
    if (target < 0 || target >= group.items.length) return;
    onUpdate({ ...group, items: arrayMove(group.items, itemIndex, target) });
  };

  return (
    <Card size="sm" className="flow-category-card">
      <CardHeader>
        <div className="flex min-w-0 items-center gap-2">
          <FolderTree />
          <div className="min-w-0"><CardTitle>Categoria {index + 1}</CardTitle><CardDescription>{group.items.length} item(ns) disponível(is)</CardDescription></div>
        </div>
        <div className="flow-decision-option-actions">
          <Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Mover categoria para cima" onClick={() => onMove(-1)}><ArrowUp /></Button>
          <Button variant="ghost" size="icon-sm" disabled={index === total - 1} aria-label="Mover categoria para baixo" onClick={() => onMove(1)}><ArrowDown /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Excluir categoria" onClick={onRemove}><Trash2 /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`flow-category-label-${group.categoryKey}`}>Nome da categoria</FieldLabel>
            <Input id={`flow-category-label-${group.categoryKey}`} value={group.label} maxLength={80} placeholder="Ex.: InfoAudio" onChange={(event) => onUpdate({ ...group, label: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`flow-category-description-${group.categoryKey}`}>Descrição opcional</FieldLabel>
            <Input id={`flow-category-description-${group.categoryKey}`} value={group.description ?? ""} maxLength={120} placeholder="Ex.: Aplicativos de áudio e automação" onChange={(event) => onUpdate({ ...group, description: event.target.value })} />
          </Field>
          <FieldSet>
            <FieldLegend>Itens desta categoria</FieldLegend>
            <FieldDescription>O cliente verá somente estes itens depois de escolher {group.label || "a categoria"}.</FieldDescription>
            <div className="flow-category-items">
              {group.items.map((item, itemIndex) => (
                <CategoryItemEditor key={item.optionKey} item={item} index={itemIndex} total={group.items.length} onUpdate={(next) => updateItem(itemIndex, next)} onMove={(direction) => moveItem(itemIndex, direction)} onRemove={() => onUpdate({ ...group, items: group.items.filter((current) => current.optionKey !== item.optionKey) })} />
              ))}
            </div>
          </FieldSet>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" disabled={group.items.length >= MAX_ROUTE_DECISION_OPTIONS} onClick={() => onUpdate({ ...group, items: [...group.items, createDecisionOption("Novo item")] })}><Plus data-icon="inline-start" />Adicionar item</Button>
      </CardFooter>
    </Card>
  );
}

export function DecisionStepEditor({ node, issues, onChange }: StepEditorProps) {
  const routeDecision = Boolean(node.config.parentRouteId);
  const mode = node.config.decisionMode === "CATEGORIES" ? "CATEGORIES" : "FLAT";
  const options = getDecisionOptions({ ...node, config: { ...node.config, decisionMode: "FLAT" } });
  const groups = getDecisionGroups(node);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const updateOptions = (next: FlowDecisionOption[]) => onChange({ ...node, config: { ...node.config, decisionScope: "ROUTE", decisionMode: "FLAT", decisionOptions: next } });
  const updateGroups = (next: FlowDecisionGroup[]) => onChange({ ...node, config: { ...node.config, decisionScope: "CATEGORY", decisionMode: "CATEGORIES", decisionGroups: next } });
  const changeMode = (value: string) => {
    if (value === "CATEGORIES") {
      const nextGroups = groups.length ? groups : [{ ...createDecisionGroup("Geral"), items: options.length ? options : [createDecisionOption("Novo item")] }];
      updateGroups(nextGroups);
      return;
    }
    const storedOptions = Array.isArray(node.config.decisionOptions) ? node.config.decisionOptions : [];
    const nextOptions = storedOptions.length ? storedOptions : groups.flatMap((group) => group.items);
    updateOptions(nextOptions.length ? nextOptions : [createDecisionOption()]);
  };
  const updateAt = (index: number, option: FlowDecisionOption) => updateOptions(options.map((item, current) => current === index ? option : item));
  const moveAt = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target >= 0 && target < options.length) updateOptions(arrayMove(options, index, target));
  };
  const finishDrag = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = options.findIndex((option) => option.optionKey === active.id);
    const to = options.findIndex((option) => option.optionKey === over.id);
    if (from >= 0 && to >= 0) updateOptions(arrayMove(options, from, to));
  };
  const updateGroupAt = (index: number, group: FlowDecisionGroup) => updateGroups(groups.map((item, current) => current === index ? group : item));
  const moveGroupAt = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target >= 0 && target < groups.length) updateGroups(arrayMove(groups, index, target));
  };

  return (
    <FieldGroup>
      <FieldDescription>{routeDecision ? "Envie uma lista simples ou organize os assuntos em categorias e itens. A escolha fica registrada antes de o fluxo seguir." : "As rotas abaixo serão exibidas como opções desta decisão principal."}</FieldDescription>
      <NameField node={node} error={issueFor(issues, "name")} onChange={onChange} />
      <MessageField node={node} label="Pergunta ou instrução" error={issueFor(issues, "content")} onChange={onChange} />
      {routeDecision ? (
        <>
          <FieldSet>
            <FieldLegend>Organização das escolhas</FieldLegend>
            <RadioGroup value={mode} onValueChange={changeMode} className="flow-decision-mode">
              <FieldLabel className="flow-decision-mode-option" htmlFor={`decision-mode-flat-${node.id}`}><RadioGroupItem id={`decision-mode-flat-${node.id}`} value="FLAT" /><span><List />Lista simples<small>Mostra todos os botões em uma única etapa.</small></span></FieldLabel>
              <FieldLabel className="flow-decision-mode-option" htmlFor={`decision-mode-categories-${node.id}`}><RadioGroupItem id={`decision-mode-categories-${node.id}`} value="CATEGORIES" /><span><FolderTree />Categorias e itens<small>O cliente escolhe uma categoria e depois o problema.</small></span></FieldLabel>
            </RadioGroup>
          </FieldSet>

          {mode === "FLAT" ? (
            <FieldSet>
              <FieldLegend>Botões desta rota</FieldLegend>
              <FieldDescription>Arraste pelo puxador ou use as setas. Alterar a ordem não muda a identidade do botão.</FieldDescription>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={finishDrag}>
                <SortableContext items={options.map((option) => option.optionKey)} strategy={verticalListSortingStrategy}>
                  <div className="flow-decision-options">{options.map((option, index) => <SortableDecisionOption key={option.optionKey} option={option} index={index} total={options.length} onUpdate={(next) => updateAt(index, next)} onMove={(direction) => moveAt(index, direction)} onRemove={() => updateOptions(options.filter((item) => item.optionKey !== option.optionKey))} />)}</div>
                </SortableContext>
              </DndContext>
              {issueFor(issues, "decisionOptions") ? <FieldError>{issueFor(issues, "decisionOptions")}</FieldError> : null}
              <Button variant="outline" size="sm" disabled={options.length >= MAX_ROUTE_DECISION_OPTIONS} onClick={() => updateOptions([...options, createDecisionOption()])}><Plus data-icon="inline-start" />Adicionar botão</Button>
            </FieldSet>
          ) : (
            <FieldSet>
              <div className="flex items-center justify-between gap-3"><div><FieldLegend>Categorias e itens</FieldLegend><FieldDescription>Organize os aplicativos em grupos curtos e fáceis de reconhecer.</FieldDescription></div><Badge variant="secondary">{groups.length} categoria(s)</Badge></div>
              <div className="flow-decision-groups">{groups.map((group, index) => <CategoryEditor key={group.categoryKey} group={group} index={index} total={groups.length} onUpdate={(next) => updateGroupAt(index, next)} onMove={(direction) => moveGroupAt(index, direction)} onRemove={() => updateGroups(groups.filter((item) => item.categoryKey !== group.categoryKey))} />)}</div>
              {issueFor(issues, "decisionGroups") ? <FieldError>{issueFor(issues, "decisionGroups")}</FieldError> : null}
              <Button variant="outline" size="sm" disabled={groups.length >= MAX_DECISION_GROUPS} onClick={() => updateGroups([...groups, createDecisionGroup()])}><Plus data-icon="inline-start" />Adicionar categoria</Button>
            </FieldSet>
          )}
        </>
      ) : null}
    </FieldGroup>
  );
}
