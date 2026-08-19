import { AlertCircle, Pencil } from "lucide-react";
import type { BotExclusion } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { BotExclusionFormFields, type BotExclusionFormValues } from "./BotExclusionFormFields";

interface BotExclusionEditModalProps {
  open: boolean;
  target: BotExclusion | null;
  form: BotExclusionFormValues;
  onChange: (patch: Partial<BotExclusionFormValues>) => void;
  onOpenChange: (open: boolean) => void;
  onRequestSave: () => void;
  pending?: boolean;
  error?: string | null;
}

export function BotExclusionEditModal({
  open,
  target,
  form,
  onChange,
  onOpenChange,
  onRequestSave,
  pending = false,
  error,
}: BotExclusionEditModalProps) {
  const invalid = form.phone.replace(/\D/g, "").length < 7;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil data-icon="inline-start" />
            Editar contato ignorado
          </DialogTitle>
          <DialogDescription>
            Altere os dados do bloqueio. O bot continuará sem responder automaticamente a este número enquanto a regra estiver ativa.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-0.5">
          <BotExclusionFormFields
            form={form}
            onChange={onChange}
            disabled={pending}
            idPrefix="bot-exclusion-edit"
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
          <Button type="button" disabled={invalid || pending || !target} onClick={onRequestSave}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Salvando..." : "Salvar alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
