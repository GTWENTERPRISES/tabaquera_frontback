"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package, User, Eye, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

function getTimeInCurrentStage(
  lot: Lot,
): { hours: number; isDelayed: boolean } | null {
  if (!lot.stageHistory || lot.stageHistory.length === 0) return null;
  const current = lot.stageHistory.find(
    (h) => h.stage === lot.currentStage && !h.endTime,
  );
  if (!current) return null;
  const minutes = Math.floor(
    (Date.now() - new Date(current.startTime).getTime()) / 60000,
  );
  const hours = Math.floor(minutes / 60);
  return { hours, isDelayed: hours >= 8 };
}

interface ProcesosKanbanColumnProps {
  stage: Stage;
  lots: Lot[];
  stageIndex: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStage: Stage) => void;
  onDragStart: (e: React.DragEvent, lot: Lot) => void;
  /** When true the column stretches to full width (used on mobile) */
  fullWidth?: boolean;
}

export function ProcesosKanbanColumn({
  stage,
  lots,
  stageIndex,
  onDragOver,
  onDrop,
  onDragStart,
  fullWidth = false,
}: ProcesosKanbanColumnProps) {
  const config = LOT_STATUS_CONFIG[stage as keyof typeof LOT_STATUS_CONFIG];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stageIndex * 0.1 }}
      className={
        fullWidth ? "w-full" : "min-w-[280px] sm:min-w-[300px] shrink-0"
      }
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      <Card className="border-0 shadow-sm flex flex-col max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-200px)]">
        <CardHeader
          className={`py-2.5 sm:py-3 border-b ${config.bgColor} shrink-0`}
        >
          <CardTitle
            className={`text-xs sm:text-sm font-semibold flex items-center justify-between ${config.color}`}
          >
            <span>{config.label}</span>
            <Badge variant="secondary" className="bg-background/80 text-xs">
              {lots.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-1.5 sm:p-2 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-1">
              {lots.slice(0, 10).map((lot, index) => (
                <motion.div
                  key={lot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e as unknown as React.DragEvent, lot)
                  }
                  className="group cursor-grab active:cursor-grabbing"
                >
                  <Card className="w-full border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-2.5 sm:p-3">
                      {/* Top row: icon + code + eye button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded bg-muted shrink-0">
                            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-xs sm:text-sm font-medium truncate">
                              {lot.codigo || lot.code}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {lot.peso || lot.currentWeight} kg
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href={`/dashboard/lotes/${lot.id}`}>
                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Link>
                        </Button>
                      </div>

                      {/* Time badge */}
                      {(() => {
                        const timeData = getTimeInCurrentStage(lot);
                        if (!timeData) return null;
                        return (
                          <div
                            className={`mt-2 flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded ${
                              timeData.isDelayed
                                ? "bg-red-500/10 text-red-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {timeData.isDelayed ? (
                              <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                            ) : (
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                            )}
                            <span>
                              {timeData.hours}h en esta etapa
                              {timeData.isDelayed ? " ⚠️" : ""}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Footer row */}
                      <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                          <span className="truncate max-w-[80px] sm:max-w-[100px]">
                            {lot.responsable?.nombre.split(" ")[0] || "-"}
                          </span>
                        </div>
                        <span>
                          {format(
                            new Date(lot.fechaIngreso || lot.entryDate),
                            "dd MMM",
                            { locale: es },
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {lots.length === 0 && (
                <div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                  Sin lotes
                </div>
              )}

              {lots.length > 10 && (
                <p className="text-center text-[10px] sm:text-xs text-muted-foreground py-2">
                  +{lots.length - 10} lotes más
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
