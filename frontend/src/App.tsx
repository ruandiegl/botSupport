import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Router as WouterRouter, Link, useLocation } from "wouter";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SocketProvider } from "@/lib/socket-context";
import { Shell } from "@/app/Shell";
import LoginPage from "@/pages/login";
import QueuePage from "@/pages/queue";
import ConversationPage from "@/pages/conversation";
import MyConversationsPage from "@/pages/my-conversations";
import ContactsPage from "@/pages/contacts";
import DepartmentAdmin from "@/pages/admin/departments";
import AgentsAdmin from "@/pages/admin/agents";
import FlowAdmin from "@/pages/admin/flow";
import ZApiAdmin from "@/pages/admin/zapi";
import RbacAdmin from "@/pages/admin/rbac";
import ShortcutsAdmin from "@/pages/admin/shortcuts";
import LabelsAdmin from "@/pages/admin/labels";
import BotExclusionsAdmin from "@/pages/admin/bot-exclusions";
import BusinessHoursAdmin from "@/pages/admin/business-hours";
import "@/styles.css";

function NotFoundPage() {
  return (
    <div className="content">
      <div className="panel empty-state">
        <X size={28} />
        <h3>Página não encontrada</h3>
        <p className="subtle">Este caminho não existe no GTF-Bot.</p>
        <Link
          className="btn btn-primary"
          href="/"
          style={{ marginTop: 15 }}
          data-testid="link-back-home"
        >
          Voltar para a fila
        </Link>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component, screen }: { component: React.ComponentType; screen?: string }) {
  const { isAuthenticated, canViewScreen, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Carregando sessão...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (screen && !canViewScreen(screen)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-card text-card-foreground border border-border rounded-2xl">
        <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Você não possui permissão para acessar esta tela.
        </p>
        <Link href="/" className="btn btn-primary">
          Voltar para a Fila
        </Link>
      </div>
    );
  }

  return <Component />;
}

/** Keep old bookmarks working while the standalone groups screen is retired. */
function GroupsRedirect() {
  const [, setLocation] = useLocation();
  React.useEffect(() => setLocation("/"), [setLocation]);
  return null;
}

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={28} />
        <span>Inicializando GTF-Bot...</span>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route>
        {() => (
          <Shell>
            <Switch>
              <Route path="/">
                {() => <ProtectedRoute component={QueuePage} />}
              </Route>
              <Route path="/conversation/:id">
                {() => <ProtectedRoute component={ConversationPage} />}
              </Route>
              <Route path="/my-conversations">
                {() => <ProtectedRoute component={MyConversationsPage} />}
              </Route>
              <Route path="/contacts">
                {() => <ProtectedRoute component={ContactsPage} screen="/contacts" />}
              </Route>
              <Route path="/groups">
                {() => <ProtectedRoute component={GroupsRedirect} />}
              </Route>
              <Route path="/admin/departments">
                {() => <ProtectedRoute component={DepartmentAdmin} screen="/admin/departments" />}
              </Route>
              <Route path="/admin/agents">
                {() => <ProtectedRoute component={AgentsAdmin} screen="/admin/agents" />}
              </Route>
              <Route path="/admin/flow">
                {() => <ProtectedRoute component={FlowAdmin} screen="/admin/flow" />}
              </Route>
              <Route path="/admin/shortcuts">
                {() => <ProtectedRoute component={ShortcutsAdmin} screen="/admin/shortcuts" />}
              </Route>
              <Route path="/admin/labels">
                {() => <ProtectedRoute component={LabelsAdmin} screen="/admin/labels" />}
              </Route>
              <Route path="/admin/bot-exclusions">
                {() => <ProtectedRoute component={BotExclusionsAdmin} screen="/admin/bot-exclusions" />}
              </Route>
              <Route path="/admin/business-hours">
                {() => <ProtectedRoute component={BusinessHoursAdmin} screen="/admin/business-hours" />}
              </Route>
              <Route path="/admin/zapi">
                {() => <ProtectedRoute component={ZApiAdmin} screen="/admin/zapi" />}
              </Route>
              <Route path="/admin/rbac">
                {() => <ProtectedRoute component={RbacAdmin} screen="/admin/rbac" />}
              </Route>
              <Route component={NotFoundPage} />
            </Switch>
          </Shell>
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
