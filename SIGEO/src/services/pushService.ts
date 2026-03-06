import { PushNotifications } from "@capacitor/push-notifications";
import { toast } from "@/hooks/use-toast";
import { isNotificationAllowed } from "@/services/notificationPrefs";

export const pushService = {
  /**
   * Registra o dispositivo para push notifications.
   * Retorna o token FCM/APNs para enviar ao backend AWS.
   */
  register: async (): Promise<string | null> => {
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== "granted") {
        toast({ title: "Notificações bloqueadas", description: "Ative nas configurações do dispositivo.", variant: "destructive" });
        return null;
      }

      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener("registration", (token) => {
          console.log("[SIGEO Push] Token:", token.value);
          resolve(token.value);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("[SIGEO Push] Erro no registro:", err);
          resolve(null);
        });
      });
    } catch {
      // Web fallback — Capacitor não disponível
      console.warn("[SIGEO Push] Capacitor não disponível, usando fallback web");
      return null;
    }
  },

  /**
   * Configura listeners para notificações recebidas e clicadas.
   */
  setupListeners: (onNotification: (data: Record<string, unknown>) => void) => {
    try {
      // Notificação recebida com app aberto
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        const notifType = (notification.data as Record<string, unknown>)?.type as string | undefined;
        
        // Filtra com base nas preferências do usuário
        if (!isNotificationAllowed(notifType)) {
          console.log("[SIGEO Push] Notificação filtrada por preferências:", notifType);
          return;
        }

        console.log("[SIGEO Push] Recebida:", notification);
        toast({
          title: notification.title || "SIGEO",
          description: notification.body || "Nova notificação",
        });
        onNotification(notification.data || {});
      });

      // Notificação clicada (app em background)
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("[SIGEO Push] Ação:", action);
        onNotification(action.notification.data || {});
      });
    } catch {
      console.warn("[SIGEO Push] Listeners não disponíveis no web");
    }
  },

  /**
   * Envia o token para o backend AWS para associar ao usuário.
   */
  sendTokenToBackend: async (token: string, userId: string) => {
    try {
      const { default: api } = await import("@/services/api");
      await api.post("/push/register", { token, platform: getPlatform() });
    } catch (err) {
      console.error("[SIGEO Push] Erro ao registrar token no backend:", err);
    }
  },

  removeAllListeners: () => {
    try {
      PushNotifications.removeAllListeners();
    } catch {
      // ignore on web
    }
  },
};

function getPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  return "web";
}
