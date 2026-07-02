"use client";

import { useState, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { DateRange } from "react-day-picker";

export function useProductionReport(dateRange?: DateRange) {
  const { lots } = useLots();
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  // Filtrar lotes por fecha
  const filteredByDate = useMemo(() => {
    return lots.filter((lot) => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const lotDate = new Date(lot.entryDate || lot.fechaIngreso || Date.now());
      return lotDate >= dateRange.from && lotDate <= dateRange.to;
    });
  }, [lots, dateRange]);

  // Filtrar por etapa e proveedor
  const filteredLots = useMemo(() => {
    return filteredByDate.filter((lot) => {
      const matchesStage =
        stageFilter === "all" || lot.currentStage === stageFilter;
      const matchesSupplier =
        supplierFilter === "all" || lot.supplier === supplierFilter;
      return matchesStage && matchesSupplier;
    });
  }, [filteredByDate, stageFilter, supplierFilter]);

  // Calcular estadísticas
  const totalWeight = filteredLots.reduce(
    (sum, lot) => sum + (lot.currentWeight || 0),
    0,
  );
  const totalLots = filteredLots.length;
  const completedLots = filteredLots.filter(
    (lot) => lot.status === "completed",
  ).length;
  const activeLots = filteredLots.filter(
    (lot) => lot.status === "active",
  ).length;

  // Producción por etapa
  const productionByStage = useMemo(() => {
    return STAGES.map((stage) => {
      const stageLots = filteredLots.filter((lot) => lot.currentStage === stage);
      const stageWeight = stageLots.reduce(
        (sum, lot) => sum + (lot.currentWeight || 0),
        0,
      );
      return {
        stage,
        label: STAGE_LABELS[stage as keyof typeof STAGE_LABELS],
        lots: stageLots.length,
        weight: stageWeight,
        percentage:
          totalWeight > 0 ? Math.round((stageWeight / totalWeight) * 100) : 0,
      };
    });
  }, [filteredLots, totalWeight]);

  // Producción diaria (últimos 7 días)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const dailyProduction = useMemo(() => {
    return last7Days.map((day) => {
      const dayLots = filteredLots.filter((lot) => {
        const lotDate = new Date(
          lot.entryDate || lot.fechaIngreso || Date.now(),
        ).toDateString();
        return lotDate === day;
      });
      const dayWeight = dayLots.reduce(
        (sum, lot) => sum + (lot.currentWeight || 0),
        0,
      );
      return {
        day: new Date(day).toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
        }),
        lots: dayLots.length,
        weight: dayWeight,
      };
    });
  }, [filteredLots, last7Days]);

  // Proveedores principales
  const suppliers = Array.from(
    new Set(filteredLots.map((lot) => lot.supplier)),
  );

  const topSuppliers = useMemo(() => {
    return suppliers
      .map((supplier) => {
        const supplierLots = filteredLots.filter(
          (lot) => lot.supplier === supplier,
        );
        const supplierWeight = supplierLots.reduce(
          (sum, lot) => sum + (lot.currentWeight || 0),
          0,
        );
        return {
          supplier,
          lots: supplierLots.length,
          weight: supplierWeight,
          percentage:
            totalWeight > 0
              ? Math.round((supplierWeight / totalWeight) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [filteredLots, suppliers, totalWeight]);

  return {
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
  };
}
