/**
 * Autenticação Única (SSO)
 * Token persistido via AuthContext + SecureStore
 */
import * as SecureStore from "expo-secure-store";
import { api } from "./api";

const TOKEN_KEY = "sigeo_token";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "manager" | "technician";
  unit?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const LOGIN_TIMEOUT_MS = 12000;

export const authService = {
  async login(email: string, password: string, options?: { timeoutMs?: number }): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>(
      "/auth/login",
      { email, password },
      { timeoutMs: options?.timeoutMs ?? LOGIN_TIMEOUT_MS }
    );
    return data;
  },

  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  async getStoredUser(): Promise<AuthUser | null> {
    return null;
  },

  async me(): Promise<AuthUser> {
    return api.get<AuthUser>("/auth/me");
  },

  async hasToken(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },
};
