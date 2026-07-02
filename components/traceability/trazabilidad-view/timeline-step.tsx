"use client";

import { motion } from "framer-motion";
import { CheckCircle2, User, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGES } from "@/lib/constants";
import type { Stage } from "@/lib/types";
import { formatDate, formatDuration } from "./helpers";

export function TimelineStep({
  movement,
  index,
  isLast,
}: {
  movement: any;
  index: number;
  isLast: boolean;
}) {
  const isCompleted = !!movement.completedAt;
  const isCurrent = !movement.completedAt;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, ease: "easeOut" }}
      className="relative flex gap-3 sm:gap-4 pb-6 last:pb-0"
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute left-[18px] sm:left-[19px] top-10 w-0.5 h-[calc(100%-2.5rem)] transition-colors ${
            isCompleted ? "bg-primary/70" : "bg-border"
          }`}
        />
      )}

      {/* Step dot */}
      <div
        className={`relative z-10 h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
        isCompleted
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : isCurrent
            ? "bg-amber-500 text-white ring-4 ring-amber-500/20 shadow-md"
            : "bg-muted text-muted-foreground"
      }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
        )}
      </div>

      {/* Step card */}
      <div
        className={`flex-1 min-w-0 p-3 sm:p-4 rounded-xl border transition-colors ${
          isCurrent
            ? "border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/20"
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h4 className="font-semibold text-sm sm:text-base text-foreground">
            {movement.toStage && STAGES.includes(movement.toStage)
              ? STAGE_LABELS[movement.toStage as Stage]
              : (movement.toStage ?? "—")}
          </h4>
          {isCurrent ? (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs shrink-0">
              En Proceso
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-primary border-primary/50 text-xs shrink-0"
            >
              Completado
            </Badge>
          )}
        </div>

        <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-muted-foreground">
          {movement.userName && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">Responsable: {movement.userName}</span>
            </div>
          )}
          {movement.userRole && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">Rol: {movement.userRole}</span>
            </div>
          )}
          {movement.startedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>Inicio: {formatDate(movement.startedAt)}</span>
            </div>
          )}
          {movement.completedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>Fin: {formatDate(movement.completedAt)}</span>
            </div>
          )}
          {movement.durationMinutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Duración: {formatDuration(movement.durationMinutes)}</span>
            </div>
          )}
          {movement.observations && (
            <div className="mt-2 p-2.5 bg-muted/60 rounded-lg text-xs leading-relaxed">
              <span className="font-medium text-foreground">
                Observaciones:{" "}
              </span>
              {movement.observations}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
