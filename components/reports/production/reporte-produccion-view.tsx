"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ProductionReportPDF } from "@/lib/pdf-exports";
import { ReportFilters } from "@/components/reports/shared/report-filters";
import BackButton from "@/components/BackButton";
import { useReporteProduccionView } from "./use-reporte-produccion-view";
import { ReporteProduccionKpis } from "./reporte-produccion-kpis";
import { ReporteProduccionLotDetailsTable } from "./reporte-produccion-lot-details-table";
import { ReporteProduccionDailyTable } from "./reporte-produccion-daily-table";

export function ReporteProduccionView() {
  const {
    dateRange,
    setDateRange,
    filteredLots,
    dailyProduction,
    totalWeight,
  } = useReporteProduccionView();

  const pdfDateRange = dateRange?.from
    ? { from: dateRange.from, to: dateRange.to }
    : undefined;

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reporte de Producción
          </h1>
          <p className="text-muted-foreground">
            Consolidado por lote, etapa, peso y producción diaria
          </p>
        </div>
        <PDFDownloadLink
          document={
            <ProductionReportPDF lots={filteredLots} dateRange={pdfDateRange} />
          }
          fileName={`reporte-produccion-${new Date().toISOString().split("T")[0]}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Generando PDF..." : "Exportar PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
        reportType="production"
      />

      <ReporteProduccionKpis
        filteredLotsCount={filteredLots.length}
        totalWeight={totalWeight}
        activeLotsCount={
          filteredLots.filter((lot) => lot.estado === "en_produccion").length
        }
        daysWithProductionCount={Object.keys(dailyProduction).length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReporteProduccionLotDetailsTable filteredLots={filteredLots} />
        <ReporteProduccionDailyTable dailyProduction={dailyProduction} />
      </div>
    </div>
  );
}
