import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

// Lightweight cookie helpers so middleware can detect an active session
// (localStorage is not readable in Next.js Edge middleware)
function setSessionCookie() {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  document.cookie = `leadpulse-session=1; expires=${expires}; path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie =
    "leadpulse-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        setSessionCookie();
        set({ user, accessToken, refreshToken });
      },

      setTokens: (accessToken, refreshToken) => {
        setSessionCookie();
        set({ accessToken, refreshToken });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearSessionCookie();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "leadpulse-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
