import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface QualityChartProps {
  qualityDistribution: any[];
}

export function QualityChart({ qualityDistribution }: QualityChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribucion de Calidad
          </CardTitle>
          <CardDescription>
            Porcentaje de produccion por grado de calidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metricas de Calidad</CardTitle>
          <CardDescription>
            Indicadores clave de calidad del ultimo mes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {[
              { label: "Grado A", value: 45, color: "bg-primary" },
              { label: "Grado B", value: 30, color: "bg-chart-2" },
              { label: "Grado C", value: 18, color: "bg-accent" },
              {
                label: "Grado D",
                value: 7,
                color: "bg-muted-foreground",
              },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Inspecciones Realizadas
              </span>
              <span className="font-medium text-foreground">248</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tasa de Rechazo
              </span>
              <span className="font-medium text-destructive">2.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Promedio de Grado
              </span>
              <span className="font-medium text-primary">A-</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
