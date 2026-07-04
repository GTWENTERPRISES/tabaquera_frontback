"use client";

import { useState, useEffect, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import { STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import type { Alerta } from "@/services/api";

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

const severityFromApi = (s: string): DelayAlert["severity"] => {
  switch (s) {
    case "critica": return "critical";
    case "alta": return "high";
    case "media": return "medium";
    default: return "low";
  }
};

const typeFromApi = (t: string): DelayAlert["type"] => {
  switch (t) {
    case "cuello_botella": return "bottleneck";
    case "calidad_rechazada": return "quality";
    case "sistema": return "system";
    default: return "delay";
  }
};

export function useDelayAlerts() {
  const { lots, alertas, addObservation } = useLots();
  const [localAlerts, setLocalAlerts] = useState<DelayAlert[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [acknowledgingIds, setAcknowledgingIds] = useState<string[]>([]);
  const [successIds, setSuccessIds] = useState<string[]>([]);

  // Map real backend alertas to DelayAlert shape
  const backendAlerts = useMemo<DelayAlert[]>(() => {
    return alertas.map((a: Alerta) => ({
      id: `api-${a.id}`,
      type: typeFromApi(a.tipo),
      severity: severityFromApi(a.severidad),
      title: a.titulo,
      description: a.descripcion,
      lotId: a.lote?.toString(),
      lotCode: a.lote_codigo,
      stage: undefined,
      durationHours: 0,
      thresholdHours: 0,
      date: a.fecha_creacion,
      acknowledged: a.estado !== "activa",
    }));
  }, [alertas]);

  // Detect bottlenecks locally (still based on lot counts per stage)
  const detectBottlenecks = useMemo<DelayAlert[]>(() => {
    const stageCounts: Record<Stage, number> = {
      reception: 0, classification: 0, selection: 0, packaging: 0, distribution: 0,
    };
    lots.forEach((lot) => {
      if (lot.status === "active" || lot.status === "in_production") {
        stageCounts[lot.currentStage]++;
      }
    });

    const thresholds: Record<Stage, number> = {
      reception: 5, classification: 4, selection: 4, packaging: 3, distribution: 2,
    };

    return STAGES.flatMap((stage) => {
      const count = stageCounts[stage];
      const threshold = thresholds[stage];
      if (count < threshold) return [];
      const severity =
        count >= threshold * 2 ? "critical"
          : count >= threshold * 1.5 ? "high"
          : count >= threshold * 1.2 ? "medium"
          : "low";
      return [{
        id: `bottleneck-${stage}`,
        type: "bottleneck" as const,
        severity,
        title: `Cuello de botella en ${stage}`,
        description: `${count} lotes pendientes en ${stage} (umbral: ${threshold})`,
        stage: stage as Stage,
        durationHours: 0,
        thresholdHours: 0,
        date: new Date().toISOString(),
        acknowledged: false,
      }];
    });
  }, [lots]);

  // Detect delays using fecha_actualizacion (since stageHistory is empty)
  const detectDelays = useMemo<DelayAlert[]>(() => {
    const now = new Date();
    const stageThresholds: Record<Stage, number> = {
      reception: 4, classification: 6, selection: 5, packaging: 3, distribution: 8,
    };

    return lots
      .filter((lot) =>
        lot.status === "active" || lot.status === "in_production" || lot.status === "waiting"
      )
      .flatMap((lot) => {
        const lastUpdate = new Date(lot.lastUpdatedAt || lot.fechaIngreso || now);
        const durationHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        const threshold = stageThresholds[lot.currentStage] ?? 8;
        if (durationHours <= threshold) return [];
        const severity =
          durationHours > threshold * 2 ? "critical"
            : durationHours > threshold * 1.5 ? "high"
            : durationHours > threshold * 1.2 ? "medium"
            : "low";
        return [{
          id: `delay-${lot.id}`,
          type: "delay" as const,
          severity,
          title: `Retraso en ${lot.currentStage}`,
          description: `Lote ${lot.codigo || lot.code} lleva ${Math.round(durationHours)}h sin avanzar (umbral: ${threshold}h)`,
          lotId: lot.id,
          lotCode: lot.codigo || lot.code,
          stage: lot.currentStage as Stage,
          durationHours,
          thresholdHours: threshold,
          date: new Date().toISOString(),
          acknowledged: false,
        }];
      });
  }, [lots]);

  // Merge: backend alerts take precedence, then local computed
  useEffect(() => {
    const merged = [
      ...backendAlerts,
      ...detectDelays,
      ...detectBottlenecks,
    ];
    // Deduplicate: prefer backend alerts for same lot+type
    const seen = new Set<string>();
    const unique = merged.filter((alert) => {
      const key = `${alert.type}-${alert.lotId ?? ""}-${alert.stage ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setLocalAlerts(unique);
  }, [backendAlerts, detectDelays, detectBottlenecks]);

  const acknowledgeAlert = (alertId: string) => {
    const alert = localAlerts.find((a) => a.id === alertId);
    if (!alert || acknowledgingIds.includes(alertId)) return;

    setAcknowledgingIds((prev) => [...prev, alertId]);
    window.setTimeout(() => {
      setLocalAlerts((prev) =>
        prev.map((item) => item.id === alertId ? { ...item, acknowledged: true } : item),
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
      window.setTimeout(() => setSuccessIds((prev) => prev.filter((id) => id !== alertId)), 2000);
    }, 700);
  };

  const filteredAlerts = localAlerts.filter((a) => showAcknowledged || !a.acknowledged);

  const alertStats = {
    total: localAlerts.length,
    unacknowledged: localAlerts.filter((a) => !a.acknowledged).length,
    critical: localAlerts.filter((a) => a.severity === "critical").length,
    byType: {
      delay: localAlerts.filter((a) => a.type === "delay").length,
      bottleneck: localAlerts.filter((a) => a.type === "bottleneck").length,
      quality: localAlerts.filter((a) => a.type === "quality").length,
    },
  };

  return {
    alerts: localAlerts,
    showAcknowledged,
    setShowAcknowledged,
    acknowledgingIds,
    successIds,
    acknowledgeAlert,
    filteredAlerts,
    alertStats,
  };
}
