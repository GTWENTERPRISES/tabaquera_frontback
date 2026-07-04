"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { ProductionReportPDF } from "@/lib/pdf-exports";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { useProductionReport } from "./use-production-report";
import { ProductionFilters } from "./production-filters";
import { ProductionKpis } from "./production-kpis";
import { ProductionCharts } from "./production-charts";
import { ProductionTable } from "./production-table";
import { ProductionTopSuppliers } from "./production-top-suppliers";

export function ProductionReportView() {
  const {
    stageFilter,
    setStageFilter,
    supplierFilter,
    setSupplierFilter,
    dateRange,
    setDateRange,
    filteredLots,
    totalWeight,
    totalLots,
    completedLots,
    activeLots,
    productionByStage,
    dailyProduction,
    suppliers,
    topSuppliers,
  } = useProductionReport();

  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await pdf(
        <ProductionReportPDF
          lots={filteredLots}
          dateRange={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-produccion-${new Date().toISOString().split("T")[0]}.pdf`;
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
            Reporte de Producción
          </h1>
          <p className="text-muted-foreground">
            Consolidado por lote, etapa y volumen procesado
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

      <ProductionFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
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
