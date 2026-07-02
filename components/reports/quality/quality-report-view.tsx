"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { QualityReportPDF } from "@/lib/pdf-exports";
import type { DateRange } from "react-day-picker";
import BackButton from "@/components/BackButton";
import { useQualityReport } from "./use-quality-report";
import { QualityFilters } from "./quality-filters";
import { QualityKpis } from "./quality-kpis";
import { QualityCharts } from "./quality-charts";
import { QualityTable } from "./quality-table";
import { QualityByStage } from "./quality-by-stage";

interface QualityReportViewProps {
  dateRange?: DateRange;
}

export function QualityReportView({ dateRange }: QualityReportViewProps) {
  const {
    statusFilter,
    setStatusFilter,
    inspectorFilter,
    setInspectorFilter,
    filteredChecks,
    approvedChecks,
    rejectedChecks,
    warningChecks,
    approvalRate,
    rejectionReasonData,
    qualityByStage,
    inspectors,
    qualityDistributionData,
  } = useQualityReport(dateRange);

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <QualityReportPDF
          checks={filteredChecks}
          dateRange={
            dateRange ? { from: dateRange.from, to: dateRange.to } : undefined
          }
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-calidad-${new Date().toISOString().split("T")[0]}.pdf`;
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
            Reporte de Calidad
          </h1>
          <p className="text-muted-foreground">
            Inspecciones de calidad, aprobaciones y motivos de rechazo
            {dateRange?.from && dateRange?.to && (
              <span className="ml-2">
                ({dateRange.from.toLocaleDateString()} -{" "}
                {dateRange.to.toLocaleDateString()})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <QualityFilters
        dateRange={dateRange}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        inspectorFilter={inspectorFilter}
        onInspectorFilterChange={setInspectorFilter}
        inspectors={inspectors}
      />

      <QualityKpis
        approvedChecks={approvedChecks}
        rejectedChecks={rejectedChecks}
        warningChecks={warningChecks}
        approvalRate={approvalRate}
      />

      <QualityCharts
        qualityDistributionData={qualityDistributionData}
        rejectionReasonData={rejectionReasonData}
      />

      <QualityTable filteredChecks={filteredChecks} />

      <QualityByStage qualityByStage={qualityByStage} />
    </div>
  );
}
