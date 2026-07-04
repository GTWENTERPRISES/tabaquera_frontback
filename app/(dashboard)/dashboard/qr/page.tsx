"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { QrView } from "@/components/qr/qr-view";

export default function QrPage() {
  return (
    <RouteGuard
      allowedRoles={["administrador", "supervisor"]}
      redirectTo="/dashboard"
    >
      <QrView />
    </RouteGuard>
  );
}
