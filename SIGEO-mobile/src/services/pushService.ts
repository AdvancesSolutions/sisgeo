/**
 * Sistema de Notificações Push — SIGEO "vivo"
 * Token enviado para a AWS (tabela employees); quando o Gestor lança uma O.S., o técnico recebe push.
 * Expo Go: módulo não carregado para evitar avisos; em build de desenvolvimento/produção usa Expo Notifications.
 */
import { Platform, Alert } from "react-native";
import Constants from "expo-constants";
import { api } from "./api";

const isExpoGo = Constants.appOwnership === "expo";

export const pushService = {
  /**
   * Regista o dispositivo para push: permissões → token Expo → envia para o backend (AWS).
   * Handler em foreground: alerta + som; badge opcional.
   */
  async register(): Promise<string | null> {
    if (isExpoGo) return null;
    try {
      const Notifications = await import("expo-notifications");

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
        }),
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Tarefas SIGEO",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Notificações", "Ative as notificações para receber novas ordens de serviço em tempo real.");
        return null;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? undefined,
      });
      return token ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Envia o token para o backend (RDS/AWS) vinculado ao utilizador logado.
   * Endpoint: POST /users/me/push-token ou POST /users/push-token conforme API.
   */
  async sendTokenToBackend(token: string, _userId: string): Promise<void> {
    try {
      await api.post("/users/me/push-token", { token, platform: Platform.OS });
    } catch {
      // Silencioso — backend pode ainda não expor o endpoint
    }
  },

  addNotificationReceivedListener(cb: (n: { request: { content: { data?: Record<string, unknown> } } }) => void) {
    if (isExpoGo) return Promise.resolve({ remove: () => {} });
    return import("expo-notifications")
      .then((Notifications) => Notifications.addNotificationReceivedListener(cb))
      .catch(() => ({ remove: () => {} }));
  },

  addNotificationResponseListener(
    cb: (r: { notification: { request: { content: { data?: Record<string, unknown> } } } }) => void
  ) {
    if (isExpoGo) return Promise.resolve({ remove: () => {} });
    return import("expo-notifications")
      .then((Notifications) => Notifications.addNotificationResponseReceivedListener(cb))
      .catch(() => ({ remove: () => {} }));
  },

  /** Quando o app abre ao toque na notificação (ex.: app estava em background/killed). */
  async getLastNotificationResponseAsync(): Promise<{ notification: { request: { content: { data?: Record<string, unknown> } } } } | null> {
    if (isExpoGo) return null;
    try {
      const Notifications = await import("expo-notifications");
      return await Notifications.getLastNotificationResponseAsync();
    } catch {
      return null;
    }
  },
};
