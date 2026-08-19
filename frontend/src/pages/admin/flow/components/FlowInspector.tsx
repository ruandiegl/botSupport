import { Copy, Pencil, Trash2 } from "lucide-react";
import type { Department, FlowNode, FlowValidationIssue } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryStepEditor } from "./editors/EntryStepEditor";
import { MessageStepEditor } from "./editors/MessageStepEditor";
import { DecisionStepEditor } from "./editors/DecisionStepEditor";
import { RouteStepEditor } from "./editors/RouteStepEditor";
import { TriageStepEditor } from "./editors/TriageStepEditor";
import { HandoffStepEditor } from "./editors/HandoffStepEditor";
import { EndStepEditor } from "./editors/EndStepEditor";

interface FlowInspectorProps {
  node: FlowNode;
  departments: Department[];
  issues: FlowValidationIssue[];
  onChange: (node: FlowNode) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function FlowInspector({ node, departments, issues, onChange, onDuplicate, onDelete }: FlowInspectorProps) {
  const editorProps = { node, departments, issues, onChange };
  const Editor = {
    ENTRY: EntryStepEditor,
    MESSAGE: MessageStepEditor,
    DECISION: DecisionStepEditor,
    ROUTE: RouteStepEditor,
    TRIAGE: TriageStepEditor,
    HANDOFF: HandoffStepEditor,
    END: EndStepEditor,
  }[node.type];
  const protectedNode = node.type === "ENTRY" || (node.type === "DECISION" && !node.config.parentRouteId);
  const canDuplicate = !protectedNode && node.type !== "HANDOFF";
  return (
    <Card className="flow-inspector-card">
      <CardHeader>
        <CardTitle className="flow-inspector-title"><Pencil />Editar etapa</CardTitle>
        <CardDescription>As alterações ficam no rascunho até a publicação.</CardDescription>
        <CardAction><Badge variant={issues.length ? "destructive" : "secondary"}>{issues.length ? `${issues.length} pendência(s)` : "Válida"}</Badge></CardAction>
      </CardHeader>
      <CardContent><Editor {...editorProps} /></CardContent>
      {!protectedNode ? (
        <CardFooter className="flow-inspector-actions">
          {canDuplicate ? <Button variant="outline" size="sm" onClick={onDuplicate}><Copy data-icon="inline-start" />Duplicar</Button> : null}
          <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 data-icon="inline-start" />Excluir etapa</Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
