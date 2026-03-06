import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.sigeo.advances.com.br",
  headers: { "Content-Type": "application/json" },
});

// Interceptor: injeta JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sigeo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata 401 (token expirado) globalmente
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sigeo_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
