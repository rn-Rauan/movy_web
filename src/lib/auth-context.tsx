import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStorage } from "./api";
import type { AuthUser } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    telephone: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(tokenStorage.user);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    tokenStorage.set(res);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (input: { name: string; email: string; password: string; telephone: string }) => {
      const res = await api<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify(input),
      });
      tokenStorage.set(res);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
