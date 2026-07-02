"use client";

import { useState, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import { pdf } from "@react-pdf/renderer";
import { TraceabilityReportPDF } from "@/lib/pdf-exports";

export function useTrazabilidadView() {
  const { lots } = useLots();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const filteredLots = useMemo(
    () =>
      lots.filter(
        (lot) =>
          lot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lot.codigo &&
            lot.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          lot.origin.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [lots, searchTerm],
  );

  const selectedLotData = lots.find((l) => l.id === selectedLot) ?? null;

  function handleSelectLot(id: string) {
    setSelectedLot(id);
    setMobileView("detail");
  }

  async function handleExportPDF() {
    if (!selectedLotData) return;
    setExporting(true);
    try {
      const blob = await pdf(
        <TraceabilityReportPDF lot={selectedLotData} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trazabilidad-${selectedLotData.codigo ?? selectedLotData.code}-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
    } finally {
      setExporting(false);
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    selectedLot,
    setSelectedLot,
    exporting,
    setExporting,
    mobileView,
    setMobileView,
    filteredLots,
    selectedLotData,
    handleSelectLot,
    handleExportPDF,
  };
}
