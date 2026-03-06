// ============================================================
// SIGEO - RBAC Role Definitions
// Sistema Integrado de Gestão Operacional
// ============================================================

export type AppRole = "super_admin" | "manager" | "technician";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  unit?: string; // null for super_admin (global access)
  avatar?: string;
  skills?: string[];
  phone?: string;
  createdAt?: string;
}

// Permission matrix
export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  super_admin: [
    "manage_managers",
    "manage_settings",
    "view_all_units",
    "view_billing",
    "view_audit",
    "manage_integrations",
    "manage_tasks",
    "validate_tasks",
    "manage_employees",
    "manage_timeclock",
    "manage_materials",
  ],
  manager: [
    "manage_tasks",
    "validate_tasks",
    "manage_employees",
    "manage_timeclock",
    "manage_materials",
    "view_reports",
  ],
  technician: [
    "view_own_tasks",
    "checkin_checkout",
    "fill_checklist",
    "upload_photos",
    "request_materials",
  ],
};

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  manager: "Gestor de Unidade",
  technician: "Técnico",
};

export const SKILL_OPTIONS = [
  "Elétrica",
  "Hidráulica",
  "Limpeza",
  "Manutenção Geral",
  "HVAC / Ar-Condicionado",
  "Pintura",
  "Redes / TI",
  "Jardinagem",
  "Segurança",
  "Inspeção",
];

// Helper to check permissions
export const hasPermission = (role: AppRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

// Mock current user — will be replaced by auth context
export const MOCK_CURRENT_USER: UserProfile = {
  id: "USR-001",
  email: "admin@sigeo.com.br",
  name: "Admin SIGEO",
  role: "super_admin",
  avatar: "AS",
};
