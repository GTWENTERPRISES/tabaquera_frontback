"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { PerformanceReportPDF } from "@/lib/pdf-exports";
import type { DateRange } from "react-day-picker";
import BackButton from "@/components/BackButton";
import { usePerformanceReport } from "./use-performance-report";
import { PerformanceFilters } from "./performance-filters";
import { PerformanceSummary } from "./performance-summary";
import { PerformanceStageList } from "./performance-stage-list";
import { PerformanceRecommendations } from "./performance-recommendations";

interface PerformanceReportViewProps {
  dateRange?: DateRange;
}

export function PerformanceReportView({
  dateRange,
}: PerformanceReportViewProps) {
  const {
    stageFilter,
    setStageFilter,
    timeRangeFilter,
    setTimeRangeFilter,
    localDateRange,
    setLocalDateRange,
    lotsInRange,
    stagePerformance,
    overallStats,
  } = usePerformanceReport(dateRange);

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <PerformanceReportPDF
          lots={lotsInRange}
          dateRange={
            localDateRange
              ? { from: localDateRange.from, to: localDateRange.to }
              : undefined
          }
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-rendimiento-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reporte de Rendimiento
          </h1>
          <p className="text-muted-foreground">
            Análisis de tiempo promedio por etapa y detección de cuellos de
            botella
          </p>
        </div>
        <Button onClick={handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <PerformanceFilters
        dateRange={localDateRange}
        onDateChange={setLocalDateRange}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        timeRangeFilter={timeRangeFilter}
        onTimeRangeFilterChange={setTimeRangeFilter}
      />

      <PerformanceSummary overallStats={overallStats} />

      <PerformanceStageList stagePerformance={stagePerformance} />

      <PerformanceRecommendations
        stagePerformance={stagePerformance}
        bottleneckCount={overallStats.bottleneckCount}
      />
    </div>
  );
}
