"use client";

import { Package, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProductionKpisProps {
  totalLots: number;
  totalWeight: number;
  completedLots: number;
  activeLots: number;
}

export function ProductionKpis({ totalLots, totalWeight, completedLots, activeLots }: ProductionKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalLots}
              </p>
              <p className="text-sm text-muted-foreground">Lotes Totales</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalWeight.toLocaleString()} kg
              </p>
              <p className="text-sm text-muted-foreground">Peso Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {completedLots}
              </p>
              <p className="text-sm text-muted-foreground">
                Lotes Completados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {activeLots}
              </p>
              <p className="text-sm text-muted-foreground">Lotes Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
