import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronRight,
  StopCircle,
  GitBranch,
  GripVertical,
  LogIn,
  MessageSquareText,
  Route,
  Send,
} from "lucide-react";
import type { FlowNode, FlowValidationIssue } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const nodeMeta = {
  ENTRY: { label: "Entrada", icon: LogIn },
  MESSAGE: { label: "Mensagem", icon: MessageSquareText },
  DECISION: { label: "Decisão", icon: GitBranch },
  ROUTE: { label: "Rota", icon: Route },
  TRIAGE: { label: "Triagem", icon: Bot },
  HANDOFF: { label: "Encaminhamento", icon: Send },
  END: { label: "Finalização", icon: StopCircle },
} as const;

interface FlowNodeCardProps {
  node: FlowNode;
  selected?: boolean;
  overlay?: boolean;
  isDragging?: boolean;
  isCollapsed?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  issues?: FlowValidationIssue[];
  departmentName?: string;
  onSelect?: () => void;
  onMove?: (direction: -1 | 1) => void;
  onToggleCollapse?: () => void;
}

export function FlowNodeCard({
  node,
  selected,
  overlay,
  isDragging,
  isCollapsed,
  canMoveUp,
  canMoveDown,
  dragAttributes,
  dragListeners,
  issues = [],
  departmentName,
  onSelect,
  onMove,
  onToggleCollapse,
}: FlowNodeCardProps) {
  const meta = nodeMeta[node.type];
  const Icon = meta.icon;
  const canDrag = Boolean(dragListeners);
  return (
    <Card
      size="sm"
      role={overlay ? undefined : "option"}
      aria-selected={selected}
      tabIndex={overlay ? -1 : 0}
      data-selected={selected || undefined}
      data-invalid={issues.length > 0 || undefined}
      className={cn("flow-builder-node", overlay && "flow-builder-node-overlay", isDragging && "flow-builder-node-dragging")}
      onClick={onSelect}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      <CardHeader>
        <div className="flow-node-heading">
          <span className="flow-node-icon" aria-hidden="true"><Icon /></span>
          <div className="flow-node-copy">
            <CardTitle>{node.name || "Etapa sem nome"}</CardTitle>
            <CardDescription>{meta.label}</CardDescription>
          </div>
        </div>
        {!overlay ? (
          <CardAction className="flow-node-controls" onClick={(event) => event.stopPropagation()}>
            {onToggleCollapse ? (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? `Expandir sub-etapas de ${node.name}` : `Recolher sub-etapas de ${node.name}`}
                title={isCollapsed ? "Expandir sub-etapas" : "Recolher sub-etapas"}
              >
                {isCollapsed ? <ChevronRight /> : <ChevronDown />}
              </Button>
            ) : null}
            {onMove ? <>
              <Button variant="ghost" size="icon-xs" disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label={`Mover ${node.name} para cima`}><ArrowUp /></Button>
              <Button variant="ghost" size="icon-xs" disabled={!canMoveDown} onClick={() => onMove(1)} aria-label={`Mover ${node.name} para baixo`}><ArrowDown /></Button>
            </> : null}
            {canDrag ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="flow-drag-handle"
                aria-label={`Arrastar ${node.name}`}
                {...dragAttributes}
                {...dragListeners}
              >
                <GripVertical />
              </Button>
            ) : null}
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="flow-node-preview">{node.content || (node.type === "ENTRY" ? "Início do fluxo" : node.type === "ROUTE" ? "Início do ramo" : "Sem mensagem configurada")}</p>
      </CardContent>
      <CardFooter className="flow-node-footer">
        {departmentName ? <Badge variant="secondary">{departmentName}</Badge> : <Badge variant="outline">{meta.label}</Badge>}
        {issues.length ? <Badge variant="destructive">{issues.length} pendência(s)</Badge> : null}
      </CardFooter>
    </Card>
  );
}
