"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { ReporteTrazabilidadView } from "@/components/reports/traceability/reporte-trazabilidad-view";

export default function ReporteTrazabilidadPage() {
  return (
    <RouteGuard allowedRoles={["administrador", "supervisor"]} redirectTo="/dashboard">
      <ReporteTrazabilidadView />
    </RouteGuard>
  );
}
