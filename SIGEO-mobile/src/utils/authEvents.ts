/**
 * Eventos de autenticação - usado quando API retorna 401
 * Deslogar automaticamente quando token inválido (ex: conta desativada no Web)
 */
let onUnauthorizedCallback: (() => void) | null = null;

export const authEvents = {
  setOnUnauthorized: (fn: () => void) => {
    onUnauthorizedCallback = fn;
  },
  clearOnUnauthorized: () => {
    onUnauthorizedCallback = null;
  },
  notifyUnauthorized: () => {
    onUnauthorizedCallback?.();
  },
};
