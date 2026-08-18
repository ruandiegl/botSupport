import { useEffect, useMemo, useState } from "react";
import { Check, UserRoundCheck, X } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import type { AgentNotification, Conversation } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface DelegationAlertDialogProps {
  notification: AgentNotification | null;
  onClose: () => void;
}

export function DelegationAlertDialog({ notification, onClose }: DelegationAlertDialogProps) {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const payload = useMemo(() => notification?.payload ?? {}, [notification]);
  const assignmentId = typeof payload.delegationAssignmentId === "string" ? payload.delegationAssignmentId : "";
  const conversationId = notification?.conversationId || (typeof payload.conversationId === "string" ? payload.conversationId : "");

  const respond = useMutation<Conversation, Error, "ACCEPT" | "DECLINE">({
    mutationFn: (decision) => apiFetch<Conversation>(`/conversations/${conversationId}/delegation-response`, {
      method: "POST",
      body: JSON.stringify({ assignmentId, decision }),
    }),
  });

  useEffect(() => {
    setError(null);
    respond.reset();
  }, [notification?.id]);

  const handleDecision = (decision: "ACCEPT" | "DECLINE") => {
    if (!notification || !assignmentId || !conversationId) {
      setError("A delegação não contém uma referência válida para resposta.");
      return;
    }
    setError(null);
    respond.mutate(decision, {
      onSuccess: async () => {
        // The original notification is no longer actionable after a choice.
        await apiFetch(`/notifications/${notification.id}/dismiss`, { method: "POST" }).catch(() => undefined);
        await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
        onClose();
        if (decision === "ACCEPT") setLocation(`/conversation/${conversationId}`);
      },
      onError: (cause) => setError(cause.message || "Não foi possível responder à delegação."),
    });
  };

  return (
    <Dialog open={Boolean(notification)} onOpenChange={(open) => { if (!open && !respond.isPending) onClose(); }}>
      <DialogContent className="bg-card text-card-foreground ring-border sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRoundCheck className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>Chamado delegado para você</DialogTitle>
          <DialogDescription>
            {notification?.body || "Um gestor delegou um chamado para o seu atendimento."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
          Você pode assumir o chamado agora ou recusá-lo para que ele volte à responsabilidade anterior ou à fila.
        </div>

        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

        <DialogFooter className="sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={respond.isPending} onClick={() => handleDecision("DECLINE")} data-testid="button-decline-delegated-conversation">
            {respond.isPending ? <Spinner data-icon="inline-start" /> : <X data-icon="inline-start" />}
            Não assumir
          </Button>
          <Button variant="default" disabled={respond.isPending} onClick={() => handleDecision("ACCEPT")} data-testid="button-accept-delegated-conversation">
            {respond.isPending ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />}
            Assumir chamado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
