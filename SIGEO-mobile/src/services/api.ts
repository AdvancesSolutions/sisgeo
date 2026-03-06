/**
 * API Unificada SIGEO
 * Usa SecureStore para token - persistência de login segura
 */
import * as SecureStore from "expo-secure-store";
import { authEvents } from "../utils/authEvents";
import { CONFIG } from "../config";

const TOKEN_KEY = "sigeo_token";

/** Token real para enviar ao servidor. Em modo demo não enviamos token. */
async function getToken(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (stored?.startsWith("demo-")) return null;
    return stored;
  } catch {
    return null;
  }
}

/** Lê o token bruto (inclui "demo-") para detectar modo demo no tratamento de 401. */
export async function getStoredTokenRaw(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

const DEFAULT_TIMEOUT_MS = 20000;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string>; timeoutMs?: number } = {}
): Promise<T> {
  const token = await getToken();
  const url = new URL(endpoint.startsWith("/") ? endpoint : `/${endpoint}`, CONFIG.API_BASE_URL);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timeout: servidor não respondeu. Verifique a conexão.");
    }
    throw err;
  }
  clearTimeout(timeoutId);

  if (res.status === 401) {
    const rawToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (rawToken?.startsWith("demo-")) {
      throw new Error("DEMO_MODE");
    }
    await clearToken();
    authEvents.notifyUnauthorized();
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) throw new Error(`API Error ${res.status}`);

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

type RequestOptions = { timeoutMs?: number };

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>, opts?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "GET", params, ...opts }),

  post: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...opts }),

  put: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined, ...opts }),

  patch: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...opts }),

  delete: <T>(endpoint: string, opts?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...opts }),
};
