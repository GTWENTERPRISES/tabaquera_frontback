"use client";

import { useCallback } from "react";
import type { QualityCheck, Lot, QualityStatus, Movement, SystemEvent } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { MovementService } from "@/services/movement.service";
import { EventService } from "@/services/event.service";

export function useQualityActions(
  lots: Lot[],
  qualityChecks: QualityCheck[],
  setQualityChecks: React.Dispatch<React.SetStateAction<QualityCheck[]>>,
  setMovements: React.Dispatch<React.SetStateAction<Movement[]>>,
  setSystemEvents: React.Dispatch<React.SetStateAction<SystemEvent[]>>,
) {
  const { user } = useAuth();

  const getQualityChecksByLotId = useCallback((lotId: string): QualityCheck[] => {
    return qualityChecks.filter((check) => check.lotId === lotId);
  }, [qualityChecks]);

  const addQualityCheck = useCallback((check: Omit<QualityCheck, "id" | "date">) => {
    const lot = lots.find((l) => l.id === check.lotId);
    if (!lot) return;

    const newCheck: QualityCheck = {
      ...check,
      id: `qc-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setQualityChecks((prev) => [...prev, newCheck]);

    const getStatusText = (status: QualityStatus) => {
      switch (status) {
        case "pending": return "Pendiente";
        case "in_progress": return "En Inspección";
        case "passed": return "Aprobado";
        case "passed_with_notes": return "Aprobado con Observaciones";
        case "failed": return "Rechazado";
        default: return "Desconocido";
      }
    };

    // Add movement for quality check
    const newMovement = MovementService.createMovement({
      lotId: check.lotId,
      type: "quality_check",
      description: `Control de calidad: ${getStatusText(check.status)}`,
      userId: user?.id || "system",
      userName: user?.nombre || user?.name || "Sistema",
    });
    setMovements((prev) => [...prev, newMovement]);

    // System event for quality check
    const statusLabel = (() => {
      switch (check.status) {
        case "pending": return "pendiente";
        case "in_progress": return "en inspección";
        case "passed": return "aprobado";
        case "passed_with_notes": return "aprobado con observaciones";
        case "failed": return "rechazado";
        default: return "desconocido";
      }
    })();

    const sysEvent = EventService.createSystemEvent({
      lotId: check.lotId,
      lotCode: check.lotCode,
      action: "Control de calidad",
      detail: `${user?.nombre || "Sistema"} registró inspección de calidad para ${check.lotCode} — ${statusLabel}${check.notes ? `: "${check.notes}"` : ""}`,
      user: user || { id: "system", nombre: "Sistema" },
      type: "quality",
    });
    setSystemEvents((prev) => [sysEvent, ...prev]);
  }, [lots, user, setQualityChecks, setMovements, setSystemEvents]);

  return {
    addQualityCheck,
    getQualityChecksByLotId,
  };
}
