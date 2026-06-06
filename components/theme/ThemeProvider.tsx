"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

const THEME_CLASSES = ["theme-blue", "theme-green", "theme-purple"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", ...THEME_CLASSES);
    if (mode === "dark") {
      root.classList.add("dark");
    }
    if (theme !== "default") {
      root.classList.add(`theme-${theme}`);
    }
  }, [mode, theme]);

  return <>{children}</>;
}