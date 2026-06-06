"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function getBreadcrumb(pathname: string): string {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/leads": "Leads",
    "/pipeline": "Pipeline",
    "/activities": "Activities",
    "/analytics": "Analytics",
    "/users": "Users",
    "/settings": "Settings",
  };
  const base = "/" + pathname.split("/")[1];
  return map[base] ?? "LeadPulse CRM";
}

export function Header() {
  const pathname = usePathname();
  const title = getBreadcrumb(pathname);

  return (
    <header className="h-14 flex items-center gap-4 border-b bg-card px-6 shrink-0">
      <h1 className="text-base font-semibold">{title}</h1>
      <Separator orientation="vertical" className="h-5" />
      <span className="text-sm text-muted-foreground flex-1">LeadPulse CRM</span>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
