"use client";

import { useState, useMemo, useCallback } from "react";
import { useLots } from "@/contexts/lot-context";
import { PRODUCTION_STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import type { ProcesosFilterValues } from "./procesos-filters";

export function useProcesosView() {
  const { lots, moveLotToStage, refreshLots, isLoading } = useLots();

  const [filters, setFilters] = useState<ProcesosFilterValues>({
    search: "",
    stage: "all",
    showDelayed: false,
  });

  const [activeTab, setActiveTab] = useState<Stage>(PRODUCTION_STAGES[0]);
  const [draggedLot, setDraggedLot] = useState<Lot | null>(null);
  const [targetStage, setTargetStage] = useState<Stage | null>(null);
  const [observation, setObservation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  /** Returns lots that are active (not finalized/rejected) */
  const activeLots = useMemo(
    () =>
      lots.filter(
        (l) => l.estado !== "finalizado" && l.estado !== "rechazado",
      ),
    [lots],
  );

  /** Lots grouped by stage, respecting filters */
  const lotsByStage = useMemo(() => {
    const result: Partial<Record<Stage, Lot[]>> = {};
    PRODUCTION_STAGES.forEach((stage) => {
      let stageLots = activeLots.filter((l) => l.currentStage === stage);

      // Apply search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        stageLots = stageLots.filter(
          (l) =>
            (l.codigo ?? l.code ?? "").toLowerCase().includes(q) ||
            (l.proveedor ?? l.supplier ?? "").toLowerCase().includes(q) ||
            (l.responsable?.nombre ?? "").toLowerCase().includes(q),
        );
      }

      // Apply delayed filter
      if (filters.showDelayed) {
        stageLots = stageLots.filter((l) => {
          const entry = l.movements?.find(
            (m: any) => m.toStage === l.currentStage && !m.completedAt,
          );
          if (!entry?.startedAt) return false;
          const hours =
            (Date.now() - new Date(entry.startedAt).getTime()) / 3_600_000;
          return hours >= 8;
        });
      }

      result[stage] = stageLots;
    });
    return result;
  }, [activeLots, filters]);

  /** Lots visible according to the stage filter (for count badge) */
  const visibleLots = useMemo(() => {
    if (filters.stage === "all") {
      return PRODUCTION_STAGES.flatMap((s) => lotsByStage[s] ?? []);
    }
    return lotsByStage[filters.stage] ?? [];
  }, [lotsByStage, filters.stage]);

  /* ── Drag & drop ── */
  const handleDragStart = useCallback((e: React.DragEvent, lot: Lot) => {
    setDraggedLot(lot);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, target: Stage) => {
      e.preventDefault();
      if (draggedLot && draggedLot.currentStage !== target) {
        setTargetStage(target);
        setObservation("");
        setDialogOpen(true);
      }
    },
    [draggedLot],
  );

  const confirmStageChange = useCallback(async () => {
    if (draggedLot && targetStage) {
      await moveLotToStage(draggedLot.id, targetStage, observation);
    }
    setDialogOpen(false);
    setDraggedLot(null);
    setTargetStage(null);
    setObservation("");
  }, [draggedLot, targetStage, observation, moveLotToStage]);

  return {
    lots,
    activeLots,
    lotsByStage,
    visibleLots,
    filters,
    setFilters,
    activeTab,
    setActiveTab,
    draggedLot,
    targetStage,
    observation,
    setObservation,
    dialogOpen,
    setDialogOpen,
    handleDragStart,
    handleDragOver,
    handleDrop,
    confirmStageChange,
    refreshLots,
    isLoading,
  };
}
