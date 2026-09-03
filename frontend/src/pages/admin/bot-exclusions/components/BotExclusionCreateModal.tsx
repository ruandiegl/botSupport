import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { BotExclusionFormFields, type BotExclusionFormValues } from "./BotExclusionFormFields";

interface BotExclusionCreateModalProps {
  open: boolean;
  form: BotExclusionFormValues;
  onChange: (patch: Partial<BotExclusionFormValues>) => void;
  onOpenChange: (open: boolean) => void;
  onRequestSave: () => void;
  pending?: boolean;
  error?: string | null;
}

export function BotExclusionCreateModal({
  open,
  form,
  onChange,
  onOpenChange,
  onRequestSave,
  pending = false,
  error,
}: BotExclusionCreateModalProps) {
  const invalid = form.phone.replace(/\D/g, "").length < 7;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus data-icon="inline-start" />
            Novo bloqueio
          </DialogTitle>
          <DialogDescription>
            Cadastre um número que não deve receber respostas automáticas. O histórico continuará disponível para atendimento manual.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-0.5">
          <BotExclusionFormFields
            form={form}
            onChange={onChange}
            disabled={pending}
            idPrefix="bot-exclusion-create"
          />
        </div>

        {error ? (
          <Alert variant="destructive" aria-live="polite">
            <AlertCircle data-icon="inline-start" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={invalid || pending} onClick={onRequestSave}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Salvando..." : "Adicionar número"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
