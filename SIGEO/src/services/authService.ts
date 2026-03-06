import api from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "super_admin" | "manager" | "technician";
    unit?: string;
    avatar?: string;
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    localStorage.setItem("sigeo_token", data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem("sigeo_token");
    window.location.href = "/login";
  },

  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};
