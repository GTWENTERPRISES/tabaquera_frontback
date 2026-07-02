"use client";

import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useLots } from "@/contexts/lot-context";
import { STAGE_LABELS } from "@/lib/constants";
import type { LotStageHistory } from "@/lib/types";
import { isWithinInterval } from "date-fns";

export function useTraceabilityReportView(dateRange?: DateRange) {
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const { lots } = useLots();

  // Get all stage histories from all lots using movements
  const allStageHistories = useMemo<
    (LotStageHistory & { lotCode: string; lotId: string })[]
  >(() => {
    return lots
      .flatMap((lot) =>
        lot.movements.map((movement) => ({
          id: movement.id,
          stage: movement.toStage || "reception",
          startTime: movement.date || movement.createdAt || new Date().toISOString(),
          endTime: movement.completedAt,
          operator: movement.userName,
          notes: movement.observation,
          lotCode: (lot.code || lot.codigo) ?? "",
          lotId: lot.id,
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
  }, [lots]);

  // Filter by date range if provided
  const filteredHistories = useMemo<
    (LotStageHistory & { lotCode: string; lotId: string })[]
  >(() => {
    return allStageHistories.filter((stage) => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const stageDate = new Date(stage.startTime);
      return isWithinInterval(stageDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [allStageHistories, dateRange]);

  const auditedLots = new Set(filteredHistories.map((item) => item.lotId)).size;

  const selectedLot = useMemo(() => {
    return (
      (selectedLotId ? lots.find((l) => l.id === selectedLotId) : null) ?? null
    );
  }, [lots, selectedLotId]);

  return {
    selectedLotId,
    setSelectedLotId,
    lots,
    filteredHistories,
    auditedLots,
    selectedLot,
  };
}
