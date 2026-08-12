import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { FlowRevision } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBranchNodes, getMainNodes, getRouteNodes } from "../lib/flow-model";

export function WhatsAppFlowPreview({ revision }: { revision: FlowRevision }) {
  const routes = getRouteNodes(revision);
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  useEffect(() => {
    if (!routes.some((route) => route.id === routeId)) setRouteId(routes[0]?.id ?? "");
  }, [routeId, routes]);
  const route = routes.find((item) => item.id === routeId);
  const messages = useMemo(() => [
    ...getMainNodes(revision).filter((node) => node.content.trim()),
    ...(route ? getBranchNodes(revision, route.id).filter((node) => node.content.trim()) : []),
  ], [revision, route]);

  return (
    <Card className="flow-preview-card">
      <CardHeader>
        <CardTitle className="flow-preview-title"><MessageCircle />Prévia do WhatsApp</CardTitle>
        <CardDescription>Simulação visual do ramo selecionado, sem enviar mensagens.</CardDescription>
      </CardHeader>
      <CardContent className="flow-preview-content">
        {routes.length ? (
          <Select value={routeId} onValueChange={(value) => value && setRouteId(value)}>
            <SelectTrigger aria-label="Ramo da prévia"><SelectValue>{route?.name ?? "Selecione uma rota"}</SelectValue></SelectTrigger>
            <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
              <SelectGroup>{routes.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>
        ) : null}
        <div className="flow-phone-preview" aria-label="Mensagens previstas">
          <div className="flow-phone-bar"><span>GTF-Bot</span><Badge variant="secondary">Prévia</Badge></div>
          <div className="flow-phone-messages">
            {messages.map((node) => (
              <div className="flow-preview-message" key={node.id}>
                <small>{node.name}</small>
                <p>{node.content}</p>
                {node.type === "DECISION" ? <div className="flow-preview-options">{routes.map((option) => <Button key={option.id} variant="outline" size="sm" tabIndex={-1}>{option.name}</Button>)}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
