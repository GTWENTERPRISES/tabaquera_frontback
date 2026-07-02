"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { TraceabilityReportPDF } from "@/lib/pdf-exports";
import type { DateRange } from "react-day-picker";
import { ReportFilters } from "@/components/reports/shared/report-filters";
import BackButton from "@/components/BackButton";
import { useTraceabilityReportView } from "./use-traceability-report-view";
import { TraceabilityKpis } from "./traceability-kpis";
import { TraceabilityLotSelector } from "./traceability-lot-selector";
import { TraceabilityStageHistoryTable } from "./traceability-stage-history-table";

export function ReporteTrazabilidadView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const searchParams = useSearchParams();
  const {
    selectedLotId,
    setSelectedLotId,
    lots,
    filteredHistories,
    auditedLots,
    selectedLot,
  } = useTraceabilityReportView(dateRange);

  // Set lot from URL parameter if present
  useEffect(() => {
    const lotId = searchParams.get("lot");
    if (lotId && lotId !== selectedLotId) {
      setSelectedLotId(lotId);
    }
  }, [searchParams, selectedLotId, setSelectedLotId]);

  const handleExportPDF = async () => {
    if (!selectedLot) return;
    try {
      const blob = await pdf(
        <TraceabilityReportPDF lot={selectedLot as any} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trazabilidad-${selectedLot.code || selectedLot.codigo}-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  const lastRecordDate =
    filteredHistories.length > 0
      ? new Date(filteredHistories[0].startTime).toLocaleDateString("es-ES")
      : "-";

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reporte de Trazabilidad
          </h1>
          <p className="text-muted-foreground">
            Historial completo de etapas por lote con usuario y fecha
          </p>
        </div>
        {selectedLot && (
          <Button variant="ghost" onClick={handleExportPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Exportar PDF de Lote
          </Button>
        )}
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
        reportType="traceability"
      />

      <TraceabilityKpis
        filteredHistoriesLength={filteredHistories.length}
        auditedLots={auditedLots}
        lastRecordDate={lastRecordDate}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <TraceabilityLotSelector
          lots={lots}
          selectedLotId={selectedLotId}
          setSelectedLotId={setSelectedLotId}
        />

        <TraceabilityStageHistoryTable
          selectedLot={selectedLot}
          filteredHistories={filteredHistories}
        />
      </div>
    </div>
  );
}
