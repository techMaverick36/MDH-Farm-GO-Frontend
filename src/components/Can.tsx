import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

// Hides UI the user's permissions don't allow. The server still enforces; this
// is for UX only (per the API design: the permission list exists so clients can
// hide actions the user cannot perform).
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
}
