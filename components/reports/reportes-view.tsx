"use client";

import { BarChart3, PieChart, TrendingUp, Clock, History, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCards } from "@/components/reports/shared/report-cards";
import { ReportFilters } from "@/components/reports/shared/report-filters";
import { useReportsView } from "./use-reports-view";
import { ProductionChart } from "./charts/production-chart";
import { QualityChart } from "./charts/quality-chart";
import { EfficiencyChart } from "./charts/efficiency-chart";
import { StatsCards } from "./shared/stats-cards";

export function ReportesView() {
  const {
    dateRange,
    setDateRange,
    reportType,
    setReportType,
    handleLastMonth,
    handleExportPDF,
    productionData,
    qualityDistribution,
    originData,
    efficiencyData,
    stats,
  } = useReportsView();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reportes y Analiticas
          </h1>
          <p className="text-muted-foreground">
            Visualiza metricas y genera reportes del sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleLastMonth} className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Ultimo Mes</span>
            <span className="sm:hidden">Mes</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
        </div>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
        reportType={reportType}
        onReportTypeChange={setReportType}
      />

      <ReportCards
        items={[
          {
            href: "/dashboard/reportes/produccion",
            title: "Produccion",
            description: "Consolidado por lote, etapa y volumen procesado.",
            icon: BarChart3,
          },
          {
            href: "/dashboard/reportes/calidad",
            title: "Calidad",
            description: "Aprobaciones, rechazos e incidencias por inspeccion.",
            icon: PieChart,
          },
          {
            href: "/dashboard/reportes/trazabilidad",
            title: "Trazabilidad",
            description: "Auditoria de movimientos y seguimiento por lote.",
            icon: History,
          },
          {
            href: "/dashboard/reportes/rendimiento",
            title: "Rendimiento",
            description:
              "Tiempo promedio por etapa y deteccion de cuellos de botella.",
            icon: TrendingUp,
          },
        ]}
      />

      <StatsCards stats={stats} />

      <Tabs defaultValue="production" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:max-w-md">
          <TabsTrigger value="production">Produccion</TabsTrigger>
          <TabsTrigger value="quality">Calidad</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiencia</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-6">
          <ProductionChart productionData={productionData} originData={originData} />
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityChart qualityDistribution={qualityDistribution} />
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <EfficiencyChart efficiencyData={efficiencyData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
