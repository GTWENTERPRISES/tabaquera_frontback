"use client";

import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useLots } from "@/contexts/lot-context";
import { isWithinInterval } from "date-fns";

export function useReporteProduccionView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { lots } = useLots();

  // Filter lots by date range
  const filteredLots = useMemo(() => {
    if (!dateRange?.from) return lots;
    return lots.filter((lot) => {
      const lotDate = new Date(lot.fecha_ingreso);
      const fromDate = dateRange.from;
      const toDate = dateRange.to || new Date();
      return isWithinInterval(lotDate, { start: fromDate, end: toDate });
    });
  }, [lots, dateRange]);

  // Calculate daily production
  const dailyProduction = useMemo(() => {
    const dailyData: Record<string, { lots: number; weight: number }> = {};
    filteredLots.forEach((lot) => {
      const dateKey = new Date(lot.fecha_ingreso).toLocaleDateString("es-ES");
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { lots: 0, weight: 0 };
      }
      dailyData[dateKey].lots++;
      dailyData[dateKey].weight += lot.peso_actual_kg || 0;
    });
    return dailyData;
  }, [filteredLots]);

  const totalWeight = filteredLots.reduce(
    (acc, lot) => acc + (lot.peso_actual_kg || 0),
    0,
  );

  return {
    dateRange,
    setDateRange,
    filteredLots,
    dailyProduction,
    totalWeight,
  };
}
