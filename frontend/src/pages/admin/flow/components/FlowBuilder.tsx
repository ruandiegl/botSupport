import type { Department, FlowNode, FlowNodeType, FlowRevision, FlowValidationIssue } from "@/types";
import { FlowMap } from "./FlowMap";
import { WhatsAppFlowPreview } from "./WhatsAppFlowPreview";

interface FlowBuilderProps {
  revision: FlowRevision;
  selectedNode: FlowNode;
  departments: Department[];
  issues: FlowValidationIssue[];
  onEdit: (id: string) => void;
  onReorder: (containerId: string, activeId: string, overId: string) => void;
  onMove: (nodeId: string, direction: -1 | 1) => void;
  onAddRoute: () => void;
  onAddStep: (type: FlowNodeType, parentRouteId?: string) => void;
}

export function FlowBuilder({
  revision,
  selectedNode,
  departments,
  issues,
  onEdit,
  onReorder,
  onMove,
  onAddRoute,
  onAddStep,
}: FlowBuilderProps) {
  const departmentName = (id: string | null) => departments.find((department) => department.id === id)?.name;

  return (
    <div className="flow-builder-workspace">
      <FlowMap
        revision={revision}
        selectedNodeId={selectedNode.id}
        issues={issues}
        departmentName={departmentName}
        onSelect={onEdit}
        onReorder={onReorder}
        onMove={onMove}
        onAddRoute={onAddRoute}
        onAddStep={onAddStep}
      />
      <aside className="flow-builder-sidebar">
        <WhatsAppFlowPreview revision={revision} />
      </aside>
    </div>
  );
}
