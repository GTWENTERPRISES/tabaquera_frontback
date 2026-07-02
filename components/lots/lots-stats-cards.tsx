"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Lot } from "@/lib/types";
import type { Estadisticas } from "@/services/api";

interface LotsStatsCardsProps {
  lots: Lot[];
  stats?: Estadisticas | null;
}

export function LotsStatsCards({ lots, stats }: LotsStatsCardsProps) {
  const totalLotes = stats
    ? stats.lotes_activos + stats.lotes_pendientes + stats.lotes_completados
    : lots.length;
  const lotesEnProceso = stats
    ? stats.lotes_activos
    : lots.filter(
        (l) => l.estado && !["finalizado", "rechazado"].includes(l.estado),
      ).length;
  const lotesCompletados = stats
    ? stats.lotes_completados
    : lots.filter((l) => l.estado === "finalizado").length;
  const pesoTotal = stats
    ? Number(stats.peso_total_kg || 0)
    : lots.reduce((acc, l) => acc + (l.peso || l.currentWeight || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLotes}</p>
              <p className="text-sm text-muted-foreground">Total Lotes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lotesEnProceso}</p>
              <p className="text-sm text-muted-foreground">En Proceso</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lotesCompletados}</p>
              <p className="text-sm text-muted-foreground">Completados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Package className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {pesoTotal.toLocaleString()}{" "}
                kg
              </p>
              <p className="text-sm text-muted-foreground">Peso Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
