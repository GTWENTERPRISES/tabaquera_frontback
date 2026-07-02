"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Activity } from "lucide-react";

interface StagePerformanceItem {
  stage: string;
  label: string;
  totalMinutes: number;
  count: number;
  avgMinutes: number;
  avgHours: number;
  isBottleneck: boolean;
}

interface PerformanceStageCardProps {
  stage: StagePerformanceItem;
}

export function PerformanceStageCard({ stage }: PerformanceStageCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-medium text-foreground">{stage.label}</span>
        {stage.isBottleneck && stage.count > 0 ? (
          <Badge variant="destructive">⚠️ Cuello de botella</Badge>
        ) : stage.count > 0 ? (
          <Badge variant="secondary">Normal</Badge>
        ) : (
          <Badge variant="outline">Sin datos</Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Lotes procesados
          </dt>
          <dd className="font-medium text-foreground">{stage.count}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Tiempo total
          </dt>
          <dd className="font-medium text-foreground">
            {Math.floor(stage.totalMinutes / 60)}h {stage.totalMinutes % 60}m
          </dd>
        </div>
      </dl>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Tiempo promedio</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {stage.avgHours}h {stage.avgMinutes % 60}m
          </span>
          <Progress
            value={
              stage.count > 0 ? Math.min((stage.avgHours / 12) * 100, 100) : 0
            }
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
