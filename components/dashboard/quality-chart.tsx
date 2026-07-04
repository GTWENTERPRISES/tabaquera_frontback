"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLots } from "@/contexts/lot-context"

export function QualityChart() {
  const { stats, qualityChecks } = useLots();

  // Prefer backend stats when available
  const aprobados = stats?.inspecciones_aprobadas ?? qualityChecks.filter(q =>
    q.status === "passed" || q.status === "passed_with_notes"
  ).length;
  const rechazados = stats?.inspecciones_rechazadas ?? qualityChecks.filter(q => q.status === "failed").length;
  const pendientes = stats?.inspecciones_pendientes ?? qualityChecks.filter(q =>
    q.status === "pending" || q.status === "in_progress"
  ).length;

  const data = [
    { name: "Aprobados", value: aprobados, color: "#22c55e" },
    { name: "Rechazados", value: rechazados, color: "#ef4444" },
    { name: "Pendientes", value: pendientes, color: "#f59e0b" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Control de Calidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            {data.map((item) => (
              <div key={item.name} className="text-center">
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
