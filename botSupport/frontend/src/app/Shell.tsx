import React, { useState, createContext, useContext } from "react";
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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { Conversation, Agent } from "@/types";

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

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">TF</div>
      <div>
        <div className="brand-name">GTF·Bot</div>
        <div className="brand-kicker">Torre Forte / Operação</div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin, isAuthenticated } = useAuth();

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
      }
    : agents[0] || null;

  const setActiveAgentId = (_id: string) => {};

  // Buscar lista de conversas reais para contagem da fila
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => apiFetch<Conversation[]>("/conversations"),
    enabled: isAuthenticated,
    refetchInterval: 3000, // Revalidação a cada 3s para fila em tempo real
  });

  const queueCount = (conversations || []).filter((item) => item.status === "QUEUED").length;

  const nav = [
    { href: "/", label: "Fila de atendimento", icon: MessageCircle, badge: queueCount || undefined },
    { href: "/my-conversations", label: "Meus atendimentos", icon: Headphones },
  ];

  const admin = [
    { href: "/admin/departments", label: "Departamentos", icon: LayoutDashboard },
    { href: "/admin/agents", label: "Atendentes", icon: Users },
    { href: "/admin/flow", label: "Fluxo do bot", icon: Bot },
    { href: "/admin/zapi", label: "Conexão Z-API", icon: Radio },
  ];

  const getPageTitle = () => {
    if (location === "/") return "Fila de atendimento";
    if (location.includes("conversation")) return "Conversa";
    if (location.includes("departments")) return "Departamentos";
    if (location.includes("agents")) return "Atendentes";
    if (location.includes("flow")) return "Fluxo do bot";
    if (location.includes("zapi")) return "Conexão Z-API";
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
          <Logo />
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

          {isAdmin && (
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
            <button
              onClick={handleLogout}
              title="Sair da plataforma"
              className="icon-btn text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="crumb">
              <button
                className="icon-btn mobile-menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="button-open-menu"
              >
                <Menu size={16} />
              </button>
              <span>GTF-Bot</span>
              <ChevronRight size={13} />
              <strong>{getPageTitle()}</strong>
            </div>
            <div className="top-actions">
              <button className="icon-btn" data-testid="button-help">
                <HelpCircle size={16} />
              </button>
              <button className="icon-btn" data-testid="button-settings">
                <Settings2 size={16} />
              </button>
              <div className="avatar coral" style={{ width: 32, height: 32 }}>
                {getInitials(activeAgent?.name || "AT")}
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ height: 32, fontSize: 12, padding: "0 10px" }}
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </AgentContext.Provider>
  );
}
