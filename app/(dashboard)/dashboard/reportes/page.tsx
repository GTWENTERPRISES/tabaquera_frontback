"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { ReportesView } from "@/components/reports/reportes-view";

export default function ReportesPage() {
  return (
    <RouteGuard
      allowedRoles={["administrador", "supervisor"]}
      redirectTo="/dashboard"
    >
      <ReportesView />
    </RouteGuard>
  );
}
