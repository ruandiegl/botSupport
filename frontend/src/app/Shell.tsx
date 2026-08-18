import React, { useState, createContext, useContext, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageCircle,
  Headphones,
  LayoutDashboard,
  Users,
  Bot,
  HelpCircle,
  Settings2,
  ChevronRight,
  Menu,
  Radio,
  LogOut,
  ShieldCheck,
  MessagesSquare,
  Tags,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ConversationListResponse, Agent, AgentNotification } from "@/types";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { NotificationBell } from "@/components/NotificationBell";
import { useSocketEvent } from "@/lib/use-socket-events";
import { DelegationAlertDialog } from "@/components/DelegationAlertDialog";

export interface AgentContextType {
  activeAgent: Agent | null;
  agents: Agent[];
  setActiveAgentId: (id: string) => void;
}

const AgentContext = createContext<AgentContextType>({
  activeAgent: null,
  agents: [],
  setActiveAgentId: () => {},
});

export const useActiveAgent = () => useContext(AgentContext);

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [delegationAlert, setDelegationAlert] = useState<AgentNotification | null>(null);
  const { user, logout, isAdmin, isAuthenticated, canViewScreen } = useAuth();
  const queryClient = useQueryClient();
  const conversationRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A fila e seus contadores são atualizados por eventos do Socket.IO.
  // Assim evitamos polling contínuo em todas as telas.
  const refreshConversations = useCallback(() => {
    if (conversationRefreshTimer.current) return;
    conversationRefreshTimer.current = setTimeout(() => {
      conversationRefreshTimer.current = null;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["conversation-counts"] });
    }, 100);
  }, [queryClient]);
  useEffect(() => () => {
    if (conversationRefreshTimer.current) clearTimeout(conversationRefreshTimer.current);
  }, []);
  const refreshAgents = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["agents"] });
  }, [queryClient]);
  useSocketEvent("conversation:updated", refreshConversations);
  useSocketEvent("conversation:labels_updated", refreshConversations);
  useSocketEvent("agent:status", refreshAgents);
  const handleDelegationNotification = useCallback((notification: Partial<AgentNotification>) => {
    if (notification.type !== "CONVERSATION_DELEGATED" || !notification.id || !notification.title || !notification.createdAt) return;
    setDelegationAlert((current) => current?.id === notification.id ? current : notification as AgentNotification);
  }, []);
  useSocketEvent("notification:new", handleDelegationNotification);

  // Buscar lista de atendentes reais do banco de dados
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: () => apiFetch<Agent[]>("/agents"),
    enabled: isAuthenticated,
  });

  const activeAgent: Agent | null = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: (user.role as any) || "AGENT",
        departmentId: user.departmentId || undefined,
        isOnline: true,
        isActive: user.isActive ?? true,
      }
    : agents[0] || null;

  const setActiveAgentId = (_id: string) => {};

  // O shell precisa apenas do contador; não carregue a lista completa nem o
  // histórico de mensagens para montar o badge da navegação.
  const { data: conversationSummary } = useQuery<ConversationListResponse>({
    queryKey: ["conversation-counts"],
    queryFn: () => apiFetch<ConversationListResponse>("/conversations?status=OPEN&page=1&limit=5"),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  const queueCount = conversationSummary?.counts?.open ?? conversationSummary?.items?.filter((item) => item.status === "OPEN").length ?? 0;

  const nav = [
    { href: "/", label: "Fila de atendimento", icon: MessageCircle, badge: queueCount || undefined },
    { href: "/my-conversations", label: "Meus atendimentos", icon: Headphones },
  ].filter((item) => canViewScreen(item.href));

  const admin = [
    { href: "/admin/departments", label: "Departamentos", icon: LayoutDashboard },
    { href: "/admin/agents", label: "Atendentes", icon: Users },
    { href: "/admin/shortcuts", label: "Atalhos e procedimentos", icon: MessagesSquare },
    { href: "/admin/labels", label: "Etiquetas", icon: Tags },
    { href: "/admin/flow", label: "Fluxo do bot", icon: Bot },
    { href: "/admin/zapi", label: "Conexão Z-API", icon: Radio },
    { href: "/admin/rbac", label: "Controle de Acesso", icon: ShieldCheck },
  ].filter((item) => canViewScreen(item.href));

  const getPageTitle = () => {
    if (location === "/") return "Fila de atendimento";
    if (location.includes("conversation")) return "Conversa";
    if (location.includes("departments")) return "Departamentos";
    if (location.includes("agents")) return "Atendentes";
    if (location.includes("shortcuts")) return "Atalhos e procedimentos";
    if (location.includes("labels")) return "Etiquetas";
    if (location.includes("flow")) return "Fluxo do bot";
    if (location.includes("zapi")) return "Conexão Z-API";
    if (location.includes("rbac")) return "Controle de Acesso (RBAC)";
    return "Meus atendimentos";
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <AgentContext.Provider value={{ activeAgent, agents, setActiveAgentId }}>
      <div className="app-shell">
        <aside className="sidebar" style={{ display: mobileOpen ? "flex" : undefined }}>
          <Brand />
          <div className="nav-label">Atendimento</div>
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${location === href ? "active" : ""}`}
              data-testid={`link-${label.toLowerCase().replace(/ /g, "-")}`}
            >
              <Icon /> <span>{label}</span>
              {badge ? <span className="nav-badge">{badge}</span> : null}
            </Link>
          ))}

          {admin.length > 0 && (
            <>
              <div className="nav-label">Administração</div>
              {admin.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-item ${location === href ? "active" : ""}`}
                  data-testid={`link-${label.toLowerCase().replace(/ /g, "-")}`}
                >
                  <Icon /> <span>{label}</span>
                </Link>
              ))}
            </>
          )}

          <div className="sidebar-spacer" />
          <div className="nav-item">
            <HelpCircle />
            <span>Central de ajuda</span>
          </div>

          <div className="agent-mini">
            <div className="avatar coral">
              {getInitials(activeAgent?.name || "Atendente")}
            </div>
            <div className="presence" style={{ background: "#10b981" }} />
            <div className="agent-mini-copy">
              <div className="agent-mini-name">{activeAgent?.name || "Usuário"}</div>
              <div className="agent-mini-role text-xs text-slate-400">
                {activeAgent?.role === "ADMIN" ? "Administrador" : "Atendente"} · Online
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setLogoutConfirmOpen(true)}
              title="Sair da plataforma"
              className="icon-btn text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="crumb">
              <Button
                variant="ghost"
                size="icon"
                className="icon-btn mobile-menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="button-open-menu"
              >
                <Menu size={16} />
              </Button>
              <span>GTF-Bot</span>
              <ChevronRight size={13} />
              <strong>{getPageTitle()}</strong>
            </div>
            <div className="top-actions">
              <NotificationBell />
              <Button variant="ghost" size="icon" className="icon-btn" data-testid="button-help">
                <HelpCircle size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="icon-btn" data-testid="button-settings">
                <Settings2 size={16} />
              </Button>
              <div className="avatar coral" style={{ width: 32, height: 32 }}>
                {getInitials(activeAgent?.name || "AT")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutConfirmOpen(true)}
                className="btn btn-muted"
                style={{ height: 32, fontSize: 12, padding: "0 10px" }}
              >
                <LogOut size={14} /> Sair
              </Button>
            </div>
          </header>

          {children}
        </main>
        <DelegationAlertDialog notification={delegationAlert} onClose={() => setDelegationAlert(null)} />
        <ConfirmationDialog
          open={logoutConfirmOpen}
          onOpenChange={setLogoutConfirmOpen}
          tone="warning"
          title="Sair da plataforma?"
          description="Sua sessão atual será encerrada e será necessário entrar novamente para acessar o sistema."
          confirmLabel="Sair da conta"
          onConfirm={handleLogout}
          testId="button-confirm-logout"
        />
      </div>
    </AgentContext.Provider>
  );
}
