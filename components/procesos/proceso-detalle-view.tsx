"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGE_COLORS, PRODUCTION_STAGES } from "@/lib/constants";
import type { Stage, ProcessStatus } from "@/lib/types";
import { useLots } from "@/contexts/lot-context";
import { ProcesoDetalleTimer } from "./proceso-detalle/proceso-detalle-timer";
import { ProcesoDetalleReadingsForm } from "./proceso-detalle/proceso-detalle-readings-form";
import { ProcesoDetalleSidebar } from "./proceso-detalle/proceso-detalle-sidebar";
import { ProcesoDetalleCompleteDialog } from "./proceso-detalle/proceso-detalle-complete-dialog";
import BackButton from "@/components/BackButton";

interface ProcesoDetalleViewProps {
  id: string;
}

export function ProcesoDetalleView({ id }: ProcesoDetalleViewProps) {
  const { getLotById, isLoading, completeLot } = useLots();
  const lot = getLotById(id);

  // El "proceso" se deriva del lote real (lote + etapa actual)
  const process = useMemo(() => {
    if (!lot) return undefined;

    const stage = (lot.currentStage || "reception") as Stage;
    const stageIndex = PRODUCTION_STAGES.indexOf(stage);

    let status: ProcessStatus = "pending";
    if (lot.status === "completed" || lot.estado === "finalizado") {
      status = "completed";
    } else if (lot.workStatus === "paused") {
      status = "paused";
    } else if (lot.workStatus === "in_progress" || lot.status === "active") {
      status = "in_progress";
    }

    const progress =
      status === "completed"
        ? 100
        : stageIndex >= 0
          ? Math.round(((stageIndex + 1) / PRODUCTION_STAGES.length) * 100)
          : 0;

    return {
      id: lot.id,
      lotId: lot.id,
      lotCode: lot.codigo || lot.code,
      stage,
      status,
      progress,
      operator: lot.responsable?.nombre || "Sin asignar",
      startDate: lot.fechaIngreso || lot.entryDate,
    };
  }, [lot]);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setIsRunning(process?.status === "in_progress");
  }, [process?.status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando proceso...</p>
        </div>
      </div>
    );
  }

  if (!lot || !process) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Proceso no encontrado</p>
      </div>
    );
  }

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleComplete = () => {
    setShowCompleteDialog(true);
  };

  const confirmComplete = async () => {
    try {
      await completeLot(lot.id);
      setCompleted(true);
      setIsRunning(false);
    } catch (error) {
      console.error("Error completando proceso:", error);
    } finally {
      setShowCompleteDialog(false);
    }
  };

  const currentStatus: ProcessStatus = completed ? "completed" : process.status;
  const currentProgress = completed ? 100 : process.progress;
  const stageColor = STAGE_COLORS[process.stage];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <BackButton />
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground break-all">
            {STAGE_LABELS[process.stage]}
          </h1>
          <Badge className={stageColor}>
            {currentStatus === "completed"
              ? "Completado"
              : currentStatus === "in_progress"
                ? "En Proceso"
                : currentStatus === "paused"
                  ? "Pausado"
                  : "Pendiente"}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Lote: {process.lotCode} | Operador: {process.operator}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3 w-full">
        <div className="lg:col-span-2 space-y-6 w-full">
          <ProcesoDetalleTimer
            isRunning={isRunning}
            elapsedTime={elapsedTime}
            progress={currentProgress}
            onStartPause={handleStartPause}
            onComplete={handleComplete}
            status={currentStatus}
          />
          <ProcesoDetalleReadingsForm />
        </div>

        <ProcesoDetalleSidebar lot={lot} process={process} />
      </div>

      <ProcesoDetalleCompleteDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onConfirm={confirmComplete}
      />
    </div>
  );
}
