import { useEffect, useState, type FormEvent } from "react"
import { AlertTriangle, Key, Shield, UserCheck, UserPlus } from "lucide-react"

import type { Agent, Department } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

interface AgentInput {
  name: string
  email: string
  password?: string
  role: string
  departmentId?: string | null
}

interface AgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AgentInput) => Promise<void>
  agent?: Agent | null
  departments: Department[]
  isSaving: boolean
}

const roleLabel = (role: string) =>
  role === "ADMIN" ? "Administrador" : role === "SUPERVISOR" ? "Supervisor" : "Atendente"

export function AgentModal({ isOpen, onClose, onSave, agent, departments, isSaving }: AgentModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("AGENT")
  const [departmentId, setDepartmentId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingData, setPendingData] = useState<AgentInput | null>(null)

  const isEditing = Boolean(agent)

  useEffect(() => {
    setName(agent?.name || "")
    setEmail(agent?.email || "")
    setPassword("")
    setConfirmPassword("")
    setRole(agent?.role || "AGENT")
    setDepartmentId(agent?.departmentId || "")
    setError(null)
    setPendingData(null)
  }, [agent, isOpen])

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSaving) onClose()
  }

  const handleReview = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim()) {
      setError("Nome e e-mail são obrigatórios.")
      return
    }
    if (!isEditing && !password.trim()) {
      setError("Senha inicial é obrigatória para novo atendente.")
      return
    }
    if (password.trim() && password !== confirmPassword) {
      setError("A confirmação de senha não confere.")
      return
    }
    setPendingData({
      name: name.trim(),
      email: email.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      role,
      departmentId: departmentId || null,
    })
  }

  const handleConfirm = async () => {
    if (!pendingData) return
    setError(null)
    try {
      await onSave(pendingData)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao salvar atendente.")
    }
  }

  const selectedDepartment = departments.find((department) => department.id === pendingData?.departmentId)?.name || "Todos"

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {pendingData ? <AlertTriangle aria-hidden="true" /> : isEditing ? <UserCheck aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>
                {pendingData ? (isEditing ? "Confirmar alterações do atendente" : "Confirmar novo atendente") : isEditing ? "Editar atendente" : "Novo atendente"}
              </DialogTitle>
              <DialogDescription>
                {pendingData ? "Revise os dados antes de aplicar esta alteração ao acesso do usuário." : isEditing ? "Atualize os dados e permissões do colaborador." : "Cadastre um novo atendente na equipe."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error ? <Alert variant="destructive" aria-live="polite"><AlertDescription>{error}</AlertDescription></Alert> : null}

        {pendingData ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-muted/45 p-3 text-sm">
              <strong>{pendingData.name}</strong>
              <p className="text-muted-foreground">{pendingData.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-background px-2 py-1 ring-1 ring-border">{roleLabel(pendingData.role)}</span>
                <span className="rounded-md bg-background px-2 py-1 ring-1 ring-border">{selectedDepartment}</span>
                {pendingData.password ? <span className="rounded-md bg-warning/15 px-2 py-1 text-warning-foreground ring-1 ring-warning/30">Senha será {isEditing ? "redefinida" : "criada"}</span> : null}
              </div>
            </div>
            <Alert>
              <Shield aria-hidden="true" />
              <AlertDescription>A função selecionada define quais telas e ações ficarão disponíveis para este usuário.</AlertDescription>
            </Alert>
          </div>
        ) : (
          <form id="agent-form" onSubmit={handleReview} className="flex flex-col gap-4">
            <div className="field">
              <label htmlFor="agent-name">Nome completo</label>
              <Input id="agent-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Marina Silva" />
            </div>
            <div className="field">
              <label htmlFor="agent-email">E-mail de acesso</label>
              <Input id="agent-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="marina@torreforte.org" />
            </div>
            <div className="field">
              <label htmlFor="agent-password">{isEditing ? "Nova senha (opcional)" : "Senha inicial"}</label>
              <div className="relative">
                <Input id="agent-password" type="password" required={!isEditing} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isEditing ? "Deixe em branco para manter" : "Digite a senha inicial"} />
                <Key className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              </div>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirme a senha" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field">
                <label>Função / permissão</label>
                <Select value={role} onValueChange={(value) => value && setRole(value)}>
                  <SelectTrigger><SelectValue>{roleLabel(role)}</SelectValue></SelectTrigger>
                  <SelectContent side="bottom"><SelectGroup><SelectItem value="AGENT">Atendente</SelectItem><SelectItem value="SUPERVISOR">Supervisor</SelectItem><SelectItem value="ADMIN">Administrador</SelectItem></SelectGroup></SelectContent>
                </Select>
              </div>
              <div className="field">
                <label>Departamento</label>
                <Select value={departmentId || undefined} onValueChange={(value) => setDepartmentId(value ?? "")}>
                  <SelectTrigger><SelectValue>{departments.find((department) => department.id === departmentId)?.name || "Nenhum (Todos)"}</SelectValue></SelectTrigger>
                  <SelectContent side="bottom"><SelectGroup>{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </div>
            </div>
          </form>
        )}

        <DialogFooter>
          {pendingData ? (
            <>
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => { setPendingData(null); setError(null) }}>Voltar e editar</Button>
              <Button type="button" variant="warning" disabled={isSaving} onClick={handleConfirm}>
                {isSaving ? <Spinner data-icon="inline-start" /> : null}
                {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar atendente"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" form="agent-form" variant="default">Revisar dados</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
