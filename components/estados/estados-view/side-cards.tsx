"use client";

import { TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

// Helper para formatear duración
const formatDuration = (minutes?: number) => {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  }
  return `${mins}m`;
};

interface SideCardsProps {
  lots: Lot[];
}

export function SideCards({ lots }: SideCardsProps) {
  // Calcular tiempos promedio por etapa
  const getAvgTimePerStage = () => {
    const stageTimes: Partial<Record<Stage, number>> = {};
    const stageCounts: Partial<Record<Stage, number>> = {};

    lots.forEach((lot) => {
      lot.movements?.forEach((movement: any) => {
        if (movement.completedAt && movement.durationMinutes) {
          const validStage = STAGES.includes(movement.toStage)
            ? (movement.toStage as Stage)
            : undefined;
          if (validStage) {
            stageTimes[validStage] =
              (stageTimes[validStage] || 0) + movement.durationMinutes;
            stageCounts[validStage] = (stageCounts[validStage] || 0) + 1;
          }
        }
      });
    });

    const avgTimes: Partial<Record<Stage, string>> = {};
    (Object.keys(stageTimes) as Stage[]).forEach((stage) => {
      if (stageCounts[stage]) {
        const avgMinutes = stageTimes[stage]! / stageCounts[stage]!;
        avgTimes[stage] = formatDuration(Math.floor(avgMinutes));
      }
    });

    return avgTimes;
  };

  const avgTimes = getAvgTimePerStage();

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tiempo Promedio por Etapa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STAGES.map((stage) => {
            return (
              <div
                key={stage}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
                <Badge variant="outline">{avgTimes[stage] || "-"}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Lotes con Retraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No hay lotes con retraso actualmente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
