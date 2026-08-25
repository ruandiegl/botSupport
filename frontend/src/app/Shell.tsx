import React, { useState, createContext, useContext, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageCircle,
  Headphones,
  LayoutDashboard,
  Users,
  Bot,
  Settings2,
  ChevronRight,
  Menu,
  Radio,
  LogOut,
  ShieldCheck,
  MessagesSquare,
  Tags,
  ShieldOff,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarClock,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ConversationListResponse, Agent, AgentNotification } from "@/types";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
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
      void queryClient.invalidateQueries({ queryKey: ["agent-workload"] });
    }, 100);
  }, [queryClient]);
  useEffect(() => () => {
    if (conversationRefreshTimer.current) clearTimeout(conversationRefreshTimer.current);
  }, []);
  const refreshAgents = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["agents"] });
    void queryClient.invalidateQueries({ queryKey: ["agent-workload"] });
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

  const navSections = [
    {
      label: "Mensagens",
      items: [
        { href: "/", label: "Fila de atendimento", icon: MessageCircle, badge: queueCount || undefined },
        { href: "/my-conversations", label: "Meus atendimentos", icon: Headphones },
        { href: "/groups", label: "Grupos do WhatsApp", icon: Users },
        { href: "/admin/shortcuts", label: "Atalhos e procedimentos", icon: MessagesSquare },
      ],
    },
    {
      label: "Atendimento",
      items: [
        { href: "/contacts", label: "Contatos", icon: UserRound },
        { href: "/admin/labels", label: "Etiquetas", icon: Tags },
      ],
    },
    {
      label: "Administração",
      items: [
        { href: "/admin/departments", label: "Departamentos", icon: LayoutDashboard },
        { href: "/admin/agents", label: "Atendentes", icon: Users },
        { href: "/admin/business-hours", label: "Horários de atendimento", icon: CalendarClock },
        { href: "/admin/rbac", label: "Controle de Acesso", icon: ShieldCheck },
      ],
    },
    {
      label: "Automação",
      items: [
        { href: "/admin/flow", label: "Fluxo do bot", icon: Bot },
        { href: "/admin/bot-exclusions", label: "Contatos ignorados pelo bot", icon: ShieldOff },
      ],
    },
    {
      label: "Integrações",
      items: [
        { href: "/admin/zapi", label: "Conexão Z-API", icon: Radio },
      ],
    },
  ]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canViewScreen(item.href)),
    }))
    .filter((section) => section.items.length > 0);

  const getPageTitle = () => {
    if (location === "/") return "Fila de atendimento";
    if (location === "/contacts") return "Contatos";
    if (location === "/groups") return "Grupos do WhatsApp";
    if (location.includes("conversation")) return "Conversa";
    if (location.includes("departments")) return "Departamentos";
    if (location.includes("agents")) return "Atendentes";
    if (location.includes("business-hours")) return "Horários de atendimento";
    if (location.includes("shortcuts")) return "Atalhos e procedimentos";
    if (location.includes("labels")) return "Etiquetas";
    if (location.includes("bot-exclusions")) return "Contatos ignorados pelo bot";
    if (location.includes("flow")) return "Fluxo do bot";
    if (location.includes("zapi")) return "Conexão Z-API";
    if (location.includes("rbac")) return "Controle de Acesso (RBAC)";
    return "Meus atendimentos";
  };

  const getPageHref = () => {
    if (location === "/") return "/";
    if (location === "/my-conversations") return "/my-conversations";
    if (location === "/contacts") return "/contacts";
    if (location === "/groups") return "/groups";
    if (location.includes("conversation")) return "/";
    if (location.includes("departments")) return "/admin/departments";
    if (location.includes("agents")) return "/admin/agents";
    if (location.includes("business-hours")) return "/admin/business-hours";
    if (location.includes("shortcuts")) return "/admin/shortcuts";
    if (location.includes("labels")) return "/admin/labels";
    if (location.includes("bot-exclusions")) return "/admin/bot-exclusions";
    if (location.includes("flow")) return "/admin/flow";
    if (location.includes("zapi")) return "/admin/zapi";
    if (location.includes("rbac")) return "/admin/rbac";
    return "/my-conversations";
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // Prefer the layout to keep working when storage is unavailable.
    }
  }, [sidebarCollapsed]);

  return (
    <AgentContext.Provider value={{ activeAgent, agents, setActiveAgentId }}>
      <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <aside className="sidebar" style={{ display: mobileOpen ? "flex" : undefined }}>
          <div className="sidebar-header">
            <Brand compact={sidebarCollapsed} />
            <Button
              variant="ghost"
              size="icon"
              className="icon-btn sidebar-toggle"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
              aria-pressed={sidebarCollapsed}
              title={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
              data-testid="button-toggle-sidebar"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </Button>
          </div>
          {navSections.map(({ label: sectionLabel, items }) => (
            <section className="nav-section" key={sectionLabel} aria-label={sectionLabel}>
              <div className="nav-label">{sectionLabel}</div>
              {items.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-item ${location === href ? "active" : ""}`}
                  aria-label={label}
                  title={sidebarCollapsed ? label : undefined}
                  data-testid={`link-${label.toLowerCase().replace(/ /g, "-")}`}
                >
                  <Icon /> <span>{label}</span>
                  {badge ? <span className="nav-badge">{badge}</span> : null}
                </Link>
              ))}
            </section>
          ))}

          <div className="sidebar-spacer" />
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
              <Link href="/" className="crumb-link" data-testid="breadcrumb-home">GTF-Bot</Link>
              <ChevronRight size={13} />
              <Link href={getPageHref()} className="crumb-link current" data-testid="breadcrumb-current">{getPageTitle()}</Link>
            </div>
            <div className="top-actions">
              <NotificationBell />
              <ThemeToggle triggerIcon={Settings2} className="icon-btn" />
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
