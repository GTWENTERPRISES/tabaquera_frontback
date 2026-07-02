"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useLots } from "@/contexts/lot-context";
import { STAGES, STAGE_LABELS, LOT_STATUS_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function BottleneckAlert() {
  const { lots } = useLots();

  // Detectar cuello de botella: etapa con más lotes activos
  const stageCounts = STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: lots.filter((l) => l.currentStage === stage && l.status === "active").length,
  }));

  const bottleneck = stageCounts.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    stageCounts[0],
  );

  // Solo mostrar si hay un cuello de botella real (3+ lotes en una etapa)
  if (!bottleneck || bottleneck.count < 3) return null;

  const config = LOT_STATUS_CONFIG[bottleneck.stage];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-between gap-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Cuello de botella detectado
            </p>
            <p className="text-xs text-muted-foreground">
              La etapa{" "}
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {bottleneck.label}
              </span>{" "}
              tiene {bottleneck.count} lotes pendientes — puede estar causando
              retrasos en la producción
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            className={`${config.bgColor} ${config.color} border-0`}
          >
            {bottleneck.count} lotes
          </Badge>
          <Link
            href="/dashboard/procesos"
            className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
          >
            Ver procesos
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
