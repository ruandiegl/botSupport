import React, { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      className="login-screen min-h-screen w-full flex items-center justify-center p-4 relative"
    >
      {/* Botão flutuante de ajuda no canto inferior direito */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        title="Ajuda"
        className="login-help fixed bottom-6 right-6 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors cursor-pointer z-50"
      >
        ?
      </Button>

      {/* Card principal dividido em 2 colunas */}
      <div className="login-panel w-full max-w-[880px] min-h-[490px] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* COLUNA ESQUERDA - PAINEL ESCURO DE BRANDING */}
        <div className="login-brand-panel p-9 flex flex-col justify-between relative overflow-hidden">
          
          {/* Logo do Grupo Torre Forte */}
          <div>
            <img
              src="/grupogtf-logo.svg"
              alt="Grupo GTF — Torre Forte"
              className="block w-[196px] h-auto max-w-full"
            />
          </div>

          {/* Título Principal */}
          <div className="my-8">
            <div className="text-[11px] font-mono font-semibold text-blue-400 tracking-[0.2em] uppercase mb-3">
              GTF-BOT
            </div>
            <h1 className="text-3xl lg:text-[31px] font-black tracking-tight leading-[1.12] uppercase font-sans">
              <span className="text-[#2D89C8]">
                CENTRAL DE<br />
                ATENDIMENTO
              </span>
              <br />
              <span className="text-white">TORRE FORTE</span>
            </h1>
          </div>

          {/* Rodapé da Coluna Esquerda */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span>Torre Forte - Operações</span>
          </div>
        </div>

        {/* COLUNA DIREITA - FORMULÁRIO BRANCO */}
        <div className="bg-white p-9 flex flex-col justify-center relative">
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Entrar no painel
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Área restrita. Acesso somente para colaboradores.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-600 text-xs font-medium animate-fadeIn">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Campo E-mail */}
            <div className="mb-4">
              <label htmlFor="email-input" className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
                EMAIL
              </label>
              <Input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#F0F4F9] hover:bg-[#E8EEF5] focus:bg-white border border-transparent focus:border-blue-600 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400/70 transition-all outline-none font-medium"
                data-testid="input-login-email"
              />
            </div>

            {/* Campo Senha */}
            <div className="mb-2">
              <label htmlFor="password-input" className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
                SENHA
              </label>
              <div className="relative w-full">
                <Input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-[#F0F4F9] hover:bg-[#E8EEF5] focus:bg-white border border-transparent focus:border-blue-600 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400/70 transition-all outline-none font-medium"
                  data-testid="input-login-password"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            {/* Link Esqueci minha senha */}
            <div className="text-right mb-5">
              <a
                href="#esqueci-senha"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Entre em contato com o suporte interno para redefinir sua senha.");
                }}
                className="text-xs text-blue-600 font-medium hover:underline inline-block"
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Botão Entrar */}
            <Button
              variant="default"
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="button-login-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar com email e senha</span>
              )}
            </Button>
          </form>

          {/* Divisor */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="px-3 text-[11px] text-slate-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Rodapé / Suporte */}
          <div className="text-center text-xs text-slate-400 font-medium">
            Problemas para acessar?{" "}
            <Button
              variant="link"
              size="sm"
              type="button"
              onClick={() => alert("Suporte Interno Torre Forte: admin@torreforte.org (Senha padrão: admin123)")}
              className="text-[#2563EB] font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              Fale com o suporte interno
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}
