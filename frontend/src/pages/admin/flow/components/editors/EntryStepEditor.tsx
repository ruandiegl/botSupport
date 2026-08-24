import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CONTACT_SUMMARY_TEMPLATE } from "../../lib/flow-model";
import { NameField } from "./EditorFields";
import type { StepEditorProps } from "./types";
import { issueFor } from "./types";

export function EntryStepEditor({ node, issues, onChange }: StepEditorProps) {
  const summary = {
    enabled: node.config.knownContactSummary?.enabled ?? false,
    template: node.config.knownContactSummary?.template ?? DEFAULT_CONTACT_SUMMARY_TEMPLATE,
    confirmLabel: node.config.knownContactSummary?.confirmLabel ?? "Sim, estão certos",
    updateLabel: node.config.knownContactSummary?.updateLabel ?? "Atualizar meus dados",
    updateIntro: node.config.knownContactSummary?.updateIntro ?? "Vamos atualizar seu cadastro. Informe seu nome completo.",
  };
  const updateSummary = (next: Partial<typeof summary>) => onChange({ ...node, config: { ...node.config, knownContactSummary: { ...summary, ...next } } });

  return (
    <FieldGroup>
      <FieldDescription>A entrada é o ponto estrutural único que inicia todas as conversas. Para enviar texto antes da decisão, adicione uma etapa de mensagem.</FieldDescription>
      <NameField node={node} error={issueFor(issues, "name")} onChange={onChange} />
      <FieldSet>
        <FieldLegend>Contato já cadastrado</FieldLegend>
        <FieldDescription>Confirme os dados conhecidos antes de abrir as categorias. Contatos ainda não cadastrados seguem diretamente para a saudação normal.</FieldDescription>
        <Field orientation="horizontal">
          <Checkbox id={`known-contact-summary-${node.id}`} checked={summary.enabled} onCheckedChange={(checked) => updateSummary({ enabled: checked === true })} />
          <FieldLabel htmlFor={`known-contact-summary-${node.id}`} className="font-normal">Mostrar resumo e pedir confirmação</FieldLabel>
        </Field>
        {summary.enabled ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`known-contact-template-${node.id}`}>Mensagem de confirmação</FieldLabel>
              <Textarea id={`known-contact-template-${node.id}`} rows={8} maxLength={4000} value={summary.template} onChange={(event) => updateSummary({ template: event.target.value })} />
              <FieldDescription>Tokens: {"{contactName}"}, {"{stationLine}"}, {"{locationLine}"}, {"{station}"}, {"{city}"} e {"{state}"}.</FieldDescription>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field><FieldLabel htmlFor={`known-contact-confirm-${node.id}`}>Botão de confirmação</FieldLabel><Input id={`known-contact-confirm-${node.id}`} maxLength={80} value={summary.confirmLabel} onChange={(event) => updateSummary({ confirmLabel: event.target.value })} /></Field>
              <Field><FieldLabel htmlFor={`known-contact-update-${node.id}`}>Botão de atualização</FieldLabel><Input id={`known-contact-update-${node.id}`} maxLength={80} value={summary.updateLabel} onChange={(event) => updateSummary({ updateLabel: event.target.value })} /></Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`known-contact-update-intro-${node.id}`}>Primeira pergunta da atualização</FieldLabel>
              <Textarea id={`known-contact-update-intro-${node.id}`} rows={3} maxLength={4000} value={summary.updateIntro} onChange={(event) => updateSummary({ updateIntro: event.target.value })} />
            </Field>
          </FieldGroup>
        ) : null}
      </FieldSet>
    </FieldGroup>
  );
}
