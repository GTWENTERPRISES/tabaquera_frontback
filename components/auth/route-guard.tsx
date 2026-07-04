"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole, LegacyUserRole } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

interface RouteGuardProps {
  /** Roles allowed to access this route */
  allowedRoles: Array<UserRole | LegacyUserRole>;
  /** Where to redirect when access is denied. Defaults to /dashboard */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Client-side route guard.
 * Redirects unauthorized users and shows a spinner while auth is loading.
 *
 * Usage:
 *   <RouteGuard allowedRoles={["administrador"]}>
 *     <MyAdminView />
 *   </RouteGuard>
 */
export function RouteGuard({
  allowedRoles,
  redirectTo = "/dashboard",
  children,
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  const allowed = hasPermission(allowedRoles);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowed) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, allowed, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
