"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOT_STATUS_CONFIG, PRODUCTION_STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface ProcesosStatsProps {
  lotsByStage: Partial<Record<Stage | "completado" | "rechazado", Lot[]>>;
}

export function ProcesosStats({ lotsByStage }: ProcesosStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-3 grid-cols-3 sm:grid-cols-5"
    >
      {PRODUCTION_STAGES.map((stage) => {
        const config = LOT_STATUS_CONFIG[stage];
        const count = lotsByStage[stage]?.length || 0;

        return (
          <Card key={stage} className="border-0 shadow-sm">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <Badge
                  variant="secondary"
                  className={`${config.bgColor} ${config.color} text-[10px] sm:text-xs w-fit`}
                >
                  {config.label}
                </Badge>
                <span className="text-xl sm:text-2xl font-bold">{count}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
}
