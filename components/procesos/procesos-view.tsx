"use client";

/**
 * ProcesosView — Panel de monitoreo operativo de producción.
 *
 * Responde la pregunta: ¿Cómo está funcionando la producción completa ahora mismo?
 *
 * Características:
 * - Métricas resumen (lotes activos, retrasados, etapa con mayor carga)
 * - Kanban por etapas con indicador de carga (verde / amarillo / rojo)
 * - Filtros de supervisión (búsqueda, etapa, solo retrasados)
 * - Tarjetas enriquecidas con proveedor, responsable, tiempo en etapa y prioridad
 * - Acciones de supervisión únicamente (ver detalle, ver trazabilidad, mover etapa)
 * - NO se procesa ni trabaja el lote desde aquí
 */

import { motion } from "framer-motion";
import { PRODUCTION_STAGES, LOT_STATUS_CONFIG } from "@/lib/constants";

import { ProcesosHeader } from "./procesos-header";
import { ProcesosSummaryStats } from "./procesos-summary-stats";
import { ProcesosFilters } from "./procesos-filters";
import { ProcesosKanbanColumnV2 } from "./procesos-kanban-column-v2";
import { ProcesosStageMoveDialog } from "./procesos-stage-move-dialog";
import { ProcesosFlowIndicator } from "./procesos-flow-indicator";
import { useProcesosView } from "./use-procesos-view";
import type { Stage } from "@/lib/types";

export function ProcesosView() {
  const {
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
  } = useProcesosView();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <ProcesosHeader onRefresh={refreshLots} isLoading={isLoading} />

      {/* Summary metrics */}
      <ProcesosSummaryStats lots={activeLots} lotsByStage={lotsByStage} />

      {/* Filters */}
      <ProcesosFilters
        filters={filters}
        onChange={setFilters}
        totalVisible={visibleLots.length}
        totalAll={activeLots.length}
      />

      {/* ── MOBILE: tab selector + single column ── */}
      <div className="block sm:hidden">
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {PRODUCTION_STAGES.map((stage) => {
              const count = (lotsByStage[stage] ?? []).length;
              const isActive = activeTab === stage;
              const config = LOT_STATUS_CONFIG[stage];
              return (
                <button
                  key={stage}
                  onClick={() => setActiveTab(stage)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                    "whitespace-nowrap shrink-0 border transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50",
                  ].join(" ")}
                >
                  {config.label}
                  <span
                    className={[
                      "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <ProcesosKanbanColumnV2
            stage={activeTab}
            lots={lotsByStage[activeTab] ?? []}
            stageIndex={0}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            searchTerm={filters.search}
            fullWidth
          />
        </div>
      </div>

      {/* ── DESKTOP: horizontal scroll kanban ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="hidden sm:block"
      >
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {PRODUCTION_STAGES.filter(
              (s) => filters.stage === "all" || filters.stage === s,
            ).map((stage, i) => (
              <ProcesosKanbanColumnV2
                key={stage}
                stage={stage}
                lots={lotsByStage[stage] ?? []}
                stageIndex={i}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                searchTerm={filters.search}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Flow indicator */}
      <ProcesosFlowIndicator />

      {/* Stage move dialog */}
      <ProcesosStageMoveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lot={draggedLot}
        targetStage={targetStage}
        observation={observation}
        onObservationChange={setObservation}
        onConfirm={confirmStageChange}
      />
    </div>
  );
}
