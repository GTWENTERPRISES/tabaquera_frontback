"use client";

import { motion } from "framer-motion";
import {
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  ScanLine,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLots } from "@/contexts/lot-context";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function KPICards() {
  const { lots, qualityChecks } = useLots();

  // Total lotes
  const totalLots = lots.length;

  // Lotes en producción (activos)
  const inProduction = lots.filter((lot) => lot.status === "active").length;

  // Completados
  const completed = lots.filter((lot) => lot.status === "completed").length;

  // Lotes retrasados (ejemplo: etapa con más de X horas sin avanzar)
  const delayed = lots.filter((lot) => {
    const lastStage = lot.stageHistory?.[lot.stageHistory.length - 1];
    if (lastStage && !lastStage.endTime && lastStage.startTime) {
      const hours =
        (Date.now() - new Date(lastStage.startTime).getTime()) /
        (1000 * 60 * 60);
      return hours > 24; // > 24h = retrasado
    }
    return false;
  });

  // Pendientes QC
  const pendingQC = qualityChecks.filter(
    (qc) => qc.status === "pending",
  ).length;

  const stats = [
    {
      label: "Total Lotes",
      value: totalLots,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Registrados en sistema",
    },
    {
      label: "En Producción",
      value: inProduction,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Activos en proceso",
    },
    {
      label: "Completados",
      value: completed,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Finalizados",
    },
    {
      label: "Retrasados",
      value: delayed.length,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: ">24h en misma etapa",
    },
    {
      label: "Pendientes QC",
      value: pendingQC,
      icon: ScanLine,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Inspecciones pendientes",
    },
    {
      label: "Calidad Aprobada",
      value: qualityChecks.filter((qc) => qc.status === "passed").length,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Inspecciones OK",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={item}>
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
