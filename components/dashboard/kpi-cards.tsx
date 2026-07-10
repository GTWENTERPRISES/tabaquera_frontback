"use client";

import { motion } from "framer-motion";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  ScanLine,
  Activity,
  Weight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLots } from "@/contexts/lot-context";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function KPICards() {
  const { lots, stats, qualityChecks } = useLots();

  // Prefer backend stats when available, fall back to local computation
  const totalLots = stats ? stats.lotes_activos + stats.lotes_pendientes + stats.lotes_completados : lots.length;
  const inProduction = stats?.lotes_activos ?? lots.filter(l => l.status === "in_production" || l.status === "active").length;
  const completed = stats?.lotes_completados ?? lots.filter(l => l.status === "completed").length;
  const delayed = stats?.lotes_retrasados ?? 0;
  const pendingQC = stats?.inspecciones_pendientes ?? qualityChecks.filter(qc => qc.status === "pending").length;
  const passedQC = stats?.inspecciones_aprobadas ?? qualityChecks.filter(qc => qc.status === "passed").length;

  const kpis = [
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
      value: delayed,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: ">24h sin avanzar",
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
      value: passedQC,
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
      className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6"
    >
      {kpis.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={item}>
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-tight">{stat.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
