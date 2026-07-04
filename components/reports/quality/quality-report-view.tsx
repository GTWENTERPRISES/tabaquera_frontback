"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { QualityReportPDF } from "@/lib/pdf-exports";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { useQualityReport } from "./use-quality-report";
import { QualityFilters } from "./quality-filters";
import { QualityKpis } from "./quality-kpis";
import { QualityCharts } from "./quality-charts";
import { QualityTable } from "./quality-table";
import { QualityByStage } from "./quality-by-stage";

export function QualityReportView() {
  const {
    statusFilter,
    setStatusFilter,
    inspectorFilter,
    setInspectorFilter,
    dateRange,
    setDateRange,
    filteredChecks,
    approvedChecks,
    rejectedChecks,
    warningChecks,
    approvalRate,
    rejectionReasonData,
    qualityByStage,
    inspectors,
    qualityDistributionData,
  } = useQualityReport();

  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await pdf(
        <QualityReportPDF
          checks={filteredChecks}
          dateRange={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-calidad-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado correctamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setExporting(false);
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
              <span className="ml-2 text-sm">
                ({dateRange.from.toLocaleDateString("es-ES")} —{" "}
                {dateRange.to.toLocaleDateString("es-ES")})
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleExportPDF} disabled={exporting} className="gap-2">
          <Download className="h-4 w-4" />
          {exporting ? "Generando..." : "Exportar PDF"}
        </Button>
      </div>

      <QualityFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
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
