import { api } from "./api";
import type { AuthTokens, LoginRequest, User } from "@/types";

export const authService = {
  async login(payload: LoginRequest): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/login/", payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout/");
    } catch {
      // Ignore if logout route doesn't exist on backend
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post("/auth/password-reset-request/", { email });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/refresh/", {
      refresh_token: refreshToken,
    });
    return data;
  },
};
