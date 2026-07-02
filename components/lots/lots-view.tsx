"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download, FileText } from "lucide-react";
import { useLots } from "@/contexts/lot-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LotsStatsCards } from "@/components/lots/lots-stats-cards";
import { LotsFilters } from "@/components/lots/lots-filters";
import { LotsTable } from "@/components/lots/lots-table";
import { LotFormDialog } from "@/components/lots/lot-form-dialog";
import { exportLotsToCSV } from "@/lib/export-utils";
import { pdf } from "@react-pdf/renderer";
import { ProductionReportPDF } from "@/lib/pdf-exports";

export function LotsView() {
  const { filteredLots, filters, setFilters, stats, isLoading } = useLots();
  const { hasPermission } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortField, setSortField] = useState<"fecha" | "codigo" | "peso">(
    "fecha",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const canCreateLots = hasPermission(["administrador", "supervisor"]);

  const sortedLots = [...filteredLots].sort((a, b) => {
    let comparison = 0;
    if (sortField === "fecha") {
      comparison =
        new Date(a.fechaIngreso || a.entryDate).getTime() -
        new Date(b.fechaIngreso || b.entryDate).getTime();
    } else if (sortField === "codigo") {
      comparison = (a.codigo || a.code || "").localeCompare(
        b.codigo || b.code || "",
      );
    } else if (sortField === "peso") {
      comparison =
        (a.peso || a.currentWeight || 0) - (b.peso || b.currentWeight || 0);
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <ProductionReportPDF lots={filteredLots} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-lotes-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Lotes de Tabaco
          </h1>
          <p className="text-muted-foreground">
            Gestiona y consulta todos los lotes registrados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => exportLotsToCSV(filteredLots)}
            className="gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleExportPDF}
            className="gap-2"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          {canCreateLots && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Lote</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <LotsStatsCards lots={filteredLots} stats={stats} />

      {/* Filters */}
      <LotsFilters filters={filters} setFilters={setFilters} />

      {/* Table */}
      {isLoading && (
        <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Cargando lotes desde la API...
        </div>
      )}
      <LotsTable
        lots={sortedLots}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Form Dialog */}
      <LotFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
