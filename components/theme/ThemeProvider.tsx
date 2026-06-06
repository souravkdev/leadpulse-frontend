"use client";

import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const mode = useThemeStore((state) => state.mode);

  const className = [
    "h-full",
    mode === "dark" ? "dark" : "",
    theme !== "default" ? `theme-${theme}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>{children}</div>;
}