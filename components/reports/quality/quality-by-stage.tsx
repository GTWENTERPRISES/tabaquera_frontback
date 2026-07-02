"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QualityByStageItem {
  stage: string;
  total: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  rejectionRate: number;
}

interface QualityByStageProps {
  qualityByStage: QualityByStageItem[];
}

export function QualityByStage({ qualityByStage }: QualityByStageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calidad por Etapa de Proceso</CardTitle>
        <CardDescription>
          Tasas de aprobación y rechazo por etapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {qualityByStage.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground capitalize">
                    {stage.stage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stage.total} inspecciones
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {stage.approvalRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Aprobación</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">
                      {stage.rejectionRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Rechazo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
