import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Router as WouterRouter, Link, useLocation } from "wouter";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Shell } from "@/app/Shell";
import LoginPage from "@/pages/login";
import QueuePage from "@/pages/queue";
import ConversationPage from "@/pages/conversation";
import MyConversationsPage from "@/pages/my-conversations";
import DepartmentAdmin from "@/pages/admin/departments";
import AgentsAdmin from "@/pages/admin/agents";
import FlowAdmin from "@/pages/admin/flow";
import ZApiAdmin from "@/pages/admin/zapi";
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

function ProtectedRoute({ component: Component, requireAdmin = false }: { component: React.ComponentType; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Carregando sessão...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-400 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Acesso Restrito</h2>
        <p className="text-sm text-slate-400 mb-6">
          Esta área é restrita a administradores. Entre em contato com a gestão de T.I. para solicitar acesso.
        </p>
        <Link href="/" className="btn btn-primary">
          Voltar para a Fila
        </Link>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
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
              <Route path="/admin/departments">
                {() => <ProtectedRoute component={DepartmentAdmin} requireAdmin />}
              </Route>
              <Route path="/admin/agents">
                {() => <ProtectedRoute component={AgentsAdmin} requireAdmin />}
              </Route>
              <Route path="/admin/flow">
                {() => <ProtectedRoute component={FlowAdmin} requireAdmin />}
              </Route>
              <Route path="/admin/zapi">
                {() => <ProtectedRoute component={ZApiAdmin} requireAdmin />}
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
        <WouterRouter>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
