"use client";

import { motion } from "framer-motion";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { QualityChart } from "@/components/dashboard/quality-chart";
import { EnhancedSystemActivity } from "@/components/dashboard/system-activity/enhanced-system-activity";
import { StageOverview } from "@/components/dashboard/stage-overview";
import { BottleneckAlert } from "@/components/dashboard/delay-alerts/bottleneck-alert";
import { DelayDetectionAlerts } from "@/components/dashboard/delay-alerts/delay-detection-alerts";
import { StageTimeStats } from "@/components/dashboard/stage-time-stats";
import { CriticalLots } from "@/components/dashboard/critical-lots";
import { PendingInspections } from "@/components/dashboard/pending-inspections";
import { useAuth } from "@/contexts/auth-context";
import { useLots } from "@/contexts/lot-context";
import { useNotifications } from "@/contexts/notification-context";
import {
  TrendingUp,
  Plus,
  ScanLine,
  ClipboardCheck,
  BellRing,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const { user } = useAuth();
  const { lots } = useLots();
  const { addNotification } = useNotifications();

  // Determine user role
  const role = user?.rol?.toLowerCase() || "operario";

  // Function to generate example notifications
  const generateExampleNotifications = () => {
    if (!user || lots.length === 0) return;

    // Example 1: Lote creado
    const exampleLot = lots[0];
    if (exampleLot) {
      const lotCode = exampleLot.code || exampleLot.codigo || "LOTE-000";
      addNotification({
        type: "info",
        category: "admin",
        title: "Nuevo lote registrado",
        message: `${user.nombre || user.name} creó el lote ${lotCode}.`,
        userId: user.id,
        lotId: exampleLot.id,
        lotCode,
        actionUrl: `/dashboard/lotes/${exampleLot.id}`,
      });
    }

    // Example 2: Inspección pendiente
    if (lots.length > 1) {
      const exampleLot2 = lots[1];
      const lotCode2 = exampleLot2.code || exampleLot2.codigo || "LOTE-001";
      addNotification({
        type: "warning",
        category: "quality",
        title: "Inspección pendiente",
        message: `${lotCode2} requiere inspección de calidad.`,
        userId: user.id,
        lotId: exampleLot2.id,
        lotCode: lotCode2,
        actionUrl: "/dashboard/calidad",
      });
    }

    // Example 3: Lote retrasado
    if (lots.length > 2) {
      const exampleLot3 = lots[2];
      const lotCode3 = exampleLot3.code || exampleLot3.codigo || "LOTE-002";
      addNotification({
        type: "critical",
        category: "alert",
        title: "Retraso crítico",
        message: `${lotCode3} supera el tiempo máximo permitido.`,
        userId: user.id,
        lotId: exampleLot3.id,
        lotCode: lotCode3,
        actionUrl: `/dashboard/lotes/${exampleLot3.id}`,
      });
    }

    // Example 4: Notificación personalizada para el usuario actual
    addNotification({
      type: "info",
      category: "lot",
      title: "Recordatorio",
      message: "Recuerda revisar los lotes en estado de clasificación",
      userId: user.id,
      actionUrl: "/dashboard/produccion",
    });
  };

  // Admin dashboard - full view
  if (role === "administrador" || role === "supervisor") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Bienvenido, {user?.nombre?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-muted-foreground">
            Panel de control de producción — Golden Leaf
          </p>
        </motion.div>

        {/* Bottleneck Alert */}
        <BottleneckAlert />

        {/* Delay Detection Alerts */}
        <DelayDetectionAlerts />

        {/* KPI Cards */}
        <KPICards />

        {/* Critical Lots + Pending Inspections */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CriticalLots />
          <PendingInspections />
        </div>

        {/* Stage Overview */}
        <StageOverview />

        {/* Charts + Tiempo promedio */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ProductionChart />
          </div>
          <div>
            <QualityChart />
          </div>
        </div>

        {/* Tiempo promedio por etapa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StageTimeStats />
        </motion.div>

        {/* Actividad del sistema + Acciones rápidas */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EnhancedSystemActivity />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border-0 bg-card p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid gap-3">
              <Link
                href="/dashboard/lotes/nuevo"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Nuevo Lote</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Registrar lote de tabaco
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/scanner"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <ScanLine className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Escanear QR</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Consultar y mover lote
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/calidad"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500 shrink-0">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Control Calidad</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Registrar inspección
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/reportes"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4 shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Ver Reportes</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Producción, calidad y rendimiento
                  </p>
                </div>
              </Link>
              <Button
                variant="ghost"
                onClick={generateExampleNotifications}
                className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors justify-start h-auto"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                  <BellRing className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-medium">Generar Notificaciones</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Ejemplos para probar el sistema
                  </p>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calidad dashboard
  if (role === "calidad") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Bienvenido, {user?.nombre?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-muted-foreground">
            Panel de control de calidad — Golden Leaf
          </p>
        </motion.div>

        {/* Pending Inspections */}
        <PendingInspections />

        {/* Quality Chart */}
        <QualityChart />

        {/* Actividad del sistema */}
        <EnhancedSystemActivity />
      </div>
    );
  }

  // Operario dashboard (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Bienvenido, {user?.nombre?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-muted-foreground">
          Mis lotes y tareas — Golden Leaf
        </p>
      </motion.div>

      {/* Critical Lots (assigned) */}
      <CriticalLots />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-lg border-0 bg-card p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid gap-3">
          <Link
            href="/dashboard/scanner"
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Escanear QR</p>
              <p className="text-xs text-muted-foreground">
                Consultar y mover lote
              </p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Actividad del sistema */}
      <EnhancedSystemActivity />
    </div>
  );
}
