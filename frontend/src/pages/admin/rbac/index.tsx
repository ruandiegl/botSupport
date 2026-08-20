import { useState, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle2, Save, RefreshCw, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useGetRoles,
  useGetRolePermissions,
  useUpdateRolePermissions,
  type RolePermissionData,
} from "./hooks/use-rbac";

const screenLabels: Record<string, string> = {
  "/": "Fila de Atendimento ao Vivo",
  "/my-conversations": "Meus Atendimentos",
  "/admin/departments": "Gerenciamento de Departamentos",
  "/admin/agents": "Gerenciamento de Atendentes",
  "/admin/shortcuts": "Atalhos e Procedimentos",
  "/admin/flow": "Fluxo do Bot WhatsApp",
  "/admin/zapi": "Conexão com Z-API",
  "/admin/rbac": "Controle de Acesso (RBAC)",
  "/admin/bot-exclusions": "Contatos ignorados pelo bot",
};

const resourceLabels: Record<string, string> = {
  conversations: "Conversas & Chat",
  queue: "Fila de Atendimento",
  agents: "Atendentes & Usuários",
  departments: "Departamentos & Procedimentos",
  shortcuts: "Atalhos e Procedimentos",
  flow: "Fluxo do Bot WhatsApp",
  zapi: "Conexão Z-API",
  rbac: "Permissões RBAC",
  bot_exclusions: "Contatos ignorados pelo bot",
  contacts: "Contatos compartilhados",
};

const permissionActions = ["view", "create", "update", "delete", "delegate", "publish", "use"] as const;

