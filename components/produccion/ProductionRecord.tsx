import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  StepForward,
  Edit,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveTimer } from "./hooks";
import { formatLiveTime, formatDuration } from "./utils";
import { STAGE_LABELS, STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProductionRecordProps {
  lot: Lot;
  onIniciarTrabajo: () => void;
  onPausarTrabajo: () => void;
  onReanudarTrabajo: () => void;
  onFinalizarEtapa: () => void;
  onAddObservation: () => void;
  getCurrentMovement: (lot: Lot) => any;
  isCalidad: boolean;
}

export function ProductionRecord({
  lot,
  onIniciarTrabajo,
  onPausarTrabajo,
  onReanudarTrabajo,
  onFinalizarEtapa,
  onAddObservation,
  getCurrentMovement,
  isCalidad,
}: ProductionRecordProps) {
  const currentMovement = getCurrentMovement(lot);
  const trabajoIniciado = !!currentMovement?.startedAt;
  const trabajoPausado = !!currentMovement?.pausedAt;
  const elapsedSeconds = useLiveTimer(
    currentMovement?.startedAt as string,
    currentMovement?.pausedAt as string,
    currentMovement?.totalPausedMinutes,
  );

  if (isCalidad) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="p-4 rounded-lg bg-muted/50 border border-muted">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Solo lectura</h4>
            <p className="text-sm text-muted-foreground">
              Rol Calidad solo puede visualizar la información
            </p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            {trabajoPausado ? (
              <Pause className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            ) : trabajoIniciado ? (
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            ) : (
              <Play className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="font-medium">
              {trabajoPausado
                ? "Estado: Pausado"
                : trabajoIniciado
                  ? "Estado: En Proceso"
                  : "Estado: Pendiente"}
            </span>
          </div>
          <div className="text-center my-3">
            <p className="text-3xl font-mono font-bold">
              {trabajoIniciado ? formatLiveTime(elapsedSeconds) : "--:--"}
            </p>
            <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
          </div>
          {currentMovement?.startedAt && (
            <div className="space-y-1 text-sm">
              <p>
                Inicio:{" "}
                {format(
                  new Date(currentMovement.startedAt as string),
                  "dd/MM/yyyy HH:mm",
                  { locale: es },
                )}
              </p>
              {currentMovement?.pausedAt && (
                <p>
                  Pausado:{" "}
                  {format(
                    new Date(currentMovement.pausedAt as string),
                    "dd/MM/yyyy HH:mm",
                    { locale: es },
                  )}
                </p>
              )}
              {currentMovement?.totalPausedMinutes && (
                <p>
                  Tiempo pausado:{" "}
                  {formatDuration(currentMovement.totalPausedMinutes)}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (!trabajoIniciado) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-3"
      >
        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium">Trabajo pendiente</h4>
            <p className="text-sm text-muted-foreground">
              Inicia el trabajo para empezar a registrar
            </p>
          </div>
        </div>
        <Button
          className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={onIniciarTrabajo}
        >
          <Play className="h-5 w-5" />
          Iniciar {STAGE_LABELS[lot.currentStage as Stage]}
        </Button>
      </motion.div>
    );
  }

  if (trabajoPausado) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300">
          <div className="flex items-center gap-2 mb-2">
            <Pause className="h-5 w-5" />
            <span className="font-medium">Estado: Pausado</span>
          </div>
          <div className="text-center my-3">
            <p className="text-3xl font-mono font-bold">
              {formatLiveTime(elapsedSeconds)}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Tiempo transcurrido
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              Inicio:{" "}
              {currentMovement?.startedAt
                ? format(
                    new Date(currentMovement.startedAt as string),
                    "dd/MM/yyyy HH:mm",
                    { locale: es },
                  )
                : ""}
            </p>
            <p>
              Pausado:{" "}
              {currentMovement?.pausedAt
                ? format(
                    new Date(currentMovement.pausedAt as string),
                    "dd/MM/yyyy HH:mm",
                    { locale: es },
                  )
                : ""}
            </p>
            {currentMovement?.totalPausedMinutes && (
              <p>
                Tiempo pausado:{" "}
                {formatDuration(currentMovement.totalPausedMinutes)}
              </p>
            )}
          </div>
        </div>

        <Button
          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={onReanudarTrabajo}
        >
          <Play className="h-4 w-4" />
          Reanudar {STAGE_LABELS[lot.currentStage as Stage]}
        </Button>

        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={onAddObservation}
        >
          <Edit className="h-4 w-4" />
          Registrar observación
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-medium">Estado: En Proceso</span>
        </div>
        <div className="text-center my-3">
          <p className="text-3xl font-mono font-bold">
            {formatLiveTime(elapsedSeconds)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Tiempo transcurrido
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            Inicio:{" "}
            {currentMovement?.startedAt
              ? format(
                  new Date(currentMovement.startedAt as string),
                  "dd/MM/yyyy HH:mm",
                  { locale: es },
                )
              : ""}
          </p>
          {currentMovement?.totalPausedMinutes && (
            <p>
              Tiempo pausado:{" "}
              {formatDuration(currentMovement.totalPausedMinutes)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={onPausarTrabajo}
        >
          <Pause className="h-4 w-4" />
          Pausar
        </Button>

        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={onAddObservation}
        >
          <Edit className="h-4 w-4" />
          Observación
        </Button>
      </div>

      {STAGES.indexOf(lot.currentStage as Stage) < STAGES.length - 1 && (
        <Button
          className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          onClick={onFinalizarEtapa}
        >
          <StepForward className="h-4 w-4" />
          Finalizar {STAGE_LABELS[lot.currentStage as Stage]}
        </Button>
      )}
    </motion.div>
  );
}
