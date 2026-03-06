/**
 * SIGEO Mobile - Configuração
 * API unificada: mesma base que o SIGEO Web
 *
 * No celular, use o IP do seu PC (não localhost). Ex: EXPO_PUBLIC_API_URL=http://192.168.1.5:3000
 */
export const CONFIG = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL?.trim() || "https://api.sigeo.advances.com.br",
  USE_MOCK_WHEN_OFFLINE: true,
} as const;
