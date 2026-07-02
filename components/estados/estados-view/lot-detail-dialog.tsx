"use client";

import { Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STAGE_LABELS, STAGE_COLORS, STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface LotDetailDialogProps {
  lot: Lot;
}

// Helper para verificar y convertir a Stage
const getValidStage = (stage: any): Stage | undefined => {
  if (STAGES.includes(stage)) {
    return stage as Stage;
  }
  return undefined;
};

// Helper para formatear duración
const formatDuration = (minutes?: number) => {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  }
  return `${mins}m`;
};

export function LotDetailDialog({ lot }: LotDetailDialogProps) {
  return (
    <Tabs defaultValue="timeline">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="timeline">Historial de Etapas</TabsTrigger>
        <TabsTrigger value="movements">Movimientos</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline" className="mt-4">
        <div className="space-y-4">
          {lot.movements?.map((movement: any, index: number) => {
            const isCurrent =
              index === lot.movements.length - 1 && !movement.completedAt;
            const isCompleted = !!movement.completedAt;
            const toStage = getValidStage(movement.toStage);

            return (
              <div key={movement.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : isCurrent
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  {index < (lot.movements?.length || 0) - 1 && (
                    <div className="w-0.5 flex-1 bg-muted mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      {toStage && (
                        <Badge className={STAGE_COLORS[toStage]}>
                          {STAGE_LABELS[toStage]}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Inicio:{" "}
                        {format(
                          new Date(movement.startedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: es },
                        )}
                      </p>
                      {movement.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          Fin:{" "}
                          {format(
                            new Date(movement.completedAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: es },
                          )}
                        </p>
                      )}
                      {movement.userName && (
                        <p className="text-sm text-muted-foreground">
                          Responsable: {movement.userName}
                        </p>
                      )}
                      {movement.userRole && (
                        <p className="text-sm text-muted-foreground">
                          Rol: {movement.userRole}
                        </p>
                      )}
                      {movement.observations && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          Observaciones: {movement.observations}
                        </p>
                      )}
                    </div>
                    {movement.durationMinutes && (
                      <Badge variant="outline">
                        {formatDuration(movement.durationMinutes)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>
      <TabsContent value="movements" className="mt-4">
        <div className="space-y-4">
          {lot.movements?.map((movement: any) => {
            const fromStage = getValidStage(movement.fromStage);
            const toStage = getValidStage(movement.toStage);

            return (
              <div key={movement.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {fromStage && toStage
                        ? `Cambio de ${STAGE_LABELS[fromStage]} a ${STAGE_LABELS[toStage]}`
                        : toStage
                          ? `Inicio en ${STAGE_LABELS[toStage]}`
                          : "Movimiento de lote"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {movement.userName} • {movement.userRole}
                    </p>
                    {movement.observations && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {movement.observations}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(movement.startedAt), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
  );
}
