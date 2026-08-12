import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ChevronDown, ChevronsDown, ChevronsUp, Plus } from "lucide-react";
import type { FlowNode, FlowNodeType, FlowRevision, FlowValidationIssue } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddFlowStep } from "./AddFlowStep";
import { FlowNodeCard } from "./FlowNodeCard";
import { SortableFlowNode } from "./SortableFlowNode";
import { getBranchNodes, getMainNodes, getRouteNodes } from "../lib/flow-model";

interface FlowMapProps {
  revision: FlowRevision;
  selectedNodeId: string;
  issues: FlowValidationIssue[];
  departmentName: (id: string | null) => string | undefined;
  onSelect: (id: string) => void;
  onReorder: (containerId: string, activeId: string, overId: string) => void;
  onMove: (nodeId: string, direction: -1 | 1) => void;
  onAddRoute: () => void;
  onAddStep: (type: FlowNodeType, parentRouteId?: string) => void;
}

export function FlowMap({ revision, selectedNodeId, issues, departmentName, onSelect, onReorder, onMove, onAddRoute, onAddStep }: FlowMapProps) {
  const [activeNode, setActiveNode] = useState<FlowNode | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [collapsedRoutes, setCollapsedRoutes] = useState<Record<string, boolean>>({});
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const main = getMainNodes(revision);
  const routes = getRouteNodes(revision);
  const issueMap = useMemo(() => new Map(revision.nodes.map((node) => [node.id, issues.filter((issue) => issue.nodeId === node.id)])), [issues, revision.nodes]);

  useEffect(() => {
    if (!selectedNodeId) return;
    const parentRoute = routes.find((r) => {
      const branch = getBranchNodes(revision, r.id);
      return branch.some((b) => b.id === selectedNodeId);
    });
    if (parentRoute && collapsedRoutes[parentRoute.id]) {
      setCollapsedRoutes((prev) => ({ ...prev, [parentRoute.id]: false }));
    }
  }, [selectedNodeId, revision, routes, collapsedRoutes]);

  const toggleRoute = (routeId: string) => {
    setCollapsedRoutes((prev) => ({ ...prev, [routeId]: !prev[routeId] }));
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    routes.forEach((r) => { next[r.id] = true; });
    setCollapsedRoutes(next);
  };

  const expandAll = () => {
    setCollapsedRoutes({});
  };

  const startDrag = ({ active }: DragStartEvent) => setActiveNode(active.data.current?.node as FlowNode | null);
  const finishDrag = ({ active, over }: DragEndEvent) => {
    setActiveNode(null);
    if (!over || active.id === over.id) return;
    const fromContainer = String(active.data.current?.containerId ?? "");
    const toContainer = String(over.data.current?.containerId ?? "");
    if (!fromContainer || fromContainer !== toContainer) {
      setAnnouncement("A etapa só pode ser movida dentro do próprio ramo.");
      return;
    }
    onReorder(fromContainer, String(active.id), String(over.id));
    setAnnouncement(`${active.data.current?.node?.name ?? "Etapa"} reposicionada.`);
  };

  return (
    <Card className="flow-map-card">
      <CardHeader>
        <CardTitle>Mapa da conversa</CardTitle>
        <CardDescription>Selecione uma etapa para editar. Arraste pelo puxador ou use as setas.</CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={startDrag} onDragEnd={finishDrag} onDragCancel={() => setActiveNode(null)}>
          <div className="flow-map" role="listbox" aria-label="Etapas do fluxo">
            <SortableContext items={main.map((node) => node.id)} strategy={verticalListSortingStrategy}>
              {main.map((node, index) => (
                <div key={node.id} className="flow-sequence-item">
                  <SortableFlowNode
                    node={node}
                    containerId="main"
                    disabled={node.type !== "MESSAGE"}
                    selected={selectedNodeId === node.id}
                    canMoveUp={node.type === "MESSAGE" && index > 1}
                    canMoveDown={node.type === "MESSAGE" && index < main.length - 2}
                    issues={issueMap.get(node.id)}
                    onSelect={() => onSelect(node.id)}
                    onMove={(direction) => onMove(node.id, direction)}
                  />
                  {index < main.length - 1 ? <span className="flow-connector" aria-hidden="true"><ChevronDown /></span> : null}
                </div>
              ))}
            </SortableContext>
            <AddFlowStep mode="main" onAdd={(type) => onAddStep(type)} />

            <div className="flow-route-heading">
              <div><strong>Rotas da decisão</strong><span>Cada ramo possui sua própria sequência editável.</span></div>
              <div className="flow-route-actions">
                {routes.length > 0 ? (
                  <>
                    <Button variant="outline" size="sm" onClick={collapseAll} title="Recolher todas as sub-etapas das rotas">
                      <ChevronsUp data-icon="inline-start" />Recolher todas
                    </Button>
                    <Button variant="outline" size="sm" onClick={expandAll} title="Expandir todas as sub-etapas das rotas">
                      <ChevronsDown data-icon="inline-start" />Expandir todas
                    </Button>
                  </>
                ) : null}
                <Button variant="default" size="sm" onClick={onAddRoute}><Plus data-icon="inline-start" />Nova rota</Button>
              </div>
            </div>

            <SortableContext items={routes.map((route) => route.id)} strategy={verticalListSortingStrategy}>
              <div className="flow-routes">
                {routes.map((route, routeIndex) => {
                  const branch = getBranchNodes(revision, route.id);
                  const isCollapsed = Boolean(collapsedRoutes[route.id]);
                  return (
                    <div className="flow-route-lane" key={route.id} data-collapsed={isCollapsed || undefined}>
                      <SortableFlowNode
                        node={route}
                        containerId="routes"
                        selected={selectedNodeId === route.id}
                        isCollapsed={isCollapsed}
                        canMoveUp={routeIndex > 0}
                        canMoveDown={routeIndex < routes.length - 1}
                        issues={issueMap.get(route.id)}
                        departmentName={departmentName(route.departmentId)}
                        onSelect={() => onSelect(route.id)}
                        onMove={(direction) => onMove(route.id, direction)}
                        onToggleCollapse={() => toggleRoute(route.id)}
                      />
                      {!isCollapsed ? (
                        <>
                          <span className="flow-connector" aria-hidden="true"><ChevronDown /></span>
                          <SortableContext items={branch.map((node) => node.id)} strategy={verticalListSortingStrategy}>
                            <div className="flow-branch-sequence">
                              {branch.map((node, index) => (
                                <div className="flow-sequence-item" key={node.id}>
                                  <SortableFlowNode
                                    node={node}
                                    containerId={route.id}
                                    selected={selectedNodeId === node.id}
                                    canMoveUp={index > 0}
                                    canMoveDown={index < branch.length - 1}
                                    issues={issueMap.get(node.id)}
                                    departmentName={departmentName(node.departmentId)}
                                    onSelect={() => onSelect(node.id)}
                                    onMove={(direction) => onMove(node.id, direction)}
                                  />
                                  {index < branch.length - 1 ? <span className="flow-connector" aria-hidden="true"><ChevronDown /></span> : null}
                                </div>
                              ))}
                            </div>
                          </SortableContext>
                          <AddFlowStep mode="branch" onAdd={(type) => onAddStep(type, route.id)} />
                        </>
                      ) : (
                        <div
                          className="flow-route-collapsed-summary"
                          onClick={() => toggleRoute(route.id)}
                          title="Clique para expandir as sub-etapas desta rota"
                        >
                          <span>{branch.length === 0 ? "Sem sub-etapas" : `${branch.length} sub-etapa(s) configurada(s)`}</span>
                          <Button variant="ghost" size="xs">Expandir etapas</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </div>
          <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
            {activeNode ? <FlowNodeCard node={activeNode} overlay departmentName={departmentName(activeNode.departmentId)} /> : null}
          </DragOverlay>
        </DndContext>
        <p className="sr-only" aria-live="polite">{announcement}</p>
      </CardContent>
    </Card>
  );
}

