"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLots } from "@/contexts/lot-context";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { Stage } from "@/lib/types";

export function StageTimeStats() {
  const { movements } = useLots();

  // Compute average time per stage from movements (tipo_movimiento === "finalizacion" have durationMinutes)
  const stageStats = useMemo(() => {
    return STAGES.map((stage) => {
      // Movements that ended at this stage and have a duration
      const stageMovements = movements.filter(
        (m) =>
          (m as any).toStage === stage &&
          (m as any).tipo_movimiento === "finalizacion" &&
          typeof (m as any).durationMinutes === "number" &&
          (m as any).durationMinutes > 0,
      );

      const totalDuration = stageMovements.reduce(
        (sum, m) => sum + ((m as any).durationMinutes as number),
        0,
      );
      const avgDuration =
        stageMovements.length > 0 ? totalDuration / stageMovements.length : 0;
      const avgHours = Math.floor(avgDuration / 60);
      const avgMinutes = Math.round(avgDuration % 60);
      const isBottleneck = avgHours >= 4;
      const isEfficient = avgHours < 2 && avgDuration > 0;

      return {
        stage,
        label: STAGE_LABELS[stage as Stage],
        count: stageMovements.length,
        avgDuration,
        avgHours,
        avgMinutes,
        isBottleneck,
        isEfficient,
        efficiency: avgDuration > 0 ? Math.min(100, (120 / avgDuration) * 100) : 0,
      };
    });
  }, [movements]);

  const sortedStats = [...stageStats].sort((a, b) => b.avgDuration - a.avgDuration);
  const slowestStage = sortedStats[0] ?? { label: "N/A", avgHours: 0, avgMinutes: 0 };

  const totalAvgMinutes = stageStats.reduce((sum, s) => sum + s.avgDuration, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Tiempo Promedio por Etapa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slowestStage.avgHours >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">Cuello de botella detectado</p>
                <p className="text-xs text-red-500">
                  {slowestStage.label} promedia {slowestStage.avgHours}h {slowestStage.avgMinutes}m
                </p>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {sortedStats.map((stat, index) => (
              <motion.div
                key={stat.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    stat.isBottleneck ? "bg-red-500/10 text-red-500"
                      : stat.isEfficient ? "bg-green-500/10 text-green-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {stat.isBottleneck ? <TrendingUp className="h-5 w-5" />
                      : stat.isEfficient ? <TrendingDown className="h-5 w-5" />
                      : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.count > 0 ? `${stat.count} lotes procesados` : "Sin datos aún"}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                  <p className="text-lg font-bold text-foreground">
                    {stat.count > 0 ? `${stat.avgHours}h ${stat.avgMinutes}m` : "—"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={stat.efficiency} className="h-2 w-24 sm:w-20" />
                    <Badge
                      variant="outline"
                      className={
                        stat.isBottleneck ? "text-red-500 border-red-500/30 text-[10px]"
                          : stat.isEfficient ? "text-green-500 border-green-500/30 text-[10px]"
                          : "text-blue-500 border-blue-500/30 text-[10px]"
                      }
                    >
                      {stat.count === 0 ? "Sin datos" : stat.isBottleneck ? "Lento" : stat.isEfficient ? "Rápido" : "Normal"}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Etapa más lenta</p>
                <p className="text-xl font-bold text-foreground">{slowestStage.label}</p>
                <p className="text-xs text-muted-foreground">
                  {slowestStage.avgHours > 0 || slowestStage.avgMinutes > 0
                    ? `${slowestStage.avgHours}h ${slowestStage.avgMinutes}m`
                    : "Sin datos"}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Tiempo promedio total</p>
                <p className="text-xl font-bold text-foreground">
                  {Math.round(totalAvgMinutes / 60)}h
                </p>
                <p className="text-xs text-muted-foreground">Por lote completo</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
