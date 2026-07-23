import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Centralized Axios client.
 * All service modules import `api` from here.
 * Backend base URL is read from VITE_API_URL at build time.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api/v1";

export const TOKEN_STORAGE_KEY = "ic.auth.token";
export const REFRESH_STORAGE_KEY = "ic.auth.refresh";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ————— Request interceptor: attach JWT
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ————— Response interceptor: normalize + handle 401
type AuthFailureListener = () => void;
const authFailureListeners = new Set<AuthFailureListener>();

export function onAuthFailure(fn: AuthFailureListener) {
  authFailureListeners.add(fn);
  return () => authFailureListeners.delete(fn);
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(REFRESH_STORAGE_KEY);
      }
      authFailureListeners.forEach((fn) => fn());
    }
    return Promise.reject(error);
  },
);

/** Utility: unwrap Axios error messages into a UI-friendly string. */
export function toErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: string; message?: string } | undefined;
    return data?.detail ?? data?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
