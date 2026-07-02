"use client";

import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LotTimeline } from "@/components/lots/lot-timeline";
import { LotMovements } from "@/components/lots/lot-movements";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Stage, LegacyLotState, Lot, LotStageHistory } from "@/lib/types";

interface LoteDetalleTabsProps {
  lot: any;
  stages: any[];
  qualityControls: any[];
  movements: any[];
}

export function LoteDetalleTabs({
  lot,
  stages,
  qualityControls,
  movements,
}: LoteDetalleTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="timeline" className="text-xs sm:text-sm">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="movements" className="text-xs sm:text-sm">
            Movimientos
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-xs sm:text-sm">
            Calidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-3 sm:mt-4 w-full">
          <Card className="border-0 shadow-sm w-full">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 w-full">
              {lot.stageHistory && lot.stageHistory.length > 0 ? (
                <div className="space-y-4 sm:space-y-6 w-full">
                  {lot.stageHistory.map(
                    (stage: LotStageHistory, index: number) => (
                      <div key={stage.id} className="flex gap-3 w-full">
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={`
                            flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-medium
                            ${
                              !stage.endTime
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-green-500 bg-green-500 text-white"
                            }
                          `}
                          >
                            {index + 1}
                          </div>
                          {index < lot.stageHistory.length - 1 && (
                            <div className="flex-1 w-0.5 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base text-foreground">
                                {LOT_STATUS_CONFIG[stage.stage]?.label ||
                                  stage.stage}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {stage.responsibleUserName}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={
                                stage.endTime
                                  ? "bg-green-100 text-green-800 shrink-0 text-[10px] sm:text-xs"
                                  : "bg-blue-100 text-blue-800 shrink-0 text-[10px] sm:text-xs"
                              }
                            >
                              {stage.endTime ? "Completado" : "En curso"}
                            </Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Inicio
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(stage.startTime),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: es },
                                )}
                              </p>
                            </div>
                            {stage.endTime && (
                              <div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                  Fin
                                </p>
                                <p className="font-medium">
                                  {format(
                                    new Date(stage.endTime),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: es },
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                          {stage.durationMinutes && (
                            <div className="mt-1.5">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Duración
                              </p>
                              <p className="font-medium text-xs sm:text-sm">
                                {Math.floor(stage.durationMinutes / 60)}h{" "}
                                {stage.durationMinutes % 60}m
                              </p>
                            </div>
                          )}
                          {stage.observaciones && (
                            <div className="mt-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
                              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                                Observaciones
                              </p>
                              <p className="text-xs sm:text-sm break-words">
                                {stage.observaciones}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <LotTimeline stages={stages} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="mt-3 sm:mt-4 w-full">
          <Card className="border-0 shadow-sm w-full">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 w-full">
              <LotMovements movements={movements} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="mt-3 sm:mt-4 w-full">
          <Card className="border-0 shadow-sm w-full">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 w-full">
              {qualityControls.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 w-full">
                  {qualityControls.map((qc: any) => (
                    <div
                      key={qc.id}
                      className="p-3 sm:p-4 rounded-lg border w-full"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Badge
                            className={
                              qc.status === "passed"
                                ? "bg-green-100 text-green-600 text-[10px] sm:text-xs"
                                : qc.status === "failed"
                                  ? "bg-red-100 text-red-600 text-[10px] sm:text-xs"
                                  : "bg-amber-100 text-amber-600 text-[10px] sm:text-xs"
                            }
                          >
                            {qc.status === "passed"
                              ? "Aprobado"
                              : qc.status === "failed"
                                ? "Rechazado"
                                : "Pendiente"}
                          </Badge>
                          {qc.notes && (
                            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground break-words">
                              {qc.notes}
                            </p>
                          )}
                          {qc.stage && (
                            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                              Etapa: {qc.stage}
                            </p>
                          )}
                        </div>
                        <div className="text-left sm:text-right text-xs sm:text-sm shrink-0">
                          <p className="font-medium">{qc.inspector}</p>
                          <p className="text-muted-foreground">
                            {qc.date
                              ? format(new Date(qc.date), "dd/MM/yyyy HH:mm", {
                                  locale: es,
                                })
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No hay controles de calidad registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
