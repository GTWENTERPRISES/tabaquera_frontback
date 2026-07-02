"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PerformanceStageCard } from "./performance-stage-card";

interface StagePerformanceItem {
  stage: string;
  label: string;
  totalMinutes: number;
  count: number;
  avgMinutes: number;
  avgHours: number;
  isBottleneck: boolean;
}

interface ReporteRendimientoTableProps {
  stagePerformance: StagePerformanceItem[];
}

export function ReporteRendimientoTable({
  stagePerformance,
}: ReporteRendimientoTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Rendimiento por etapa</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col gap-3 lg:hidden px-6">
          {stagePerformance.map((stage) => (
            <PerformanceStageCard key={stage.stage} stage={stage} />
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Lotes procesados</TableHead>
                    <TableHead>Tiempo total</TableHead>
                    <TableHead>Tiempo promedio</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagePerformance.map((stage) => (
                    <TableRow key={stage.stage}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stage.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>{stage.count}</TableCell>
                      <TableCell>
                        {Math.floor(stage.totalMinutes / 60)}h{" "}
                        {stage.totalMinutes % 60}m
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {stage.avgHours}h {stage.avgMinutes % 60}m
                          </span>
                          <Progress
                            value={
                              stage.count > 0
                                ? Math.min((stage.avgHours / 12) * 100, 100)
                                : 0
                            }
                            className="w-24"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {stage.isBottleneck && stage.count > 0 ? (
                          <Badge variant="destructive">⚠️ Cuello de botella</Badge>
                        ) : stage.count > 0 ? (
                          <Badge variant="secondary">Normal</Badge>
                        ) : (
                          <Badge variant="outline">Sin datos</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
