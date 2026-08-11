import { useEffect, useState, type ReactNode } from "react"
import { AlertOctagon, AlertTriangle } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type ConfirmationTone = "warning" | "danger"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tone: ConfirmationTone
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  details?: ReactNode
  onConfirm: () => void | Promise<void>
  testId?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  tone,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  details,
  onConfirm,
  testId,
}: ConfirmationDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDanger = tone === "danger"
  const Icon = isDanger ? AlertOctagon : AlertTriangle

  useEffect(() => {
    if (!open) {
      setError(null)
      setIsPending(false)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) onOpenChange(nextOpen)
  }

  const handleConfirm = async () => {
    setError(null)
    setIsPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a ação.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-card text-card-foreground ring-border sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia
            className={cn(
              isDanger
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/15 text-warning-foreground"
            )}
          >
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {details ? (
          <div className="rounded-lg border border-border bg-muted/45 px-3 py-2.5 text-sm text-foreground">
            {details}
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive" aria-live="polite">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={isDanger ? "destructive" : "warning"}
            disabled={isPending}
            onClick={handleConfirm}
            data-testid={testId}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {isPending ? "Processando..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export type { ConfirmationTone }
