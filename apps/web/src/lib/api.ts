import axios from 'axios';

// Em produção (Amplify) defina VITE_API_URL nas variáveis de ambiente do app (URL HTTPS, ex.: CloudFront).
let baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : undefined);
// Evita Mixed Content: se a página é HTTPS, a API também deve ser HTTPS.
if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && baseURL?.startsWith('http://')) {
  baseURL = baseURL.replace(/^http:\/\//i, 'https://');
}

export const api = axios.create({
  baseURL: baseURL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Uma única renovação por vez: evita várias chamadas a /auth/refresh quando várias requisições retornam 401 juntas.
let refreshPromise: Promise<string | null> | null = null;

function doRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return Promise.resolve(null);
  return axios
    .post<{ accessToken: string; refreshToken?: string }>(`${baseURL}/auth/refresh`, { refreshToken: refresh })
    .then(({ data }) => {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    })
    .catch(() => null);
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);

    orig._retry = true;

    if (!refreshPromise) refreshPromise = doRefresh();
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      orig.headers.Authorization = `Bearer ${newToken}`;
      return api(orig);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return Promise.reject(err);
  }
);

export default api;
