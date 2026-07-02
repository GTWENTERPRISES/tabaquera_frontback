"use client";

import { Clock3, History, ScanSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TraceabilityKpisProps {
  filteredHistoriesLength: number;
  auditedLots: number;
  lastRecordDate: string;
}

export function TraceabilityKpis({
  filteredHistoriesLength,
  auditedLots,
  lastRecordDate,
}: TraceabilityKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <History className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">
              Movimientos totales
            </p>
            <p className="text-xl font-semibold">
              {filteredHistoriesLength}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <ScanSearch className="h-5 w-5 text-chart-2" />
          <div>
            <p className="text-sm text-muted-foreground">Lotes auditados</p>
            <p className="text-xl font-semibold">{auditedLots}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <Clock3 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Último registro</p>
            <p className="text-xl font-semibold">
              {lastRecordDate}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
