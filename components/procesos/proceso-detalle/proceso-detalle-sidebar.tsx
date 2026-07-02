"use client";

import React from "react";
import { Package, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcesoDetalleSidebarProps {
  lot: any;
  process: any;
}

export function ProcesoDetalleSidebar({ lot, process }: ProcesoDetalleSidebarProps) {
  return (
    <div className="space-y-6 w-full">
      <Card className="border-0 shadow-sm w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Informacion del Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Codigo</span>
            <span className="font-mono font-medium text-foreground">{lot.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Origen</span>
            <span className="text-foreground">{lot.origin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Variedad</span>
            <span className="text-foreground">{lot.variety}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Peso Inicial</span>
            <span className="text-foreground">{lot.initialWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Peso Actual</span>
            <span className="text-foreground">{lot.currentWeight} kg</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Equipo Asignado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 w-full">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">JG</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{process.operator}</p>
              <p className="text-xs text-muted-foreground">Operador Principal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Historial de Lecturas
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="space-y-3 w-full">
            {[
              { time: "14:30", temp: "26.2", humidity: "62" },
              { time: "12:00", temp: "25.8", humidity: "64" },
              { time: "09:30", temp: "24.5", humidity: "68" },
            ].map((reading, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 w-full">
                <span className="text-sm text-muted-foreground">{reading.time}</span>
                <div className="flex gap-3 text-sm">
                  <span className="text-foreground">{reading.temp}C</span>
                  <span className="text-foreground">{reading.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
