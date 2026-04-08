"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthUser = {
  sub: string;
  email: string;
  fullName: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  isAdmin: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "user";
const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    setReady(true);
  }, []);

  const login = useCallback((accessToken: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const value = useMemo(
    () => ({ user, ready, isAdmin, login, logout }),
    [user, ready, isAdmin, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth внутри AuthProvider");
  return ctx;
}
