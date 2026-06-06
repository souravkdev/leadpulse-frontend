import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "default" | "blue" | "green" | "purple";
export type ColorMode = "light" | "dark";

interface ThemeState {
  theme: ThemeName;
  mode: ColorMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ColorMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "default",
      mode: "light",
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
    }),
    { name: "leadpulse-theme" }
  )
);