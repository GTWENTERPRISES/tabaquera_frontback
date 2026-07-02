"use client";

import { User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/constants";
import { TraceabilityStageCard } from "./traceability-stage-card";
import type { Lot, LotStageHistory } from "@/lib/types";

interface TraceabilityStageHistoryTableProps {
  selectedLot: Lot | null;
  filteredHistories: (LotStageHistory & { lotCode: string; lotId: string })[];
}

export function TraceabilityStageHistoryTable({
  selectedLot,
  filteredHistories,
}: TraceabilityStageHistoryTableProps) {
  const histories = selectedLot ? selectedLot.stageHistory : filteredHistories;

  return (
    <Card className="border-0 shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle>
          {selectedLot
            ? `Historial de ${selectedLot.code ?? selectedLot.codigo}`
            : "Historial completo de etapas"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col gap-3 lg:hidden px-6">
          {histories.map((stage, index) => (
            <TraceabilityStageCard
              key={stage.id ?? index}
              check={stage as any}
              selectedLot={selectedLot}
            />
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Fecha inicio</TableHead>
                    <TableHead>Fecha fin</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {histories.map((stage, index) => (
                    <TableRow key={stage.id ?? index}>
                      <TableCell className="font-mono">
                        {"lotCode" in (stage as any)
                          ? (stage as any).lotCode
                          : (selectedLot?.code ?? selectedLot?.codigo ?? "-")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {STAGE_LABELS[
                            stage.stage as keyof typeof STAGE_LABELS
                          ] || stage.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {stage.responsibleUserName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(stage.startTime).toLocaleString("es-ES")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {stage.endTime ? (
                          new Date(stage.endTime).toLocaleString("es-ES")
                        ) : (
                          <span className="text-muted-foreground italic">
                            En curso
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {stage.durationMinutes ? (
                          `${Math.floor(stage.durationMinutes / 60)}h ${stage.durationMinutes % 60}m`
                        ) : stage.endTime ? (
                          "-"
                        ) : (
                          <span className="text-muted-foreground italic">
                            En curso
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {stage.observaciones ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
