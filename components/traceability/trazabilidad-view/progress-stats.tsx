"use client";

import { STAGES } from "@/lib/constants";
import type { Stage } from "@/lib/types";

export function ProgressStats({ currentStage }: { currentStage: Stage }) {
  const stageIndex = STAGES.indexOf(currentStage);
  const completed = stageIndex;
  const pending = STAGES.length - stageIndex - 1;
  const progress = Math.round((stageIndex / (STAGES.length - 1)) * 100);

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t mt-2">
      {[
        { value: completed, label: "Completadas", color: "text-primary" },
        { value: pending, label: "Pendientes", color: "text-muted-foreground" },
        { value: `${progress}%`, label: "Progreso", color: "text-amber-500" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
