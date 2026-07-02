"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { ProductionReportPDF } from "@/lib/pdf-exports";
import type { DateRange } from "react-day-picker";
import BackButton from "@/components/BackButton";
import { useProductionReport } from "./use-production-report";
import { ProductionFilters } from "./production-filters";
import { ProductionKpis } from "./production-kpis";
import { ProductionCharts } from "./production-charts";
import { ProductionTable } from "./production-table";
import { ProductionTopSuppliers } from "./production-top-suppliers";

interface ProductionReportViewProps {
  dateRange?: DateRange;
}

export function ProductionReportView({ dateRange }: ProductionReportViewProps) {
  const {
    stageFilter,
    setStageFilter,
    supplierFilter,
    setSupplierFilter,
    filteredLots,
    totalWeight,
    totalLots,
    completedLots,
    activeLots,
    productionByStage,
    dailyProduction,
    suppliers,
    topSuppliers,
  } = useProductionReport(dateRange);

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <ProductionReportPDF
          lots={filteredLots}
          dateRange={
            dateRange ? { from: dateRange.from, to: dateRange.to } : undefined
          }
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-produccion-${new Date().toISOString().split("T")[0]}.pdf`;
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
            Reporte de Producción
          </h1>
          <p className="text-muted-foreground">
            Consolidado por lote, etapa y volumen procesado
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

      <ProductionFilters
        dateRange={dateRange}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        supplierFilter={supplierFilter}
        onSupplierFilterChange={setSupplierFilter}
        suppliers={suppliers}
      />

      <ProductionKpis
        totalLots={totalLots}
        totalWeight={totalWeight}
        completedLots={completedLots}
        activeLots={activeLots}
      />

      <ProductionCharts
        productionByStage={productionByStage}
        dailyProduction={dailyProduction}
      />

      <ProductionTable filteredLots={filteredLots} />

      <ProductionTopSuppliers topSuppliers={topSuppliers} />
    </div>
  );
}
