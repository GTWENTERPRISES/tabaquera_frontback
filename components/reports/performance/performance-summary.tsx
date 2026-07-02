"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverallStats {
  totalLots: number;
  avgTotalHours: number;
  avgTotalMinutes: number;
  bottleneckCount: number;
  mostBottleneckStage: string;
  efficiency: number;
}

interface PerformanceSummaryProps {
  overallStats: OverallStats;
}

export function PerformanceSummary({ overallStats }: PerformanceSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumen de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Lotes Analizados
              </div>
              <div className="text-2xl font-bold">{overallStats.totalLots}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Tiempo Promedio Total
              </div>
              <div className="text-2xl font-bold">
                {overallStats.avgTotalHours}h {overallStats.avgTotalMinutes}m
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Cuellos de Botella
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                {overallStats.bottleneckCount}
                {overallStats.bottleneckCount > 0 && (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Eficiencia General
              </div>
              <div className="text-2xl font-bold">
                {overallStats.efficiency.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
