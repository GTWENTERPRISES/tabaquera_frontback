"use client";

import { useState } from "react";
import { useLots } from "@/contexts/lot-context";
import { exportTraceabilityReportToCSV } from "@/lib/export-utils";
import type { Movement, Observation, SystemEvent } from "@/lib/types";

export function useTraceabilityReport() {
  const { lots, movements, observations, systemEvents } = useLots();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

  // Helper type guards
  const isMovement = (e: any): e is Movement => "type" in e;
  const isObservation = (e: any): e is Observation => "text" in e;
  const isSystemEvent = (e: any): e is SystemEvent => "action" in e;

  // Buscar lotes por código
  const searchResults = lots.filter((lot) => {
    const code = (lot.codigo || lot.code || "").toLowerCase();
    const supplier = (lot.proveedor || lot.supplier || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return code.includes(search) || supplier.includes(search);
  });

  // Lote seleccionado
  const selectedLotData = selectedLot
    ? (lots.find((lot) => lot.id === selectedLot) ?? null)
    : searchResults.length > 0
      ? searchResults[0]
      : null;

  // Filtrar eventos por tipo
  const filteredEvents = selectedLotData
    ? [
        ...movements.filter((m) => m.lotId === selectedLotData.id),
        ...observations.filter((o) => o.lotId === selectedLotData.id),
        ...systemEvents.filter((e) => e.lotId === selectedLotData.id),
      ]
        .filter((event) => {
          if (eventTypeFilter === "all") return true;
          if (eventTypeFilter === "stage_change")
            return isMovement(event) && event.type === "stage_change";
          if (eventTypeFilter === "quality_check")
            return isMovement(event) && event.type === "quality_check";
          if (eventTypeFilter === "observation") return isObservation(event);
          if (eventTypeFilter === "system") return isSystemEvent(event);
          return true;
        })
        .sort((a, b) => {
          const getDate = (event: any) => {
            if ("date" in event) return new Date(event.date);
            if ("fecha" in event) return new Date(event.fecha as string);
            return new Date();
          };
          return getDate(b).getTime() - getDate(a).getTime();
        })
    : [];

  // Calcular tiempo total del lote
  const totalTime =
    selectedLotData?.stageHistory?.reduce((total, stage) => {
      return total + (stage.durationMinutes || 0);
    }, 0) || 0;

  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  // Historial de etapas
  const stageHistory = selectedLotData?.stageHistory || [];

  // Calcular estadísticas de trazabilidad
  const totalEvents = filteredEvents.length;
  const stageChanges = filteredEvents.filter(
    (e) => "type" in e && e.type === "stage_change",
  ).length;
  const qualityChecks = filteredEvents.filter(
    (e) => "type" in e && e.type === "quality_check",
  ).length;
  const lotObservations = filteredEvents.filter((e) => "text" in e).length;

  const handleExport = () => {
    if (selectedLotData) {
      exportTraceabilityReportToCSV(
        selectedLotData,
        filteredEvents,
        stageHistory,
      );
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedLot,
    setSelectedLot,
    eventTypeFilter,
    setEventTypeFilter,
    searchResults,
    selectedLotData,
    filteredEvents,
    totalHours,
    totalMinutes,
    stageHistory,
    totalEvents,
    stageChanges,
    qualityChecks,
    lotObservations,
    handleExport,
    isMovement,
    isObservation,
    isSystemEvent,
  };
}
