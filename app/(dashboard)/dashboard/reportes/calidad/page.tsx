"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { QualityReportView } from "@/components/reports/quality/quality-report-view";

export default function ReporteCalidadPage() {
  return (
    <RouteGuard allowedRoles={["administrador", "supervisor"]} redirectTo="/dashboard">
      <QualityReportView />
    </RouteGuard>
  );
}
