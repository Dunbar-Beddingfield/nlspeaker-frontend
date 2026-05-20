"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const TOKEN_KEY = "nlspeaker_admin_token";
const USER_KEY = "nlspeaker_admin_user";
const AUTH_EVENT = "nlspeaker-auth-change";

function readFromStorage(): { token: string | null; user: AdminUser | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  const user = token && raw ? (JSON.parse(raw) as AdminUser) : null;
  return { token, user };
}

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      const { token: t, user: u } = readFromStorage();
      setToken(t);
      setUser(u);
      setIsLoading(false);
    };

    sync();
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);

  const login = useCallback((accessToken: string, adminUser: AdminUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
    window.dispatchEvent(new Event(AUTH_EVENT));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
    router.push("/admin/login");
  }, [router]);

  return { token, user, isLoading, isAuthenticated: !!token, login, logout };
}
