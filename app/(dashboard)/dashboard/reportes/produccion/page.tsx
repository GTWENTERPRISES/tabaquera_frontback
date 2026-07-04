"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { ProductionReportView } from "@/components/reports/production/production-report-view";

export default function ReporteProduccionPage() {
  return (
    <RouteGuard allowedRoles={["administrador", "supervisor"]} redirectTo="/dashboard">
      <ProductionReportView />
    </RouteGuard>
  );
}
