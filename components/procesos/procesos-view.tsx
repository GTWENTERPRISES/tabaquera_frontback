"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { PRODUCTION_STAGES, LOT_STATUS_CONFIG } from "@/lib/constants";

import { ProcesosStats } from "@/components/procesos/procesos-stats";
import { ProcesosKanbanColumn } from "@/components/procesos/procesos-kanban-column";
import { ProcesosFlowIndicator } from "@/components/procesos/procesos-flow-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLots } from "@/contexts/lot-context";
import type { Lot, Stage } from "@/lib/types";

export function ProcesosView() {
  const { lots, moveLotToStage } = useLots();
  const [draggedLot, setDraggedLot] = useState<Lot | null>(null);
  const [targetStage, setTargetStage] = useState<Stage | null>(null);
  const [observation, setObservation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Stage>(PRODUCTION_STAGES[0]);

  const getLotsPerStage = () => {
    const result: Partial<Record<Stage | "completado" | "rechazado", Lot[]>> =
      {};
    PRODUCTION_STAGES.forEach((stage) => {
      result[stage] = lots.filter((l) => l.estado === stage);
    });
    return result;
  };

  const lotsByStage = getLotsPerStage();

  const handleDragStart = (e: React.DragEvent, lot: Lot) => {
    setDraggedLot(lot);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, target: Stage) => {
    e.preventDefault();
    if (draggedLot && draggedLot.estado !== target) {
      setTargetStage(target);
      setObservation("");
      setDialogOpen(true);
    }
  };

  const confirmStageChange = () => {
    if (draggedLot && targetStage) {
      moveLotToStage(draggedLot.id, targetStage, observation);
    }
    setDialogOpen(false);
    setDraggedLot(null);
    setTargetStage(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Control de Procesos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vista Kanban del flujo productivo
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Actualizado hace 2 minutos</span>
        </div>
      </motion.div>

      {/* Stats */}
      <ProcesosStats lotsByStage={lotsByStage} />

      {/* ── MOBILE: tab selector + single column ── */}
      <div className="block sm:hidden">
        {/* Negative margin so pills bleed to screen edge → scroll hint visible */}
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {PRODUCTION_STAGES.map((stage) => {
              const count = (lotsByStage[stage] || []).length;
              const isActive = activeTab === stage;
              const config = LOT_STATUS_CONFIG[stage];
              return (
                <button
                  key={stage}
                  onClick={() => setActiveTab(stage)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    whitespace-nowrap shrink-0 border transition-colors
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }
                  `}
                >
                  {config.label}
                  <span
                    className={`
                      flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold
                      ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active stage column — full width */}
        <div className="mt-3">
          <ProcesosKanbanColumn
            stage={activeTab}
            lots={lotsByStage[activeTab] || []}
            stageIndex={0}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            fullWidth
          />
        </div>
      </div>

      {/* ── DESKTOP: horizontal scroll kanban ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden sm:block"
      >
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {PRODUCTION_STAGES.map((stage, stageIndex) => (
              <ProcesosKanbanColumn
                key={stage}
                stage={stage}
                lots={lotsByStage[stage] || []}
                stageIndex={stageIndex}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Flow Indicator */}
      <ProcesosFlowIndicator />

      {/* Stage Change Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Cambiar Etapa
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {draggedLot && (
                <>
                  Mover lote{" "}
                  <span className="font-mono font-medium">
                    {draggedLot.codigo || draggedLot.code}
                  </span>{" "}
                  a la nueva etapa.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Observaciones (opcional)"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="text-xs sm:text-sm"
              rows={3}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmStageChange}
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
