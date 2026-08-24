import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { FlowRevision } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_CONTACT_SUMMARY_TEMPLATE, getBranchNodes, getDecisionGroups, getDecisionOptions, getMainNodes, getRouteNodes } from "../lib/flow-model";

function renderKnownContactPreview(template: string) {
  return template
    .replaceAll("{contactName}", "Claiton Barbosa")
    .replaceAll("{station}", "FM 88 MHz")
    .replaceAll("{city}", "Volta Redonda")
    .replaceAll("{state}", "RJ")
    .replaceAll("{stationLine}", "📻 Emissora: FM 88 MHz")
    .replaceAll("{locationLine}", "📍 Cidade/UF: Volta Redonda/RJ");
}

function DecisionPreview({ node, routes }: { node: FlowRevision["nodes"][number]; routes: FlowRevision["nodes"] }) {
  const groups = getDecisionGroups(node);
  if (groups.length) {
    return (
      <Accordion multiple defaultValue={groups.map((group) => group.categoryKey)} className="flow-preview-category-sequence">
        {groups.map((group) => (
          <AccordionItem key={group.categoryKey} value={group.categoryKey} className="flow-preview-category-item">
            <AccordionTrigger className="flow-preview-category-trigger">
              <span className="flow-preview-category-heading">
                <strong>{group.label}</strong>
                <small>{group.description || `${group.items.length} opções`}</small>
              </span>
            </AccordionTrigger>
            <AccordionContent className="flow-preview-category-content">
              <div className="flow-preview-options">
                {group.items.map((item) => (
                  <Button key={item.optionKey} variant="outline" size="sm" tabIndex={-1} className="flow-preview-option-button">
                    <span className="flow-preview-option-copy"><strong>{item.label}</strong>{item.description ? <small>{item.description}</small> : null}</span>
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }
  const options = node.config.parentRouteId
    ? getDecisionOptions(node).map((option) => ({ id: option.optionKey, name: option.label }))
    : routes.map((option) => ({ id: option.id, name: option.name }));
  return <div className="flow-preview-options">{options.map((option) => <Button key={option.id} variant="outline" size="sm" tabIndex={-1}>{option.name}</Button>)}</div>;
}

export function WhatsAppFlowPreview({ revision }: { revision: FlowRevision }) {
  const routes = getRouteNodes(revision);
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  useEffect(() => {
    if (!routes.some((route) => route.id === routeId)) setRouteId(routes[0]?.id ?? "");
  }, [routeId, routes]);
  const route = routes.find((item) => item.id === routeId);
  const entry = getMainNodes(revision).find((node) => node.type === "ENTRY");
  const knownContactSummary = entry?.config.knownContactSummary;
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
            {knownContactSummary?.enabled ? (
              <div className="flow-preview-message flow-preview-contact-summary">
                <small>Contato cadastrado</small>
                <p>{renderKnownContactPreview(knownContactSummary.template || DEFAULT_CONTACT_SUMMARY_TEMPLATE)}</p>
                <div className="flow-preview-options"><Button variant="outline" size="sm" tabIndex={-1}>{knownContactSummary.confirmLabel || "Sim, estão certos"}</Button><Button variant="outline" size="sm" tabIndex={-1}>{knownContactSummary.updateLabel || "Atualizar meus dados"}</Button></div>
              </div>
            ) : null}
            {messages.map((node) => (
              <div className="flow-preview-message" key={node.id}>
                <small>{node.name}</small>
                <p>{node.content}</p>
                {node.type === "DECISION" ? (
                  <DecisionPreview node={node} routes={routes} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
