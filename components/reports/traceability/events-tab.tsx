"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface EventsTabProps {
  stageChanges: number;
  qualityChecks: number;
  lotObservations: number;
  totalEvents: number;
}

export function EventsTab({ stageChanges, qualityChecks, lotObservations, totalEvents }: EventsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Eventos</CardTitle>
        <CardDescription>
          Estadísticas de movimientos y actividades del lote
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {stageChanges}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cambios de Etapa
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">
                  {qualityChecks}
                </p>
                <p className="text-sm text-muted-foreground">
                  Controles de Calidad
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {lotObservations}
                </p>
                <p className="text-sm text-muted-foreground">
                  Observaciones
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {totalEvents}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Eventos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
