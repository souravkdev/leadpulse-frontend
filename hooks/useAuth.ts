"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { LoginCredentials } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, setAuth, setUser, logout: storeLogout } = useAuthStore();

  async function login(credentials: LoginCredentials) {
    const { data: tokens } = await api.post("/auth/login", credentials);
    const { data: me } = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    setAuth(me, tokens.access_token, tokens.refresh_token);
    const redirectTo = searchParams.get("from") ?? "/dashboard";
    router.push(redirectTo);
  }

  async function logout() {
    storeLogout();
    router.push("/login");
  }

  async function fetchMe() {
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data;
  }

  return {
    user,
    isAuthenticated: !!accessToken,
    login,
    logout,
    fetchMe,
  };
}
