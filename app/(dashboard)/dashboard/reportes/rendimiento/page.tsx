"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { PerformanceReportView } from "@/components/reports/performance/performance-report-view";

export default function ReporteRendimientoPage() {
  return (
    <RouteGuard allowedRoles={["administrador", "supervisor"]} redirectTo="/dashboard">
      <PerformanceReportView />
    </RouteGuard>
  );
}
