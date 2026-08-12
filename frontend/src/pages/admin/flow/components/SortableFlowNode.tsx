import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FlowNode, FlowValidationIssue } from "@/types";
import { FlowNodeCard } from "./FlowNodeCard";

interface SortableFlowNodeProps {
  node: FlowNode;
  containerId: string;
  selected: boolean;
  disabled?: boolean;
  isCollapsed?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  issues?: FlowValidationIssue[];
  departmentName?: string;
  onSelect: () => void;
  onMove: (direction: -1 | 1) => void;
  onToggleCollapse?: () => void;
}

export function SortableFlowNode({
  node,
  containerId,
  selected,
  disabled,
  isCollapsed,
  canMoveUp,
  canMoveDown,
  issues,
  departmentName,
  onSelect,
  onMove,
  onToggleCollapse,
}: SortableFlowNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled,
    data: { containerId, node },
  });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flow-sortable-slot">
      {isDragging ? <div className="flow-node-placeholder" aria-hidden="true"><span>Soltar etapa aqui</span></div> : (
        <FlowNodeCard
          node={node}
          selected={selected}
          isCollapsed={isCollapsed}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          dragAttributes={disabled ? undefined : attributes}
          dragListeners={disabled ? undefined : listeners}
          issues={issues}
          departmentName={departmentName}
          onSelect={onSelect}
          onMove={disabled ? undefined : onMove}
          onToggleCollapse={onToggleCollapse}
        />
      )}
    </div>
  );
}

