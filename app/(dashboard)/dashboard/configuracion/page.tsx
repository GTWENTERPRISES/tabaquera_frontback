"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { ConfiguracionView } from "@/components/configuracion/configuracion-view";

export default function ConfiguracionPage() {
  return (
    <RouteGuard allowedRoles={["administrador"]} redirectTo="/dashboard">
      <ConfiguracionView />
    </RouteGuard>
  );
}
