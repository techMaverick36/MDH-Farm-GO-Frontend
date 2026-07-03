import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { RoleType } from "@mdh/shared";
import { useAuth } from "@/lib/auth";

// Platform admins have no farm and use the admin console; everyone else uses the
// farm dashboard. These gates keep each role in its own area.

export function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== RoleType.PLATFORM_ADMIN) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function ManagerArea({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role === RoleType.PLATFORM_ADMIN) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
