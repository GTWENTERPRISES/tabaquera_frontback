"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface PerformanceRecommendationsProps {
  stagePerformance: StagePerformanceItem[];
  bottleneckCount: number;
}

export function PerformanceRecommendations({
  stagePerformance,
  bottleneckCount,
}: PerformanceRecommendationsProps) {
  if (bottleneckCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500">
            <AlertTriangle className="h-5 w-5" />
            Recomendaciones para Mejorar el Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stagePerformance
              .filter((item) => item.isBottleneck)
              .map((item) => (
                <div key={item.stage} className="space-y-2">
                  <div className="font-medium">
                    {item.label} - {item.avgHours}h {item.avgMinutes}m promedio
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.bottleneckSeverity === "high"
                      ? "Cuello de botella crítico. Considerar:"
                      : item.bottleneckSeverity === "medium"
                        ? "Cuello de botella moderado. Sugerencias:"
                        : "Cuello de botella leve. Recomendaciones:"}
                  </div>
                  <ul className="ml-4 space-y-1 text-sm">
                    {item.bottleneckSeverity === "high" && (
                      <>
                        <li>• Reasignar personal adicional a esta etapa</li>
                        <li>• Revisar equipos y procesos</li>
                        <li>• Implementar turnos adicionales</li>
                      </>
                    )}
                    {item.bottleneckSeverity === "medium" && (
                      <>
                        <li>• Optimizar flujo de trabajo</li>
                        <li>• Capacitar al personal</li>
                        <li>• Mejorar herramientas y equipos</li>
                      </>
                    )}
                    {item.bottleneckSeverity === "low" && (
                      <>
                        <li>• Monitorear continuamente</li>
                        <li>• Identificar causas específicas</li>
                        <li>• Implementar mejoras incrementales</li>
                      </>
                    )}
                  </ul>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
