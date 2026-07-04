"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { CalidadView } from "@/components/calidad/calidad-view";

export default function CalidadPage() {
  return (
    <RouteGuard
      allowedRoles={["administrador", "supervisor", "calidad"]}
      redirectTo="/dashboard"
    >
      <CalidadView />
    </RouteGuard>
  );
}
