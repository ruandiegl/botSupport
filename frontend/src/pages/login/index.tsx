import React, { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, ShieldAlert, Loader2, Bot } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Erro ao efetuar login. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
            <Bot size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-50">GTF-Bot Suporte</h1>
          <p className="text-sm text-slate-400 mt-1">Plataforma de Atendimento via WhatsApp</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              E-mail do Atendente
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@torreforte.org"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Acessar Plataforma</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            Dica de Login Inicial: <span className="text-cyan-400">admin@torreforte.org</span> / <span className="text-cyan-400">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
