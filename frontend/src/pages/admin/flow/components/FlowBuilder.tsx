import { useEffect, useState } from "react";
import { MessageCircle, Pencil } from "lucide-react";
import type { Department, FlowNode, FlowNodeType, FlowRevision, FlowValidationIssue } from "@/types";
import { Button } from "@/components/ui/button";
import { FlowInspector } from "./FlowInspector";
import { FlowMap } from "./FlowMap";
import { WhatsAppFlowPreview } from "./WhatsAppFlowPreview";

interface FlowBuilderProps {
  revision: FlowRevision;
  selectedNode: FlowNode;
  departments: Department[];
  issues: FlowValidationIssue[];
  onSelect: (id: string) => void;
  onChangeNode: (node: FlowNode) => void;
  onReorder: (containerId: string, activeId: string, overId: string) => void;
  onMove: (nodeId: string, direction: -1 | 1) => void;
  onAddRoute: () => void;
  onAddStep: (type: FlowNodeType, parentRouteId?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function FlowBuilder({
  revision,
  selectedNode,
  departments,
  issues,
  onSelect,
  onChangeNode,
  onReorder,
  onMove,
  onAddRoute,
  onAddStep,
  onDuplicate,
  onDelete,
}: FlowBuilderProps) {
  const [sidebarTab, setSidebarTab] = useState<"inspector" | "preview">("inspector");
  const departmentName = (id: string | null) => departments.find((department) => department.id === id)?.name;
  const selectedIssues = issues.filter((issue) => issue.nodeId === selectedNode.id);

  useEffect(() => {
    setSidebarTab("inspector");
  }, [selectedNode.id]);

  return (
    <div className="flow-builder-workspace">
      <FlowMap
        revision={revision}
        selectedNodeId={selectedNode.id}
        issues={issues}
        departmentName={departmentName}
        onSelect={onSelect}
        onReorder={onReorder}
        onMove={onMove}
        onAddRoute={onAddRoute}
        onAddStep={onAddStep}
      />
      <aside className="flow-builder-sidebar">
        <div className="flow-sidebar-tabs" role="tablist" aria-label="Modo do painel lateral">
          <Button
            variant={sidebarTab === "inspector" ? "default" : "ghost"}
            size="sm"
            role="tab"
            aria-selected={sidebarTab === "inspector"}
            onClick={() => setSidebarTab("inspector")}
            className="flow-sidebar-tab-btn"
          >
            <Pencil size={14} /> Editar etapa
          </Button>
          <Button
            variant={sidebarTab === "preview" ? "default" : "ghost"}
            size="sm"
            role="tab"
            aria-selected={sidebarTab === "preview"}
            onClick={() => setSidebarTab("preview")}
            className="flow-sidebar-tab-btn"
          >
            <MessageCircle size={14} /> Prévia WhatsApp
          </Button>
        </div>

        {sidebarTab === "inspector" ? (
          <FlowInspector
            node={selectedNode}
            departments={departments}
            issues={selectedIssues}
            onChange={onChangeNode}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ) : (
          <WhatsAppFlowPreview revision={revision} />
        )}
      </aside>
    </div>
  );
}

