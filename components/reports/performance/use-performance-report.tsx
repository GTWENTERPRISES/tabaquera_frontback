"use client";

import { useMemo, useState } from "react";
import { useLots } from "@/contexts/lot-context";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { DateRange } from "react-day-picker";
import type { Stage } from "@/lib/types";

interface StagePerformanceItem {
  stage: Stage;
  label: string;
  totalLots: number;
  pendingLots: number;
  completedLots: number;
  avgDuration: number;
  avgHours: number;
  avgMinutes: number;
  minDuration: number;
  maxDuration: number;
  isBottleneck: boolean;
  bottleneckSeverity: "low" | "medium" | "high";
  efficiency: number;
}

interface OverallStats {
  totalLots: number;
  avgTotalHours: number;
  avgTotalMinutes: number;
  bottleneckCount: number;
  mostBottleneckStage: string;
  efficiency: number;
}

export function usePerformanceReport(dateRange?: DateRange) {
  const { lots } = useLots();
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("all");
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(
    dateRange,
  );

  const lotsInRange = useMemo(() => {
    const from = localDateRange?.from;
    const to = localDateRange?.to;

    if (!from) {
      return lots;
    }

    return lots.filter((lot) => {
      const lotDate = new Date(lot.entryDate || lot.fechaIngreso || Date.now());
      if (to) {
        return lotDate >= from && lotDate <= to;
      }
      return lotDate >= from;
    });
  }, [lots, localDateRange]);

  const stagePerformance = useMemo<StagePerformanceItem[]>(() => {
    const stats = STAGES.map((stage) => {
      const stageLots = lotsInRange.filter((lot) =>
        lot.stageHistory?.some((history) => history.stage === stage),
      );

      const stageHistories = stageLots.flatMap((lot) =>
        (lot.stageHistory || []).filter((history) => history.stage === stage),
      );

      const durations = stageHistories
        .filter((history) => typeof history.durationMinutes === "number")
        .map((history) => history.durationMinutes as number);

      const avgDuration =
        durations.length > 0
          ? durations.reduce((sum, duration) => sum + duration, 0) /
            durations.length
          : 0;

      const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
      const pendingLots = stageLots.filter((lot) => lot.currentStage === stage);
      const completedLots = stageLots.filter(
        (lot) => lot.currentStage !== stage,
      );

      let bottleneckSeverity: "low" | "medium" | "high" = "low";
      if (avgDuration / 60 >= 6) {
        bottleneckSeverity = "high";
      } else if (avgDuration / 60 >= 4) {
        bottleneckSeverity = "medium";
      }

      return {
        stage,
        label: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage,
        totalLots: stageLots.length,
        pendingLots: pendingLots.length,
        completedLots: completedLots.length,
        avgDuration,
        avgHours: Math.floor(avgDuration / 60),
        avgMinutes: Math.round(avgDuration % 60),
        minDuration,
        maxDuration,
        isBottleneck: avgDuration / 60 >= 4,
        bottleneckSeverity,
        efficiency:
          stageLots.length > 0
            ? (completedLots.length / stageLots.length) * 100
            : 0,
      };
    });

    const minimumHours =
      timeRangeFilter === "all" ? undefined : Number(timeRangeFilter);

    return stats.filter((item) => {
      const matchesStage = stageFilter === "all" || item.stage === stageFilter;
      const matchesHours =
        minimumHours === undefined || item.avgDuration / 60 >= minimumHours;
      return matchesStage && matchesHours;
    });
  }, [lotsInRange, stageFilter, timeRangeFilter]);

  const overallStats = useMemo<OverallStats>(() => {
    const totalLots = lotsInRange.length;
    const totalDuration = stagePerformance.reduce(
      (sum, item) => sum + item.avgDuration * item.totalLots,
      0,
    );
    const avgTotalDuration = totalLots > 0 ? totalDuration / totalLots : 0;
    const bottleneckStages = stagePerformance.filter(
      (item) => item.isBottleneck,
    );
    const mostBottleneckStage =
      bottleneckStages.length > 0
        ? bottleneckStages.reduce((prev, current) =>
            prev.avgDuration > current.avgDuration ? prev : current,
          ).label
        : "Ninguna";

    return {
      totalLots,
      avgTotalHours: Math.floor(avgTotalDuration / 60),
      avgTotalMinutes: Math.round(avgTotalDuration % 60),
      bottleneckCount: bottleneckStages.length,
      mostBottleneckStage,
      efficiency:
        stagePerformance.length > 0
          ? stagePerformance.reduce((sum, item) => sum + item.efficiency, 0) /
            stagePerformance.length
          : 0,
    };
  }, [lotsInRange, stagePerformance]);

  return {
    stageFilter,
    setStageFilter,
    timeRangeFilter,
    setTimeRangeFilter,
    localDateRange,
    setLocalDateRange,
    lotsInRange,
    stagePerformance,
    overallStats,
  };
}
