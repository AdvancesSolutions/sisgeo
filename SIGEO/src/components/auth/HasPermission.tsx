import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldX } from "lucide-react";

interface HasPermissionProps {
  permission?: string;
  permissions?: string[]; // any of these
  role?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showDenied?: boolean;
}

/**
 * Conditionally renders children based on the current user's role/permissions.
 * If the user lacks access, renders nothing (or a fallback/denied state).
 */
const HasPermission = ({
  permission,
  permissions,
  role,
  children,
  fallback = null,
  showDenied = false,
}: HasPermissionProps) => {
  const { can, isRole } = useAuth();

  // Check role match
  if (role && !isRole(role as any)) {
    return showDenied ? <AccessDenied /> : <>{fallback}</>;
  }

  // Check single permission
  if (permission && !can(permission)) {
    return showDenied ? <AccessDenied /> : <>{fallback}</>;
  }

  // Check any of multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAny = permissions.some((p) => can(p));
    if (!hasAny) {
      return showDenied ? <AccessDenied /> : <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <ShieldX className="w-10 h-10 mb-3 text-danger/50" />
    <p className="text-sm font-medium">Acesso Negado</p>
    <p className="text-xs mt-1">Você não tem permissão para ver este conteúdo.</p>
  </div>
);

export default HasPermission;
