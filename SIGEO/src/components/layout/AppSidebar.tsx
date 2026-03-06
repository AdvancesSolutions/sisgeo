import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users, Clock, CheckCircle, Package,
  MapPin, BarChart3, Settings, Shield, ChevronLeft, ChevronRight, Wrench,
  FileCode, AlertOctagon, BookOpen, ExternalLink, Moon, Sun, Crown,
} from "lucide-react";
import OfflineSyncIndicator from "@/components/ui/OfflineSyncIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Each menu item declares what permission(s) are needed to see it
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", permissions: [] }, // everyone
  { icon: ClipboardList, label: "Ordens de Serviço", path: "/tasks", permissions: ["manage_tasks", "view_own_tasks"] },
  { icon: CheckCircle, label: "Validação", path: "/validation", permissions: ["validate_tasks"] },
  { icon: Users, label: "Funcionários", path: "/employees", permissions: ["manage_employees"] },
  { icon: Clock, label: "Controle de Ponto", path: "/timeclock", permissions: ["manage_timeclock", "checkin_checkout"] },
  { icon: MapPin, label: "Locais & Áreas", path: "/locations", permissions: ["manage_tasks", "view_all_units"] },
  { icon: Package, label: "Materiais", path: "/materials", permissions: ["manage_materials", "request_materials"] },
  { icon: BookOpen, label: "Base de Conhecimento", path: "/knowledge", permissions: [] }, // everyone
  { icon: BarChart3, label: "Relatórios", path: "/reports", permissions: ["view_reports", "view_all_units"] },
  { icon: Crown, label: "Painel Admin", path: "/admin", permissions: ["manage_settings"] },
  { icon: Shield, label: "Auditoria", path: "/audit", permissions: ["view_audit"] },
  { icon: Settings, label: "Configurações", path: "/settings", permissions: ["manage_settings", "manage_employees"] },
  { icon: FileCode, label: "Arquitetura", path: "/architecture", permissions: ["manage_settings"] },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, can, switchRole } = useAuth();

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Filter menu items based on user permissions
  const visibleItems = menuItems.filter((item) => {
    if (item.permissions.length === 0) return true; // no restriction
    return item.permissions.some((p) => can(p));
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar flex flex-col border-r border-sidebar-border z-50 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in">
            <span className="font-display font-bold text-lg text-sidebar-accent-foreground tracking-tight">
              SIGEO
            </span>
            <span className="block text-[10px] text-sidebar-muted uppercase tracking-widest">
              Gestão Operacional Integrada
            </span>
          </div>
        )}
      </div>

      {/* Emergency button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => navigate("/incident")}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-danger/15 text-danger hover:bg-danger/25 transition-colors font-medium text-sm ${
            collapsed ? "justify-center" : ""
          }`}
          title="Reportar Ocorrência"
        >
          <AlertOctagon className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="animate-slide-in">Ocorrência</span>}
        </button>
      </div>

      {/* Navigation — permission-filtered */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive ? "sidebar-item-active w-full" : "sidebar-item-inactive w-full"}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="animate-slide-in">{item.label}</span>}
            </button>
          );
        })}

        {/* Customer portal — visible to managers & admins */}
        {(can("manage_tasks") || can("view_all_units")) && (
          <button
            onClick={() => navigate("/portal")}
            className="sidebar-item-inactive w-full"
            title={collapsed ? "Portal do Cliente" : undefined}
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="animate-slide-in">Portal do Cliente</span>}
          </button>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
        {/* Current user info */}
        {!collapsed && (
          <div className="px-2 py-2 bg-sidebar-accent/5 rounded-lg mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-[10px] font-bold text-sidebar-primary-foreground">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-sidebar-muted truncate">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </div>
        )}

        {/* DEV: Role Switcher */}
        {!collapsed && (
          <div className="px-1">
            <Select value={user.role} onValueChange={(v) => switchRole(v as any)}>
              <SelectTrigger className="h-8 text-[11px] bg-sidebar-accent/10 border-sidebar-border text-sidebar-accent-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">🔴 Super Admin</SelectItem>
                <SelectItem value="manager">🟡 Gestor</SelectItem>
                <SelectItem value="technician">🟢 Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-center">
          <OfflineSyncIndicator compact={collapsed} />
        </div>

        <button
          onClick={toggleDarkMode}
          className="sidebar-item-inactive w-full justify-center"
          title={isDark ? "Modo claro" : "Modo escuro"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item-inactive w-full justify-center"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Recolher</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
