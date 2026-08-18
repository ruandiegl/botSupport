import { useEffect, useState } from "react";
import { UserRoundCheck } from "lucide-react";
import type { Agent } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function DelegationDialog({
  open,
  onOpenChange,
  agents,
  currentAgentId,
  isPending,
  error,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Agent[];
  currentAgentId?: string | null;
  isPending: boolean;
  error?: string | null;
  onSubmit: (data: { agentId: string; reason?: string }) => void;
}) {
  const [agentId, setAgentId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setAgentId(agents.find((agent) => agent.id !== currentAgentId)?.id ?? "");
      setReason("");
    }
  }, [open, agents, currentAgentId]);

  const selected = agents.find((agent) => agent.id === agentId);
  const submit = () => {
    if (!agentId || agentId === currentAgentId) return;
    onSubmit({ agentId, ...(reason.trim() ? { reason: reason.trim() } : {}) });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="bg-card text-card-foreground ring-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundCheck className="text-primary" data-icon="inline-start" />
            Delegar chamado
          </DialogTitle>
          <DialogDescription>
            Escolha um atendente ativo. O responsável atual será atualizado e o destinatário receberá uma notificação.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="delegation-agent">Atendente destinatário</FieldLabel>
            <Select value={agentId || undefined} onValueChange={(value) => value && setAgentId(value)}>
              <SelectTrigger id="delegation-agent" className="w-full" aria-label="Atendente destinatário">
                <SelectValue>{selected ? `${selected.name}${selected.departmentName ? ` · ${selected.departmentName}` : ""}` : "Selecione um atendente"}</SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                <SelectGroup>
                  {agents.filter((agent) => agent.id !== currentAgentId).map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span>{agent.name}{agent.isOnline ? " · online" : ""}</span>
                        <span className="text-xs text-muted-foreground">{agent.departmentName || "Sem departamento"}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>Somente atendentes ativos dentro do seu escopo aparecem nesta lista.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="delegation-reason">Motivo (opcional)</FieldLabel>
            <Textarea
              id="delegation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              placeholder="Ex.: cobertura de férias ou necessidade de conhecimento específico"
              rows={3}
            />
            <FieldDescription>{reason.length}/500 caracteres</FieldDescription>
          </Field>
        </FieldGroup>

        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" variant="warning" disabled={!agentId || agentId === currentAgentId || isPending} onClick={submit}>
            {isPending ? "Delegando..." : "Delegar chamado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
