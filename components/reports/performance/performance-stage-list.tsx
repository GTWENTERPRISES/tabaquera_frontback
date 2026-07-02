"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StagePerformanceItem {
  stage: any;
  label: string;
  totalLots: number;
  pendingLots: number;
  completedLots: number;
  avgDuration: number;
  avgHours: number;
  avgMinutes: number;
  minDuration: number;
  maxDuration: number;
  isBottleneck: boolean;
  bottleneckSeverity: "low" | "medium" | "high";
  efficiency: number;
}

interface PerformanceStageListProps {
  stagePerformance: StagePerformanceItem[];
}

export function PerformanceStageList({
  stagePerformance,
}: PerformanceStageListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rendimiento por Etapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stagePerformance.map((item, index) => (
              <motion.div
                key={item.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.label}</h3>
                        {item.isBottleneck && (
                          <Badge
                            variant={
                              item.bottleneckSeverity === "high"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Cuello de Botella
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.totalLots} lotes procesados
                        {item.pendingLots > 0 && (
                          <span className="ml-2">
                            ({item.pendingLots} pendientes)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Tiempo Promedio
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="h-4 w-4" />
                          {item.avgHours}h {item.avgMinutes}m
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Rango
                        </div>
                        <div className="text-sm font-medium">
                          {Math.floor(item.minDuration / 60)}h -{" "}
                          {Math.floor(item.maxDuration / 60)}h
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Eficiencia
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          {item.efficiency >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {item.efficiency.toFixed(1)}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Completados
                        </div>
                        <div className="font-medium">
                          {item.completedLots}/{item.totalLots}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Progreso de la etapa</span>
                      <span>
                        {item.completedLots} de {item.totalLots} lotes
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${
                            item.totalLots > 0
                              ? (item.completedLots / item.totalLots) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
