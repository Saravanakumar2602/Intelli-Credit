import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/services/auth.service";
import {
  onAuthFailure,
  TOKEN_STORAGE_KEY,
  REFRESH_STORAGE_KEY,
} from "@/services/api";
import type { LoginRequest, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  /** Local-only fake sign-in for UI development. Remove once auth is wired. */
  devSignIn: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEV_USER: User = {
  id: "dev-user",
  email: "you@intellicredit.dev",
  full_name: "Preview User",
  role: "credit_officer",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Rehydrate on mount.
  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
      // In dev / no-backend mode we synthesize a user profile so protected
      // routes render. Replace with authService.me() once backend is up.
      const cached = window.localStorage.getItem("ic.auth.user");
      setUser(cached ? (JSON.parse(cached) as User) : DEV_USER);
    }
    setIsBootstrapping(false);
  }, []);

  // Global 401 handler
  useEffect(() => {
    const unsubscribe = onAuthFailure(() => {
      setToken(null);
      setUser(null);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    // When backend is wired, this uses authService.login.
    // For now we synthesize a session so the UI is fully explorable.
    try {
      const tokens = await authService.login(payload);
      window.localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
      if (tokens.refresh_token) {
        window.localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token);
      }
      const me = await authService.me();
      window.localStorage.setItem("ic.auth.user", JSON.stringify(me));
      setToken(tokens.access_token);
      setUser(me);
    } catch (err) {
      // Preview fallback: allow entering the app in UI-only mode.
      const previewToken = "preview-token";
      const previewUser: User = { ...DEV_USER, email: payload.email || DEV_USER.email };
      window.localStorage.setItem(TOKEN_STORAGE_KEY, previewToken);
      window.localStorage.setItem("ic.auth.user", JSON.stringify(previewUser));
      setToken(previewToken);
      setUser(previewUser);
      // Surface real error only once wiring exists; swallow in UI-only mode.
      void err;
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(REFRESH_STORAGE_KEY);
    window.localStorage.removeItem("ic.auth.user");
    setToken(null);
    setUser(null);
    void authService.logout().catch(() => {});
  }, []);

  const devSignIn = useCallback(() => {
    const previewToken = "preview-token";
    window.localStorage.setItem(TOKEN_STORAGE_KEY, previewToken);
    window.localStorage.setItem("ic.auth.user", JSON.stringify(DEV_USER));
    setToken(previewToken);
    setUser(DEV_USER);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      logout,
      devSignIn,
    }),
    [user, token, isBootstrapping, login, logout, devSignIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
