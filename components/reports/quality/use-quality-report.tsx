"use client";

import { useState, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import { REJECTION_REASONS } from "@/lib/constants";
import type { DateRange } from "react-day-picker";

export function useQualityReport(dateRange?: DateRange) {
  const { lots, qualityChecks } = useLots();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectorFilter, setInspectorFilter] = useState<string>("all");

  // Filtrar controles de calidad por fecha
  const filteredByDate = useMemo(() => {
    return qualityChecks.filter((check) => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const checkDate = new Date(check.date || Date.now());
      return checkDate >= dateRange.from && checkDate <= dateRange.to;
    });
  }, [qualityChecks, dateRange]);

  // Filtrar por estado e inspector
  const filteredChecks = useMemo(() => {
    return filteredByDate.filter((check) => {
      const matchesStatus =
        statusFilter === "all" || check.status === statusFilter;
      const matchesInspector =
        inspectorFilter === "all" || check.inspector === inspectorFilter;
      return matchesStatus && matchesInspector;
    });
  }, [filteredByDate, statusFilter, inspectorFilter]);

  // Calcular estadísticas de calidad
  const totalChecks = filteredChecks.length;
  const approvedChecks = filteredChecks.filter(
    (check) => check.status === "passed",
  ).length;
  const rejectedChecks = filteredChecks.filter(
    (check) => check.status === "failed",
  ).length;
  const warningChecks = filteredChecks.filter(
    (check) => check.status === "passed_with_notes",
  ).length;

  const approvalRate =
    totalChecks > 0 ? Math.round((approvedChecks / totalChecks) * 100) : 0;
  const rejectionRate =
    totalChecks > 0 ? Math.round((rejectedChecks / totalChecks) * 100) : 0;

  // Motivos de rechazo
  const rejectionReasons = filteredChecks
    .filter((check) => check.status === "failed" && check.rejectionReasons)
    .flatMap((check) => check.rejectionReasons || []);

  const reasonCounts = rejectionReasons.reduce(
    (acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const rejectionReasonData = Object.entries(reasonCounts).map(
    ([reason, count]) => ({
      name:
        REJECTION_REASONS[reason as keyof typeof REJECTION_REASONS]?.label ||
        reason,
      value: count,
      percentage:
        rejectedChecks > 0 ? Math.round((count / rejectedChecks) * 100) : 0,
      color:
        REJECTION_REASONS[reason as keyof typeof REJECTION_REASONS]?.color ||
        "var(--muted-foreground)",
    }),
  );

  // Calidad por etapa
  const qualityByStage = useMemo(() => {
    return [
      "reception",
      "classification",
      "selection",
      "packaging",
      "distribution",
    ].map((stage) => {
      const stageChecks = filteredChecks.filter(
        (check) => check.stage === stage,
      );
      const stageApproved = stageChecks.filter(
        (check) => check.status === "passed",
      ).length;
      const stageRejected = stageChecks.filter(
        (check) => check.status === "failed",
      ).length;
      const stageTotal = stageChecks.length;

      return {
        stage,
        total: stageTotal,
        approved: stageApproved,
        rejected: stageRejected,
        approvalRate:
          stageTotal > 0 ? Math.round((stageApproved / stageTotal) * 100) : 0,
        rejectionRate:
          stageTotal > 0 ? Math.round((stageRejected / stageTotal) * 100) : 0,
      };
    });
  }, [filteredChecks]);

  // Inspectores principales
  const inspectors = Array.from(
    new Set(filteredChecks.map((check) => check.inspector)),
  );

  const topInspectors = useMemo(() => {
    return inspectors
      .map((inspector) => {
        const inspectorChecks = filteredChecks.filter(
          (check) => check.inspector === inspector,
        );
        const inspectorApproved = inspectorChecks.filter(
          (check) => check.status === "passed",
        ).length;
        const inspectorTotal = inspectorChecks.length;

        return {
          inspector,
          total: inspectorTotal,
          approved: inspectorApproved,
          approvalRate:
            inspectorTotal > 0
              ? Math.round((inspectorApproved / inspectorTotal) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredChecks, inspectors]);

  // Datos para gráfico de distribución de calidad
  const qualityDistributionData = [
    { name: "Aprobado", value: approvedChecks, color: "var(--green-500)" },
    { name: "Rechazado", value: rejectedChecks, color: "var(--red-500)" },
    { name: "Observaciones", value: warningChecks, color: "var(--orange-500)" },
  ];

  return {
    statusFilter,
    setStatusFilter,
    inspectorFilter,
    setInspectorFilter,
    filteredChecks,
    totalChecks,
    approvedChecks,
    rejectedChecks,
    warningChecks,
    approvalRate,
    rejectionReasonData,
    qualityByStage,
    inspectors,
    topInspectors,
    qualityDistributionData,
  };
}
