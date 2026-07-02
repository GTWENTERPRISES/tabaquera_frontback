"use client";

import { TrendingUp, Clock, Activity, TimerReset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReporteRendimientoKpisProps {
  totalStagesCompleted: number;
  totalTimeHours: number;
  avgTimePerStage: number;
  bottleneckCount: number;
}

export function ReporteRendimientoKpis({
  totalStagesCompleted,
  totalTimeHours,
  avgTimePerStage,
  bottleneckCount,
}: ReporteRendimientoKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">
              Etapas completadas
            </p>
            <p className="text-xl font-semibold">{totalStagesCompleted}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <Clock className="h-5 w-5 text-chart-2" />
          <div>
            <p className="text-sm text-muted-foreground">Tiempo total</p>
            <p className="text-xl font-semibold">{totalTimeHours}h</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <TimerReset className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">
              Tiempo avg por etapa
            </p>
            <p className="text-xl font-semibold">{avgTimePerStage}h</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <TrendingUp className="h-5 w-5 text-chart-4" />
          <div>
            <p className="text-sm text-muted-foreground">
              Cuellos de botella
            </p>
            <p className="text-xl font-semibold">
              {bottleneckCount}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
