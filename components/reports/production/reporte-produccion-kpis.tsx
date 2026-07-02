"use client";

import { BarChart3, Package, Scale, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReporteProduccionKpisProps {
  filteredLotsCount: number;
  totalWeight: number;
  activeLotsCount: number;
  daysWithProductionCount: number;
}

export function ReporteProduccionKpis({
  filteredLotsCount,
  totalWeight,
  activeLotsCount,
  daysWithProductionCount,
}: ReporteProduccionKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Lotes en periodo</p>
            <p className="text-xl font-semibold">{filteredLotsCount}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <Scale className="h-5 w-5 text-chart-2" />
          <div>
            <p className="text-sm text-muted-foreground">Peso total procesado</p>
            <p className="text-xl font-semibold">
              {totalWeight.toLocaleString()} kg
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <BarChart3 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Lotes activos</p>
            <p className="text-xl font-semibold">
              {activeLotsCount}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center gap-3 p-5">
          <Calendar className="h-5 w-5 text-chart-4" />
          <div>
            <p className="text-sm text-muted-foreground">Días con producción</p>
            <p className="text-xl font-semibold">
              {daysWithProductionCount}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
