/**
 * URL base da API. Definir em .env.development / .env.production
 * EXPO_PUBLIC_API_URL (Expo só expõe variáveis com EXPO_PUBLIC_)
 */
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000';
