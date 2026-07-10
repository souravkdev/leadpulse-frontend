import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/user";

const ROLE_HIERARCHY: UserRole[] = [
  "viewer",
  "sales_agent",
  "sales_manager",
  "admin",
];

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "viewer";

  function hasRole(required: UserRole): boolean {
    return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(required);
  }

  function isAdmin() {
    return role === "admin";
  }

  function canManageUsers() {
    return role === "admin";
  }

  function canDeleteLead() {
    return role === "admin" || role === "sales_manager";
  }

  function canExport() {
    return role === "admin" || role === "sales_manager";
  }

  function canCreateLead() {
    return role !== "viewer";
  }

  function canEditLead(createdById: string, assignedToId?: string | null) {
    if (role === "admin" || role === "sales_manager") return true;
    if (
      role === "sales_agent" &&
      user?.id &&
      (user.id === createdById || user.id === assignedToId)
    ) {
      return true;
    }
    return false;
  }

  return {
    role,
    hasRole,
    isAdmin,
    canManageUsers,
    canDeleteLead,
    canExport,
    canCreateLead,
    canEditLead,
  };
}
