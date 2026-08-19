import { AlertCircle, Pencil } from "lucide-react";
import type { Department, Shortcut } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ShortcutFormFields, type ShortcutFormValues } from "./ShortcutFormFields";

interface ShortcutEditModalProps {
  open: boolean;
  target: Shortcut | null;
  isCreating?: boolean;
  form: ShortcutFormValues;
  departments: Department[];
  visibleScopes: readonly ShortcutFormValues["scope"][];
  onChange: (patch: Partial<ShortcutFormValues>) => void;
  onInsertVariable: (variable: string) => void;
  onOpenChange: (open: boolean) => void;
  onRequestSave: () => void;
  pending?: boolean;
  error?: string | null;
}

export function ShortcutEditModal({
  open,
  target,
  isCreating = false,
  form,
  departments,
  visibleScopes,
  onChange,
  onInsertVariable,
  onOpenChange,
  onRequestSave,
  pending = false,
  error,
}: ShortcutEditModalProps) {
  const invalid = form.title.trim().length < 2 || !form.message.trim() || (form.scope === "DEPARTMENT" && !form.departmentId);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil data-icon="inline-start" />
            {isCreating ? "Configurar mensagem de sistema" : "Editar atalho"}
          </DialogTitle>
          <DialogDescription>
            Altere a mensagem e defina onde ela ficará disponível. O texto será inserido no chat sem envio automático.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-0.5">
          <ShortcutFormFields form={form} onChange={onChange} departments={departments} visibleScopes={visibleScopes} onInsertVariable={onInsertVariable} disabled={pending} idPrefix="shortcut-edit" />
        </div>

        {error ? (
          <Alert variant="destructive" aria-live="polite">
            <AlertCircle data-icon="inline-start" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" disabled={invalid || pending || (!target && !isCreating)} onClick={onRequestSave}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
