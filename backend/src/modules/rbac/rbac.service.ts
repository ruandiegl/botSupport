import { rbacRepository } from "./rbac.repository.js";

export const RBAC_RESOURCES = ["conversations", "queue", "agents", "departments", "shortcuts", "labels", "flow", "zapi", "rbac", "reports"] as const;
export const RBAC_ACTIONS = ["view", "assume", "delegate", "close", "send_message", "view_all", "view_own", "create", "update", "delete", "publish", "use", "edit", "configure", "manage"] as const;

type PermissionMap = Record<string, string[]>;

const defaults: Record<string, PermissionMap> = {
  ADMIN: {
    conversations: ["view", "assume", "delegate", "close", "send_message"], queue: ["view_all", "view_own"], agents: ["view", "create", "update", "delete"],
    departments: ["view", "create", "update", "delete"], shortcuts: ["view", "create", "update", "delete", "publish", "use"], labels: ["view", "create", "update", "delete"], flow: ["view", "edit", "publish"], zapi: ["view", "configure"], rbac: ["view", "manage"], reports: ["view"],
  },
  SUPERVISOR: {
    conversations: ["view", "assume", "delegate", "close", "send_message"], queue: ["view_all", "view_own"], agents: ["view"], departments: ["view"], shortcuts: ["view", "create", "update", "use"], labels: ["view", "update"], reports: ["view"],
  },
  AGENT: {
    conversations: ["view", "assume", "close", "send_message"], queue: ["view_own"], shortcuts: ["view", "create", "update", "delete", "use"], labels: ["view", "update"],
  },
};

const screens = ["/", "/my-conversations", "/conversation/:id", "/admin/departments", "/admin/agents", "/admin/shortcuts", "/admin/labels", "/admin/flow", "/admin/zapi", "/admin/rbac"];

function screenResource(path: string) { return `screen:${path}`; }

export class RbacService {
  private async ensureDefaults(role: string) {
    const current = await rbacRepository.findByRole(role);
    const roleDefaults = defaults[role] || defaults.AGENT;
    const existingResources = new Set(current.map((item) => item.resource));
    const missing = [
      ...Object.entries(roleDefaults)
        .filter(([resource]) => !existingResources.has(resource))
        .map(([resource, actions]) => rbacRepository.upsert(role, resource, actions)),
      ...Object.entries(roleDefaults)
        .filter(([resource, actions]) => {
          const existing = current.find((item) => item.resource === resource);
          return Boolean(existing && actions.includes("delegate") && !existing.actions.includes("delegate"));
        })
        .map(([resource, actions]) => {
          const existing = current.find((item) => item.resource === resource)!;
          return rbacRepository.upsert(role, resource, [...new Set([...existing.actions, ...actions.filter((action) => action === "delegate")])]);
        }),
      ...screens
        .filter((path) => !existingResources.has(screenResource(path)))
        .map((path) => rbacRepository.upsert(role, screenResource(path), role === "ADMIN" || path === "/" || path === "/my-conversations" || path === "/conversation/:id" || path === "/admin/shortcuts" ? ["view"] : [])),
    ];
    if (missing.length === 0) return current;
    await Promise.all(missing);
    return rbacRepository.findByRole(role);
  }

  async getRoles() {
    return [
      { id: "ADMIN", name: "Administrador", description: "Acesso irrestrito a todas as rotas e recursos do sistema." },
      { id: "SUPERVISOR", name: "Supervisor", description: "Supervisão da fila e leitura da equipe." },
      { id: "AGENT", name: "Atendente", description: "Operação de chat e atendimento aos contatos." },
    ];
  }

  async getPermissions(role: string) {
    const roleKey = role.toUpperCase();
    const rows = await this.ensureDefaults(roleKey);
    const resources: Record<string, Record<string, boolean>> = {};
    const screenPermissions: Record<string, boolean> = {};
    for (const row of rows) {
      if (row.resource.startsWith("screen:")) screenPermissions[row.resource.slice(7)] = row.actions.includes("view");
      else resources[row.resource] = Object.fromEntries(RBAC_ACTIONS.map((action) => [action, row.actions.includes(action)]));
    }
    return { role: roleKey, resources, screens: screenPermissions };
  }

  async updatePermissions(role: string, data: { resources?: Record<string, Record<string, boolean>>; screens?: Record<string, boolean> }) {
    const roleKey = role.toUpperCase();
    for (const [resource, actions] of Object.entries(data.resources || {})) {
      const allowed = Object.entries(actions).filter(([, enabled]) => enabled).map(([action]) => action);
      await rbacRepository.upsert(roleKey, resource, allowed);
    }
    for (const [path, enabled] of Object.entries(data.screens || {})) {
      await rbacRepository.upsert(roleKey, screenResource(path), enabled ? ["view"] : []);
    }
    return this.getPermissions(roleKey);
  }

  async hasPermission(role: string, resource: string, action: string) {
    if (role === "ADMIN") return true;
    const permissions = await this.getPermissions(role);
    return Boolean(permissions.resources[resource]?.[action]);
  }

  async canViewScreen(role: string, path: string) {
    if (role === "ADMIN") return true;
    const permissions = await this.getPermissions(role);
    const exact = permissions.screens[path];
    if (exact !== undefined) return exact;
    if (path.startsWith("/conversation/")) return Boolean(permissions.screens["/conversation/:id"]);
    return false;
  }
}

export const rbacService = new RbacService();
