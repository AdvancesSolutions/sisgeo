import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldX } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[]; // any of these grants access
}

/**
 * Route-level guard. Redirects unauthorized users to dashboard.
 * This is the server-side-equivalent safety net — even if a user
 * manually types a URL, they get blocked before the page renders.
 */
const ProtectedRoute = ({ children, permission, permissions }: ProtectedRouteProps) => {
  const { can } = useAuth();

  // No permission required — accessible to all authenticated users
  if (!permission && (!permissions || permissions.length === 0)) {
    return <>{children}</>;
  }

  // Single permission check
  if (permission && can(permission)) {
    return <>{children}</>;
  }

  // Any-of check
  if (permissions && permissions.some((p) => can(p))) {
    return <>{children}</>;
  }

  // Blocked — show denied page inside layout
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-5">
          <ShieldX className="w-8 h-8 text-danger" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Você não tem permissão para acessar esta página. 
          Entre em contato com o administrador do sistema se acredita que isto é um erro.
        </p>
        <a href="/" className="mt-6 text-sm font-semibold text-primary hover:underline">
          ← Voltar ao Dashboard
        </a>
      </div>
    </AppLayout>
  );
};

export default ProtectedRoute;
