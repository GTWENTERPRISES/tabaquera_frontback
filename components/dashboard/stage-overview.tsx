"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLots } from "@/contexts/lot-context";
import { STAGES, STAGE_COLORS, STAGE_LABELS } from "@/lib/constants";

export function StageOverview() {
  const { lots } = useLots();

  // Get stage data: count and average time
  const getStageData = () => {
    return STAGES.map((stage) => {
      const stageLots = lots.filter((l) => l.currentStage === stage);
      
      // Calculate average time for completed stages
      let avgMinutes = 0;
      const completedHistoryItems = lots.flatMap(lot => 
        lot.stageHistory.filter(h => h.stage === stage && h.endTime && h.durationMinutes)
      );
      
      if (completedHistoryItems.length > 0) {
        const totalTime = completedHistoryItems.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
        avgMinutes = Math.round(totalTime / completedHistoryItems.length);
      }
      
      return {
        stage,
        count: stageLots.length,
        label: STAGE_LABELS[stage],
        color: STAGE_COLORS[stage],
        avgMinutes,
      };
    });
  };

  const stagesData = getStageData();
  
  // Find bottleneck stage (most lots or longest time)
  const bottleneckByCount = stagesData.reduce((max, curr) => curr.count > max.count ? curr : max, stagesData[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Estado de Producción y Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Stages */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {stagesData.map((item, index) => {
                const isBottleneck = item.stage === bottleneckByCount.stage;
                return (
                  <div key={item.stage} className="flex flex-col items-center">
                    <div
                      className={`
                      relative z-10 flex h-12 w-12 items-center justify-center rounded-full 
                      border-2 transition-all
                      ${
                        isBottleneck
                          ? "border-red-500 bg-red-500 text-white animate-pulse"
                          : item.count > 0
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-card text-muted-foreground"
                      }
                    `}
                    >
                      <span className="text-base font-bold">{item.count}</span>
                    </div>
                    <div className="mt-3 text-center space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${item.color}`}
                      >
                        {item.count} {item.count === 1 ? "lote" : "lotes"}
                      </Badge>
                      {item.avgMinutes > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Tiempo avg: {Math.round(item.avgMinutes / 60)}h
                        </p>
                      )}
                      {isBottleneck && item.count > 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          ⚠️ Cuello Botella
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
