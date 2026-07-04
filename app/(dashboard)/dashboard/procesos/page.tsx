"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { ProcesosView } from "@/components/procesos/procesos-view";

export default function ProcesosPage() {
  return (
    <RouteGuard
      allowedRoles={["administrador", "supervisor"]}
      redirectTo="/dashboard"
    >
      <ProcesosView />
    </RouteGuard>
  );
}
