"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { STAGE_LABELS } from "@/lib/constants";
import type { LotStageHistory, Stage } from "@/lib/types";

interface StagesTabProps {
  stageHistory: LotStageHistory[];
}

export function StagesTab({ stageHistory }: StagesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Etapas</CardTitle>
        <CardDescription>
          Duración y responsables por cada etapa del proceso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stageHistory.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground capitalize">
                    {STAGE_LABELS[stage.stage as Stage] || stage.stage}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Responsable: {stage.responsibleUserName}
                  </p>
                  {stage.observations && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Observación: {stage.observations}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {stage.durationMinutes
                    ? `${Math.floor(stage.durationMinutes / 60)}h ${stage.durationMinutes % 60}m`
                    : "En curso"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stage.startTime &&
                    new Date(stage.startTime).toLocaleDateString()}
                  {stage.endTime &&
                    ` - ${new Date(stage.endTime).toLocaleDateString()}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
