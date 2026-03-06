/**
 * AuthContext - Persistência de Login com SecureStore
 * Token criptografado no dispositivo - perfil (role) para navegação condicional (gestor vs técnico)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { authEvents } from "../utils/authEvents";
import type { AuthUser } from "../services/authService";

const TOKEN_KEY = "sigeo_token";
const ROLE_KEY = "sigeo_user_role";

type AuthRole = AuthUser["role"];

function normalizeRole(value: string | undefined): AuthRole {
  const s = String(value ?? "").toLowerCase();
  if (s === "super_admin" || s === "admin" || s === "administrador") return "super_admin";
  if (s === "manager" || s === "gestor") return "manager";
  return "technician";
}

function toAuthUser(raw: { id?: string; email?: string; name?: string; nome?: string; role?: string; perfil?: string; tipo?: string; avatar?: string; iniciais?: string }): AuthUser {
  const role = normalizeRole(raw.role ?? raw.perfil ?? raw.tipo);
  return {
    id: String(raw.id ?? ""),
    email: String(raw.email ?? ""),
    name: String(raw.name ?? raw.nome ?? ""),
    role,
    avatar: raw.avatar ?? raw.iniciais,
  };
}

interface AuthContextType {
  userToken: string | null;
  userProfile: AuthUser | null;
  isLoading: boolean;
  signIn: (token: string, user?: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(ROLE_KEY);
      setUserToken(null);
      setUserProfile(null);
    } catch (e) {
      console.warn("Erro ao remover o token", e);
    }
  }, []);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch (e) {
        console.warn("Erro ao recuperar o token", e);
      }
      setUserToken(token);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { authService: auth } = await import("../services/authService");
        const raw = await auth.me() as Record<string, unknown>;
        const profile = toAuthUser(raw as Parameters<typeof toAuthUser>[0]);
        setUserProfile(profile);
        try { await SecureStore.setItemAsync(ROLE_KEY, profile.role); } catch { /* ignore */ }
      } catch {
        try {
          const storedRole = await SecureStore.getItemAsync(ROLE_KEY);
          if (storedRole && ["manager", "super_admin", "admin", "technician"].includes(storedRole)) {
            const role = storedRole === "admin" ? "super_admin" : storedRole;
            setUserProfile({ id: "", email: "", name: "", role: role as AuthUser["role"] });
          } else {
            setUserProfile(null);
          }
        } catch {
          setUserProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    authEvents.setOnUnauthorized(() => signOut());
    return () => authEvents.clearOnUnauthorized();
  }, [signOut]);

  const signIn = useCallback(async (token: string, user?: AuthUser | Record<string, unknown>) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (user) {
        const profile = toAuthUser(user as Parameters<typeof toAuthUser>[0]);
        setUserProfile(profile);
        try { await SecureStore.setItemAsync(ROLE_KEY, profile.role); } catch { /* ignore */ }
      }
      setUserToken(token);
    } catch (e) {
      console.warn("Erro ao salvar o token", e);
    }
  }, []);

  const getToken = useCallback(async () => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  const value: AuthContextType = {
    userToken,
    userProfile,
    isLoading,
    signIn,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
