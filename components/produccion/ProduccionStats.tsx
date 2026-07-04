"use client";

import { motion } from "framer-motion";
import { Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useLots } from "@/contexts/lot-context";
import { STAGE_LABELS } from "@/lib/constants";
import type { Stage } from "@/lib/types";

export function ProduccionStats() {
  const { lots } = useLots();
  const activeLots = lots.filter(
    (lot) => lot.status === "in_production" || lot.status === "active",
  );
  const stats = {
    misLotes: activeLots.length,
    pendientes: activeLots.filter((lot) => {
      const currentMovement = lot.movements?.find(
        (m) => m.toStage === lot.currentStage && !m.completedAt
      );
      return !currentMovement?.startedAt;
    }).length,
    enProceso: activeLots.filter((lot) => {
      const currentMovement = lot.movements?.find(
        (m) => m.toStage === lot.currentStage && !m.completedAt
      );
      return !!currentMovement?.startedAt;
    }).length,
    finalizados: lots.filter((lot) => lot.status === "completed").length,
    conRetraso: activeLots.filter((lot) => {
      const currentMovement = lot.movements?.find(
        (m) => m.toStage === lot.currentStage && !m.completedAt
      );
      if (!currentMovement?.startedAt) return false;
      const start = new Date(currentMovement.startedAt);
      const now = new Date();
      const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
      return diffHours > 4;
    }).length,
  };

  const statItems = [
    { label: "Mis lotes", value: stats.misLotes, icon: Package, color: "text-primary" },
    { label: "Pendientes", value: stats.pendientes, icon: Clock, color: "text-yellow-500" },
    { label: "En proceso", value: stats.enProceso, icon: Package, color: "text-blue-500" },
    { label: "Finalizados", value: stats.finalizados, icon: CheckCircle2, color: "text-green-500" },
    { label: "Con retraso", value: stats.conRetraso, icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-lg bg-card border border-border shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${item.color}`} />
              <motion.span
                key={item.value}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold"
              >
                {item.value}
              </motion.span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
