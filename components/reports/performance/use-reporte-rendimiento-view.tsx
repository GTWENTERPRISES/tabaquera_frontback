"use client";

import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useLots } from "@/contexts/lot-context";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import { isWithinInterval } from "date-fns";

export function useReporteRendimientoView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { lots } = useLots();

  // Filter lots by date range
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const lotDate = new Date(lot.entryDate || lot.fechaIngreso || Date.now());
      return isWithinInterval(lotDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [lots, dateRange]);

  // Calculate average time per stage
  const stagePerformance = useMemo(() => {
    const stageData: Record<string, { totalMinutes: number; count: number }> =
      {};

    // Initialize all stages
    STAGES.forEach((stage) => {
      stageData[stage] = { totalMinutes: 0, count: 0 };
    });

    // Aggregate data from movements
    filteredLots.forEach((lot) => {
      lot.movements.forEach((movement) => {
        if (movement.durationMinutes && movement.toStage) {
          const stageEntry = stageData[movement.toStage];
          if (stageEntry) {
            stageEntry.totalMinutes += movement.durationMinutes;
            stageEntry.count += 1;
          }
        }
      });
    });

    // Calculate averages
    const stagePerfs = STAGES.map((stage) => {
      const data = stageData[stage];
      const avgMinutes =
        data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0;
      const avgHours = Math.floor(avgMinutes / 60);

      // Find bottleneck (stage with highest average time)
      const maxAvg = Math.max(
        ...Object.values(stageData).map((d) =>
          d.count > 0 ? Math.round(d.totalMinutes / d.count) : 0,
        ),
      );
      const isBottleneck = avgMinutes === maxAvg && avgMinutes > 0;

      return {
        stage,
        label: STAGE_LABELS[stage] || stage,
        totalMinutes: data.totalMinutes,
        count: data.count,
        avgMinutes,
        avgHours,
        isBottleneck,
      };
    });

    return stagePerfs;
  }, [filteredLots]);

  // Calculate overall statistics
  const totalStagesCompleted = stagePerformance.reduce(
    (sum, s) => sum + s.count,
    0,
  );
  const totalTimeHours = Math.round(
    stagePerformance.reduce((sum, s) => sum + s.totalMinutes, 0) / 60,
  );
  const avgTimePerStage =
    totalStagesCompleted > 0
      ? Math.round(
          stagePerformance.reduce((sum, s) => sum + s.avgMinutes, 0) /
            stagePerformance.filter((s) => s.count > 0).length /
            60,
        )
      : 0;

  return {
    dateRange,
    setDateRange,
    filteredLots,
    stagePerformance,
    totalStagesCompleted,
    totalTimeHours,
    avgTimePerStage,
  };
}
