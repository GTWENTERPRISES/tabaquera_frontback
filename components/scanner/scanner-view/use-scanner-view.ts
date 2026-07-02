"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLots } from "@/contexts/lot-context";
import { useAuth } from "@/contexts/auth-context";
import { STAGES } from "@/lib/constants";
import type { Lot } from "@/lib/types";

export function useScannerView() {
  const [manualCode, setManualCode] = useState("");
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [error, setError] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [observation, setObservation] = useState("");
  const router = useRouter();
  const { lots, moveLotToStage, getLotById } = useLots();
  const { user } = useAuth();

  // Handle real QR scanning
  const handleQrScan = (qrData: string) => {
    setError("");

    // Parse QR code - supports:
    // 1. URL format: https://[domain]/verify/[lot-code]
    // 2. Old format: GOLDEN-TRACE:[lot-code]
    let lotCode = qrData;

    // Check if it's a URL
    try {
      const url = new URL(qrData);
      // Check if path is /verify/[code]
      if (url.pathname.startsWith("/verify/")) {
        lotCode = url.pathname.replace("/verify/", "");
      }
    } catch {
      // Not a valid URL, check for old format
      if (qrData.startsWith("GOLDEN-TRACE:")) {
        lotCode = qrData.replace("GOLDEN-TRACE:", "");
      }
    }

    // Search for the lot
    const lot = lots.find(
      (l) => (l.codigo || l.code || "").toUpperCase() === lotCode.toUpperCase(),
    );

    if (lot) {
      setScannedLot(lot);
      toast.success("¡Lote encontrado!");
    } else {
      // Try partial match
      const partialMatch = lots.find((l) =>
        (l.codigo || l.code || "")
          .toLowerCase()
          .includes(lotCode.toLowerCase()),
      );

      if (partialMatch) {
        setScannedLot(partialMatch);
        toast.success("¡Lote encontrado!");
      } else {
        setError(
          `Lote no encontrado: ${lotCode}. Verifica el código e intenta de nuevo.`,
        );
        toast.error("Lote no encontrado");
      }
    }
  };

  const handleScannerError = (errorMsg: string) => {
    console.error("Scanner error:", errorMsg);
  };

  // Handle moving lot to next stage
  const handleMoveLot = async () => {
    if (!scannedLot || !selectedStage) return;

    // Update lot in context
    moveLotToStage(scannedLot.id, selectedStage as any, observation);

    // Refresh the lot data
    const updatedLot = await getLotById(scannedLot.id);
    if (updatedLot) {
      setScannedLot(updatedLot);
    }

    setMoveDialogOpen(false);
    setSelectedStage("");
    setObservation("");
    toast.success("Lote movido de etapa exitosamente");
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Search by code
    const lot = lots.find(
      (l) =>
        (l.codigo || l.code || "").toUpperCase() === manualCode.toUpperCase(),
    );
    if (lot) {
      setScannedLot(lot);
      toast.success("¡Lote encontrado!");
    } else {
      // Try partial match
      const partialMatch = lots.find((l) =>
        (l.codigo || l.code || "")
          .toLowerCase()
          .includes(manualCode.toLowerCase()),
      );
      if (partialMatch) {
        setScannedLot(partialMatch);
        toast.success("¡Lote encontrado!");
      } else {
        setError("Lote no encontrado. Verifica el código e intenta de nuevo.");
        toast.error("Lote no encontrado");
      }
    }
  };

  const handleClear = () => {
    setScannedLot(null);
    setManualCode("");
    setError("");
  };

  const handleOpenMoveDialog = () => {
    if (scannedLot) {
      const currentIndex = STAGES.indexOf(scannedLot.currentStage);
      if (currentIndex < STAGES.length - 1) {
        setSelectedStage(STAGES[currentIndex + 1]);
      }
    }
    setMoveDialogOpen(true);
  };

  const handleCloseMoveDialog = () => {
    setMoveDialogOpen(false);
    setSelectedStage("");
    setObservation("");
  };

  return {
    manualCode,
    setManualCode,
    scannedLot,
    setScannedLot,
    error,
    setError,
    moveDialogOpen,
    selectedStage,
    setSelectedStage,
    observation,
    setObservation,
    lots,
    user,
    handleQrScan,
    handleScannerError,
    handleMoveLot,
    handleManualSearch,
    handleClear,
    handleOpenMoveDialog,
    handleCloseMoveDialog,
  };
}
