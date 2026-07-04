"use client";

import { motion } from "framer-motion";
import { Layers, AlertTriangle, Timer, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PRODUCTION_STAGES, LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface ProcesosSummaryStatsProps {
  lots: Lot[];
  lotsByStage: Partial<Record<Stage, Lot[]>>;
}

function getDelayedCount(lots: Lot[]): number {
  return lots.filter((lot) => {
    const entry = lot.movements?.find(
      (m: any) => m.toStage === lot.currentStage && !m.completedAt,
    );
    if (!entry?.startedAt) return false;
    const hours =
      (Date.now() - new Date(entry.startedAt).getTime()) / 3_600_000;
    return hours >= 8;
  }).length;
}

function getBusiestStage(
  lotsByStage: Partial<Record<Stage, Lot[]>>,
): { stage: Stage; count: number } | null {
  let max = 0;
  let busiest: Stage | null = null;
  for (const stage of PRODUCTION_STAGES) {
    const count = lotsByStage[stage]?.length ?? 0;
    if (count > max) {
      max = count;
      busiest = stage;
    }
  }
  return busiest ? { stage: busiest, count: max } : null;
}

export function ProcesosSummaryStats({
  lots,
  lotsByStage,
}: ProcesosSummaryStatsProps) {
  const totalActive = lots.filter(
    (l) => l.estado !== "finalizado" && l.estado !== "rechazado",
  ).length;
  const delayed = getDelayedCount(lots);
  const busiest = getBusiestStage(lotsByStage);

  const items = [
    {
      label: "Lotes activos",
      value: totalActive,
      icon: Layers,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Con retraso",
      value: delayed,
      icon: AlertTriangle,
      color: delayed > 0 ? "text-destructive" : "text-muted-foreground",
      bg: delayed > 0 ? "bg-destructive/10" : "bg-muted/30",
    },
    {
      label: "Mayor carga",
      value: busiest
        ? `${LOT_STATUS_CONFIG[busiest.stage]?.label ?? busiest.stage} (${busiest.count})`
        : "–",
      icon: TrendingUp,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      label: "Etapas activas",
      value: PRODUCTION_STAGES.filter((s) => (lotsByStage[s]?.length ?? 0) > 0)
        .length,
      icon: Timer,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="grid gap-3 grid-cols-2 sm:grid-cols-4"
    >
      {items.map((item, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-tight">
                {item.label}
              </p>
              <p className={`font-bold text-sm sm:text-base truncate ${item.color}`}>
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
