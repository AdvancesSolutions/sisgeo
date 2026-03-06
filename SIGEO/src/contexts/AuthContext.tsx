import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type AppRole, type UserProfile, MOCK_CURRENT_USER, hasPermission } from "@/types/roles";

interface AuthContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  can: (permission: string) => boolean;
  isRole: (role: AppRole) => boolean;
  isAuthenticated: boolean;
  logout: () => void;
  switchRole: (role: AppRole) => void; // dev-only for testing
}

const defaultContext: AuthContextType = {
  user: MOCK_CURRENT_USER,
  setUser: () => {},
  can: (permission: string) => hasPermission(MOCK_CURRENT_USER.role, permission),
  isRole: (role: AppRole) => MOCK_CURRENT_USER.role === role,
  isAuthenticated: false,
  logout: () => {},
  switchRole: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(MOCK_CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("sigeo_token"));

  useEffect(() => {
    const stored = localStorage.getItem("sigeo_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const handleSetUser = (u: UserProfile) => {
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem("sigeo_user", JSON.stringify(u));
  };

  const logout = () => {
    localStorage.removeItem("sigeo_token");
    localStorage.removeItem("sigeo_user");
    setIsAuthenticated(false);
    setUser(MOCK_CURRENT_USER);
  };

  const can = (permission: string) => hasPermission(user.role, permission);
  const isRole = (role: AppRole) => user.role === role;

  const switchRole = (role: AppRole) => {
    const profiles: Record<AppRole, UserProfile> = {
      super_admin: {
        id: "USR-001", email: "admin@sigeo.com.br", name: "Admin SIGEO",
        role: "super_admin", avatar: "AS",
      },
      manager: {
        id: "USR-002", email: "gestor@sigeo.com.br", name: "Ricardo Mendes",
        role: "manager", unit: "Unidade Centro", avatar: "RM",
      },
      technician: {
        id: "USR-003", email: "tecnico@sigeo.com.br", name: "João Santos",
        role: "technician", unit: "Unidade Centro", avatar: "JS",
      },
    };
    setUser(profiles[role]);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, can, isRole, isAuthenticated, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