export default function RbacAdmin() {
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles();
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");
  const { data: rolePermissions, isLoading: isPermsLoading, refetch } = useGetRolePermissions(selectedRole);
  const updatePermissions = useUpdateRolePermissions();

  const [permissionsState, setPermissionsState] = useState<RolePermissionData | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  useEffect(() => {
    if (rolePermissions) {
      setPermissionsState(rolePermissions);
    }
  }, [rolePermissions]);

  const handleToggleScreen = (screenKey: string) => {
    if (!permissionsState) return;
    setPermissionsState({
      ...permissionsState,
      screens: {
        ...permissionsState.screens,
        [screenKey]: !permissionsState.screens[screenKey],
      },
    });
  };

  const handleToggleResourceAction = (resourceKey: string, action: "view" | "create" | "update" | "delete" | "delegate" | "publish" | "use") => {
    if (!permissionsState) return;
    const currentRes = permissionsState.resources[resourceKey] || { view: false, create: false, update: false, delete: false };
    setPermissionsState({
      ...permissionsState,
      resources: {
        ...permissionsState.resources,
        [resourceKey]: {
          ...currentRes,
          [action]: !currentRes[action],
        },
      },
    });
  };

  const handleToggleResourceRow = (resourceKey: string) => {
    if (!permissionsState) return;
    const currentRes = permissionsState.resources[resourceKey] || {};
    const shouldSelect = !permissionActions.every((action) => Boolean(currentRes[action]));
    setPermissionsState({
      ...permissionsState,
      resources: {
        ...permissionsState.resources,
        [resourceKey]: {
          ...currentRes,
          ...Object.fromEntries(permissionActions.map((action) => [action, shouldSelect])),
        },
      },
    });
  };

  const handleSave = async () => {
    if (!permissionsState) return;
    await updatePermissions.mutateAsync({ role: selectedRole, data: permissionsState });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    refetch();
  };

  const changedPermissions = rolePermissions && permissionsState
    ? [...Object.keys(permissionsState.screens).map((key) => rolePermissions.screens[key] !== permissionsState.screens[key]),
       ...Object.keys(permissionsState.resources).flatMap((resource) => permissionActions.map((action) => Boolean(rolePermissions.resources[resource]?.[action]) !== Boolean(permissionsState.resources[resource]?.[action])))]
        .filter(Boolean).length
    : 0;

  return (
    <div className="content">
      <PageHeader
        eyebrow="Administração / segurança"
        title="Controle de Acesso"
        description="Gerencie permissões de usuários, funções do sistema e disponibilize acesso por tela."
        action={
          <Button
            onClick={() => setSaveConfirmOpen(true)}
            disabled={updatePermissions.isPending || !permissionsState}
            variant="default"
            size="sm"
            data-testid="button-save-rbac"
          >
            <Save size={15} />
            {updatePermissions.isPending ? "Salvando..." : "Salvar Permissões"}
          </Button>
        }
      />

      {saveSuccess && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Permissões atualizadas com sucesso para a função <b>{selectedRole}</b>!</span>
        </div>
      )}

      {isRolesLoading ? (
        <div className="panel loading">
          <div className="skeleton short" />
          <div className="skeleton" />
        </div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: "300px 1fr" }}>
          {/* SELETOR DE FUNÇÕES (ROLES) */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 14 }}>
              <ShieldCheck size={18} />
              <h3>Funções do Sistema</h3>
            </div>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="flex flex-col gap-2">
              {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <label
                    key={role.id}
                    className={`rbac-role ${isSelected ? "selected" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <RadioGroupItem value={role.id} aria-label={role.name} />
                      <span className="rbac-role-name">
                        {role.name}
                      </span>
                      {isSelected && (
                        <span className="rbac-role-indicator" />
                      )}
                    </div>
                    <p className="rbac-role-description">
                      {role.description}
                    </p>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* MATRIZ DE PERMISSÕES E ACESSO POR TELA */}
          <div className="flex flex-col gap-5">
            {isPermsLoading || !permissionsState ? (
              <div className="panel loading">
                <div className="skeleton short" />
                <div className="skeleton" />
              </div>
            ) : (
              <>
                {/* 1. ACESSO POR TELAS */}
                <div className="panel" style={{ padding: 22 }}>
                  <div className="panel-title" style={{ marginBottom: 14 }}>
                    <Layers size={18} />
                    <h2>Acesso por Tela / Rota ({selectedRole})</h2>
                  </div>
                  <p className="subtle" style={{ fontSize: 12, marginBottom: 16 }}>
                    Defina quais telas da aplicação ficam visíveis e acessíveis para usuários com a função <b>{selectedRole}</b>:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(screenLabels).map(([path, label]) => {
                      const isAllowed = Boolean(permissionsState.screens[path]);
                      return (
                        <label
                          key={path}
                          className={`rbac-screen ${isAllowed ? "selected" : ""}`}
                        >
                          <Checkbox
                            checked={isAllowed}
                            onCheckedChange={() => handleToggleScreen(path)}
                          />
                          <div className="flex flex-col">
                            <span className="rbac-screen-label">{label}</span>
                            <span className="rbac-screen-path">{path}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. PERMISSÕES DE AÇÃO POR RECURSO */}
                <div className="panel" style={{ padding: 22 }}>
                  <div className="panel-title" style={{ marginBottom: 14 }}>
                    <Lock size={18} />
                    <h2>Permissões de Ação por Recurso</h2>
                  </div>
                  <p className="subtle" style={{ fontSize: 12, marginBottom: 16 }}>
                    Configure permissões granulares (Ver, Criar, Editar, Excluir) por módulo do sistema:
                  </p>

                  <table className="table">
                    <thead>
                      <tr>
                        <th>Módulo / Recurso</th>
                        <th className="text-center">Visualizar</th>
                        <th className="text-center">Criar</th>
                        <th className="text-center">Editar</th>
                        <th className="text-center">Excluir</th>
                        <th className="text-center">Delegar</th>
                        <th className="text-center">Publicar</th>
                        <th className="text-center">Usar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(resourceLabels).map(([resKey, resName]) => {
                        const actions = permissionsState.resources[resKey] || {
                          view: false,
                          create: false,
                          update: false,
                          delete: false,
                        };

                        return (
                          <tr key={resKey}>
                            <td className="rbac-resource-name">
                              <label className="flex items-center gap-2.5">
                                <Checkbox
                                  checked={permissionActions.every((action) => Boolean(actions[action]))}
                                  indeterminate={permissionActions.some((action) => Boolean(actions[action])) && !permissionActions.every((action) => Boolean(actions[action]))}
                                  onCheckedChange={() => handleToggleResourceRow(resKey)}
                                  aria-label={`Selecionar todas as permissões de ${resName}`}
                                  data-testid={`checkbox-all-${resKey}`}
                                />
                                <span>{resName}</span>
                              </label>
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={actions.view}
                                onCheckedChange={() => handleToggleResourceAction(resKey, "view")}
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={actions.create}
                                onCheckedChange={() => handleToggleResourceAction(resKey, "create")}
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={actions.update}
                                onCheckedChange={() => handleToggleResourceAction(resKey, "update")}
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={actions.delete}
                                onCheckedChange={() => handleToggleResourceAction(resKey, "delete")}
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox checked={Boolean(actions.delegate)} onCheckedChange={() => handleToggleResourceAction(resKey, "delegate")} />
                            </td>
                            <td className="text-center">
                              <Checkbox checked={Boolean(actions.publish)} onCheckedChange={() => handleToggleResourceAction(resKey, "publish")} />
                            </td>
                            <td className="text-center">
                              <Checkbox checked={Boolean(actions.use)} onCheckedChange={() => handleToggleResourceAction(resKey, "use")} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        tone="warning"
        title="Salvar alterações de acesso?"
        description="As novas permissões passarão a valer para todos os usuários desta função."
        confirmLabel="Salvar permissões"
        details={<span>Função <strong>{selectedRole}</strong> · {changedPermissions} alteração(ões)</span>}
        onConfirm={handleSave}
        testId="button-confirm-save-rbac"
      />
    </div>
  );
}
