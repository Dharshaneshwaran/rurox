"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role, User } from "@/lib/types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

export const setStoredAuth = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const useAuth = (options?: { role?: Role; redirectTo?: string }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const loading = false;

  useEffect(() => {
    if (options?.role && user?.role !== options.role) {
      router.push(options.redirectTo ?? "/");
      return;
    }

    if (!user && options?.redirectTo) {
      router.push(options.redirectTo);
    }
  }, [options?.role, options?.redirectTo, router, user]);

  const clear = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  return { user, token, loading, clear };
};
