import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { Shield, Loader2, Smartphone } from "lucide-react";
import type { AppRole } from "@/types/roles";
import { useIsMobile } from "@/hooks/use-mobile";

const Login = () => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect mobile devices to /mobile
  useEffect(() => {
    if (isMobile && !sessionStorage.getItem("sigeo_force_desktop")) {
      navigate("/mobile", { replace: true });
    }
  }, [isMobile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha email e senha.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authService.login({ email, password });
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as AppRole,
        unit: user.unit,
        avatar: user.avatar,
      });
      toast({ title: "Bem-vindo ao SIGEO", description: `Logado como ${user.name}` });
      if (user.role === "super_admin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch {
      // Fallback: modo demo com dados mock
      toast({
        title: "Modo demonstração",
        description: "Backend AWS não disponível. Usando dados mock.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Shield className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
            SIGEO
          </h1>
          <p className="text-primary-foreground/70 text-lg font-medium leading-relaxed max-w-md">
            Sistema Integrado de Gestão Operacional
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-primary-foreground/50 text-xs font-bold uppercase tracking-[0.2em]">
              Advances Solutions
            </span>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">SIGEO</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">Acesso ao Sistema</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Insira suas credenciais corporativas
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.nome@advances.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button type="button" className="text-xs text-accent hover:underline font-medium">
                  Esqueceu a senha?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Autenticando...
                </>
              ) : (
                "Entrar no SIGEO"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 Advances Solutions — Todos os direitos reservados.
          </p>

          <button
            type="button"
            onClick={() => navigate("/mobile")}
            className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Acessar versão mobile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
