import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EfficiencyChartProps {
  efficiencyData: any[];
}

export function EfficiencyChart({ efficiencyData }: EfficiencyChartProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencia de Eficiencia
          </CardTitle>
          <CardDescription>
            Porcentaje de eficiencia operativa por semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="week"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  domain={[70, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value}%`, "Eficiencia"]}
                />
                <Line
                  type="monotone"
                  dataKey="eficiencia"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "var(--accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">89%</span>
              </div>
              <h4 className="font-medium text-foreground">
                Eficiencia General
              </h4>
              <p className="text-sm text-muted-foreground">
                Promedio del periodo
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent">94%</span>
              </div>
              <h4 className="font-medium text-foreground">Mejor Semana</h4>
              <p className="text-sm text-muted-foreground">Semana 8</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-chart-2">
                  +5.2%
                </span>
              </div>
              <h4 className="font-medium text-foreground">Mejora</h4>
              <p className="text-sm text-muted-foreground">
                vs. mes anterior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
