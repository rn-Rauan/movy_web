import type { AuthUser } from "./types";

export const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const ACCESS_KEY = "tt_access";
const REFRESH_KEY = "tt_refresh";
const USER_KEY = "tt_user";

export const tokenStorage = {
  get access() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  get user() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(tokens: { accessToken: string; refreshToken: string; user: AuthUser }) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Deduplicates concurrent refresh calls so only one request is made at a time
let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const refreshToken = tokenStorage.refresh;
  if (!refreshToken) throw new ApiError("Sem token de sessão", 401, null);
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    tokenStorage.clear();
    throw new ApiError("Sessão expirada. Faça login novamente.", res.status, null);
  }
  const data = await res.json();
  tokenStorage.set(data as Parameters<typeof tokenStorage.set>[0]);
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit & { auth?: boolean; _retry?: boolean } = {},
): Promise<T> {
  const { auth = true, _retry = false, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = tokenStorage.access;
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  // Attempt a single token refresh on 401, then retry the original request
  if (res.status === 401 && auth && !_retry) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    try {
      await refreshPromise;
      return api<T>(path, { ...init, _retry: true });
    } catch {
      // refresh failed — fall through and throw the original error
    }
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Erro ${res.status}`;
    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : String(message),
      res.status,
      data,
    );
  }
  return data as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
