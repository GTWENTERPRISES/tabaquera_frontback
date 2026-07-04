"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalidadStats } from "@/components/calidad/calidad-stats";
import { CalidadTable } from "@/components/calidad/calidad-table";
import { CalidadNewDialog } from "@/components/calidad/calidad-new-dialog";
import { useLots } from "@/contexts/lot-context";
import { pdf } from "@react-pdf/renderer";
import { QualityReportPDF } from "@/lib/pdf-exports";
import { toast } from "sonner";

export function CalidadView() {
  const { qualityChecks } = useLots();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewCheckDialog, setShowNewCheckDialog] = useState(false);

  const filteredChecks = qualityChecks.filter((check) => {
    const matchesSearch = check.lotCode
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || check.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: qualityChecks.length,
    pending: qualityChecks.filter((c) => c.status === "pending").length,
    inProgress: qualityChecks.filter((c) => c.status === "in_progress").length,
    passed: qualityChecks.filter((c) => c.status === "passed").length,
    passedWithNotes: qualityChecks.filter(
      (c) => c.status === "passed_with_notes",
    ).length,
    failed: qualityChecks.filter((c) => c.status === "failed").length,
  };

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <QualityReportPDF checks={filteredChecks} />,
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Control de Calidad
          </h1>
          <p className="text-muted-foreground">
            Gestion de inspecciones y verificaciones de calidad
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="gap-2"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          <Button
            onClick={() => setShowNewCheckDialog(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Inspeccion</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      <CalidadStats {...stats} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Inspecciones Recientes</CardTitle>
            <CardDescription>
              Historial de controles de calidad realizados
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <CalidadTable
            checks={filteredChecks}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </CardContent>
      </Card>

      <CalidadNewDialog
        open={showNewCheckDialog}
        onOpenChange={setShowNewCheckDialog}
      />
    </div>
  );
}
