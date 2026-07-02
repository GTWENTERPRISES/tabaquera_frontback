"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/services/api"

export function ProductionChart() {
  const [weeklyData, setWeeklyData] = useState<Array<{ name: string; produccion: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ name: string; produccion: number }>>([]);

  useEffect(() => {
    const loadProductionData = async () => {
      try {
        const response = await api.getLotes();
        const lotes = response.results;
        
        // Calcular producción semanal (últimos 7 días)
        const today = new Date();
        const weekData = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day, index) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - index));
          
          const count = lotes.filter(lote => {
            const loteDate = new Date(lote.fecha_ingreso);
            return loteDate.toDateString() === date.toDateString();
          }).length;
          
          return { name: day, produccion: count };
        });
        
        // Calcular producción mensual (último año)
        const monthData = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((month, index) => {
          const count = lotes.filter(lote => {
            const loteDate = new Date(lote.fecha_ingreso);
            return loteDate.getMonth() === index && loteDate.getFullYear() === today.getFullYear();
          }).length;
          
          return { name: month, produccion: count };
        });
        
        setWeeklyData(weekData);
        setMonthlyData(monthData);
      } catch (error) {
        console.error('Error cargando datos de producción:', error);
        // Datos por defecto si hay error
        setWeeklyData(["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map(day => ({ name: day, produccion: 0 })));
        setMonthlyData(["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map(month => ({ name: month, produccion: 0 })));
      }
    };

    loadProductionData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Produccion</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="semanal">
            <TabsList className="mb-4">
              <TabsTrigger value="semanal">Semanal</TabsTrigger>
              <TabsTrigger value="mensual">Mensual</TabsTrigger>
            </TabsList>
            <TabsContent value="semanal">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="produccion"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProd)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="mensual">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="produccion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
