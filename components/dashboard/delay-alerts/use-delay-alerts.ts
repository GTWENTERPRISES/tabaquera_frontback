"use client";

import { useState, useEffect, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import { STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface DelayAlert {
  id: string;
  type: "delay" | "bottleneck" | "quality" | "system";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  lotId?: string;
  lotCode?: string;
  stage?: Stage;
  durationHours: number;
  thresholdHours: number;
  date: string;
  acknowledged: boolean;
}

export function useDelayAlerts() {
  const { lots, addObservation } = useLots();
  const [alerts, setAlerts] = useState<DelayAlert[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [acknowledgingIds, setAcknowledgingIds] = useState<string[]>([]);
  const [successIds, setSuccessIds] = useState<string[]>([]);

  const stageThresholds: Record<Stage, number> = {
    reception: 4,
    classification: 6,
    selection: 5,
    packaging: 3,
    distribution: 8,
  };

  const detectDelays = useMemo(() => {
    const now = new Date();
    const delayAlerts: DelayAlert[] = [];

    lots.forEach((lot) => {
      if (
        lot.status === "active" ||
        lot.status === "in_production" ||
        lot.status === "waiting"
      ) {
        const currentStage = lot.currentStage;
        const thresholdHours = stageThresholds[currentStage];

        const currentStageHistory = lot.stageHistory?.find(
          (h) => h.stage === currentStage && !h.endTime,
        );

        if (currentStageHistory) {
          const startTime = new Date(currentStageHistory.startTime);
          const durationMs = now.getTime() - startTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);

          if (durationHours > thresholdHours) {
            const severity =
              durationHours > thresholdHours * 2
                ? "critical"
                : durationHours > thresholdHours * 1.5
                  ? "high"
                  : durationHours > thresholdHours * 1.2
                    ? "medium"
                    : "low";

            delayAlerts.push({
              id: `delay-${lot.id}-${Date.now()}`,
              type: "delay",
              severity,
              title: `Retraso en ${currentStage}`,
              description: `El lote ${lot.codigo || lot.code} lleva ${durationHours.toFixed(1)} horas en ${currentStage} (umbral: ${thresholdHours}h)`,
              lotId: lot.id,
              lotCode: lot.codigo || lot.code,
              stage: currentStage,
              durationHours,
              thresholdHours,
              date: new Date().toISOString(),
              acknowledged: false,
            });
          }
        }
      }
    });

    return delayAlerts;
  }, [lots]);

  const detectBottlenecks = useMemo(() => {
    const bottleneckAlerts: DelayAlert[] = [];
    const stageCounts: Record<Stage, number> = {
      reception: 0,
      classification: 0,
      selection: 0,
      packaging: 0,
      distribution: 0,
    };

    lots.forEach((lot) => {
      if (lot.status === "active" || lot.status === "in_production") {
        stageCounts[lot.currentStage]++;
      }
    });

    const bottleneckThresholds: Record<Stage, number> = {
      reception: 5,
      classification: 4,
      selection: 4,
      packaging: 3,
      distribution: 2,
    };

    STAGES.forEach((stage) => {
      const count = stageCounts[stage];
      const threshold = bottleneckThresholds[stage];

      if (count >= threshold) {
        const severity =
          count >= threshold * 2
            ? "critical"
            : count >= threshold * 1.5
              ? "high"
              : count >= threshold * 1.2
                ? "medium"
                : "low";

        bottleneckAlerts.push({
          id: `bottleneck-${stage}-${Date.now()}`,
          type: "bottleneck",
          severity,
          title: `Cuello de botella en ${stage}`,
          description: `${count} lotes pendientes en ${stage} (umbral: ${threshold})`,
          stage,
          durationHours: 0,
          thresholdHours: 0,
          date: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });

    return bottleneckAlerts;
  }, [lots]);

  const detectQualityIssues = useMemo(() => {
    const qualityAlerts: DelayAlert[] = [];
    const recentRejectedLots = lots.filter((lot) => {
      if (lot.status === "rejected") {
        const rejectedDate = new Date(lot.lastUpdatedAt || Date.now());
        const now = new Date();
        const diffHours =
          (now.getTime() - rejectedDate.getTime()) / (1000 * 60 * 60);
        return diffHours < 24;
      }
      return false;
    });

    if (recentRejectedLots.length > 0) {
      qualityAlerts.push({
        id: `quality-${Date.now()}`,
        type: "quality",
        severity: recentRejectedLots.length > 3 ? "high" : "medium",
        title: "Lotes rechazados recientemente",
        description: `${recentRejectedLots.length} lotes rechazados en las últimas 24 horas`,
        durationHours: 0,
        thresholdHours: 0,
        date: new Date().toISOString(),
        acknowledged: false,
      });
    }

    return qualityAlerts;
  }, [lots]);

  useEffect(() => {
    const allAlerts = [
      ...detectDelays,
      ...detectBottlenecks,
      ...detectQualityIssues,
    ];

    const uniqueAlerts = allAlerts.filter(
      (alert, index, self) =>
        index ===
        self.findIndex(
          (a) =>
            a.lotId === alert.lotId &&
            a.type === alert.type &&
            a.stage === alert.stage,
        ),
    );

    setAlerts(uniqueAlerts);
  }, [detectDelays, detectBottlenecks, detectQualityIssues]);

  const acknowledgeAlert = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert || acknowledgingIds.includes(alertId)) return;

    setAcknowledgingIds((prev) => [...prev, alertId]);

    window.setTimeout(() => {
      setAlerts((prev) =>
        prev.map((item) =>
          item.id === alertId ? { ...item, acknowledged: true } : item,
        ),
      );

      if (alert.severity === "critical" && alert.lotId && alert.stage) {
        addObservation({
          lotId: alert.lotId,
          lotCode: alert.lotCode || "",
          stage: alert.stage,
          text: `Alerta crítica reconocida: ${alert.description}`,
          userId: "system",
          userName: "Sistema",
        });
      }

      setAcknowledgingIds((prev) => prev.filter((id) => id !== alertId));
      setSuccessIds((prev) => [...prev, alertId]);

      window.setTimeout(() => {
        setSuccessIds((prev) => prev.filter((id) => id !== alertId));
      }, 2000);
    }, 700);
  };

  const filteredAlerts = alerts.filter((alert) =>
    showAcknowledged ? true : !alert.acknowledged,
  );

  const alertStats = {
    total: alerts.length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    byType: {
      delay: alerts.filter((a) => a.type === "delay").length,
      bottleneck: alerts.filter((a) => a.type === "bottleneck").length,
      quality: alerts.filter((a) => a.type === "quality").length,
    },
  };

  return {
    alerts,
    showAcknowledged,
    setShowAcknowledged,
    acknowledgingIds,
    successIds,
    acknowledgeAlert,
    filteredAlerts,
    alertStats,
  };
}
