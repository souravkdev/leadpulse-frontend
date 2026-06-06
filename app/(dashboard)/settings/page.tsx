"use client";

import { MoonStar, Palette, SunMedium } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThemeStore, type ThemeName } from "@/stores/themeStore";

const THEMES: Array<{ id: ThemeName; label: string; swatch: string }> = [
  { id: "default", label: "Default", swatch: "oklch(0.205 0 0)" },
  { id: "blue", label: "Blue", swatch: "oklch(0.546 0.245 262.881)" },
  { id: "green", label: "Green", swatch: "oklch(0.609 0.187 142.483)" },
  { id: "purple", label: "Purple", swatch: "oklch(0.585 0.223 292.717)" },
];

export default function SettingsPage() {
  const theme = useThemeStore((state) => state.theme);
  const mode = useThemeStore((state) => state.mode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Personalize appearance and theme colors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SunMedium className="h-4 w-4" />
            Color mode
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={mode === "light" ? "default" : "outline"}
            onClick={() => setMode("light")}
            className="gap-2"
          >
            <SunMedium className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={mode === "dark" ? "default" : "outline"}
            onClick={() => setMode("dark")}
            className="gap-2"
          >
            <MoonStar className="h-4 w-4" />
            Dark
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Color theme
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {THEMES.map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active ? "border-primary bg-accent" : "border-border bg-background hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: item.swatch }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {active && <Badge className="bg-primary text-primary-foreground">Active</Badge>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.id === "default"
                    ? "Neutral system palette"
                    : `${item.label} branded UI accents`}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}