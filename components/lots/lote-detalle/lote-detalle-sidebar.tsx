"use client";

import React from "react";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoteQR } from "@/components/lots/LoteQR";
import { PRODUCTION_STAGES } from "@/lib/constants";

interface LoteDetalleSidebarProps {
  lot: any;
  qualityControls: any[];
  movements: any[];
}

export function LoteDetalleSidebar({
  lot,
  qualityControls,
  movements,
}: LoteDetalleSidebarProps) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <Card className="border-0 shadow-sm w-full">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
              <QrCode className="h-4 w-4 shrink-0" />
              Codigo QR
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 w-full">
            <LoteQR lot={lot} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <Card className="border-0 shadow-sm w-full">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-medium">
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 sm:px-6 w-full">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Etapas completadas
              </span>
              <span className="font-medium text-xs sm:text-sm">
                {lot.stageHistory?.filter((s: any) => s.endTime).length || 0}/
                {PRODUCTION_STAGES.length}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Controles de calidad
              </span>
              <span className="font-medium text-xs sm:text-sm">
                {qualityControls.length}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Movimientos registrados
              </span>
              <span className="font-medium text-xs sm:text-sm">
                {movements.length}
              </span>
            </div>
            {lot.stageHistory &&
              lot.stageHistory.some((s: any) => s.durationMinutes) && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Tiempo total
                    </span>
                    <span className="font-medium text-xs sm:text-sm">
                      {Math.floor(
                        lot.stageHistory.reduce(
                          (acc: number, s: any) => acc + (s.durationMinutes || 0),
                          0
                        ) / 60
                      )}
                      h{" "}
                      {lot.stageHistory.reduce(
                        (acc: number, s: any) => acc + (s.durationMinutes || 0),
                        0
                      ) % 60}
                      m
                    </span>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
