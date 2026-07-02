"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { PerformanceReportPDF } from "@/lib/pdf-exports";
import { ReportFilters } from "@/components/reports/shared/report-filters";
import BackButton from "@/components/BackButton";
import { useReporteRendimientoView } from "./use-reporte-rendimiento-view";
import { ReporteRendimientoKpis } from "./reporte-rendimiento-kpis";
import { ReporteRendimientoTable } from "./reporte-rendimiento-table";

export function ReporteRendimientoView() {
  const {
    dateRange,
    setDateRange,
    filteredLots,
    stagePerformance,
    totalStagesCompleted,
    totalTimeHours,
    avgTimePerStage,
  } = useReporteRendimientoView();

  const pdfDateRange = dateRange?.from
    ? { from: dateRange.from, to: dateRange.to }
    : undefined;

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <PerformanceReportPDF lots={filteredLots} dateRange={pdfDateRange} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-rendimiento-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reporte de Rendimiento
          </h1>
          <p className="text-muted-foreground">
            Tiempo promedio por etapa y detección de cuellos de botella
          </p>
        </div>
        <Button variant="ghost" onClick={handleExportPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
        reportType="rendimiento"
      />

      <ReporteRendimientoKpis
        totalStagesCompleted={totalStagesCompleted}
        totalTimeHours={totalTimeHours}
        avgTimePerStage={avgTimePerStage}
        bottleneckCount={stagePerformance.filter((s) => s.isBottleneck).length}
      />

      <ReporteRendimientoTable stagePerformance={stagePerformance} />
    </div>
  );
}
