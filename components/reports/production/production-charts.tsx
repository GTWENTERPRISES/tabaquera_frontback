"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ProductionByStageItem {
  stage: any;
  label: string;
  lots: number;
  weight: number;
  percentage: number;
}

interface DailyProductionItem {
  day: string;
  lots: number;
  weight: number;
}

interface ProductionChartsProps {
  productionByStage: ProductionByStageItem[];
  dailyProduction: DailyProductionItem[];
}

export function ProductionCharts({
  productionByStage,
  dailyProduction,
}: ProductionChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Producción por Etapa
          </CardTitle>
          <CardDescription>
            Distribución de peso por etapa de proceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "weight") return [`${value} kg`, "Peso"];
                    if (name === "lots") return [value, "Lotes"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="weight" fill="var(--primary)" name="Peso (kg)" />
                <Bar dataKey="lots" fill="var(--accent)" name="Lotes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Producción Diaria
          </CardTitle>
          <CardDescription>Últimos 7 días de producción</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "weight") return [`${value} kg`, "Peso"];
                    if (name === "lots") return [value, "Lotes"];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--green-500)"
                  fill="var(--green-500)"
                  fillOpacity={0.3}
                  name="Peso (kg)"
                />
                <Area
                  type="monotone"
                  dataKey="lots"
                  stroke="var(--blue-500)"
                  fill="var(--blue-500)"
                  fillOpacity={0.3}
                  name="Lotes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
