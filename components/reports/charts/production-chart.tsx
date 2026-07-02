import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ProductionChartProps {
  productionData: any[];
  originData: any[];
}

export function ProductionChart({ productionData, originData }: ProductionChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Produccion por Etapa
          </CardTitle>
          <CardDescription>
            Kilogramos procesados por etapa en los ultimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="recepcion"
                  stackId="1"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="curado"
                  stackId="1"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="fermentacion"
                  stackId="1"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="clasificacion"
                  stackId="1"
                  stroke="var(--chart-4)"
                  fill="var(--chart-4)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="empaque"
                  stackId="1"
                  stroke="var(--chart-5)"
                  fill="var(--chart-5)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Produccion por Origen
          </CardTitle>
          <CardDescription>
            Distribucion de materia prima por region de origen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  dataKey="origin"
                  type="category"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} kg`, "Cantidad"]}
                />
                <Bar
                  dataKey="cantidad"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
