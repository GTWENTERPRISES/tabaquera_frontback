"use client";

import { motion } from "framer-motion";
import { STAGES, STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface LotProgressIndicatorProps {
  lot: Lot;
}

export function LotProgressIndicator({ lot }: LotProgressIndicatorProps) {
  // Calcular la etapa actual y el progreso
  const currentStageIndex = STAGES.indexOf(lot.currentStage);
  const totalStages = STAGES.length;
  const progressPercent = ((currentStageIndex + 1) / totalStages) * 100;

  return (
    <div className="space-y-6 p-4 bg-muted/30 rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Progreso del Lote</h3>
        <span className="text-sm font-medium text-primary">
          {Math.round(progressPercent)}% completado
        </span>
      </div>

      {/* Barra de Progreso */}
      <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Timeline Visual */}
      <div className="flex items-start gap-2 mt-2">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div key={stage} className="flex-1 flex flex-col items-center">
              <div className="flex items-center justify-center">
                <div className="flex-1 flex items-center">
                  {index > 0 && (
                    <div className={`flex-1 h-1 ${index <= currentStageIndex ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
                <div className="flex-shrink-0 z-10">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      <CheckCircle2 className="h-6 w-6" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary"
                    >
                      <Clock className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                      <Circle className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex items-center">
                  {index < STAGES.length - 1 && (
                    <div className={`flex-1 h-1 ${index < currentStageIndex ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-medium mt-2 text-center ${
                  isCompleted ? "text-green-700 dark:text-green-300" :
                  isCurrent ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
