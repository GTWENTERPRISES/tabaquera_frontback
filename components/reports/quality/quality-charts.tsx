"use client";

import { PieChart, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface QualityDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface RejectionReasonItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface QualityChartsProps {
  qualityDistributionData: QualityDistributionItem[];
  rejectionReasonData: RejectionReasonItem[];
}

export function QualityCharts({
  qualityDistributionData,
  rejectionReasonData,
}: QualityChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribución de Calidad
          </CardTitle>
          <CardDescription>
            Proporción de aprobados, rechazados y observaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={qualityDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} inspecciones`, "Cantidad"]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Motivos de Rechazo
          </CardTitle>
          <CardDescription>
            Principales causas de rechazo en inspecciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rejectionReasonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "value")
                      return [`${value} inspecciones`, "Cantidad"];
                    if (name === "percentage")
                      return [`${value}%`, "Porcentaje"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="value" fill="var(--red-500)" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
