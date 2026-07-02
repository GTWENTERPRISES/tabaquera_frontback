import type { Lot, QualityCheck, Movement, LotStageHistory } from "./types";

export function exportToCSV(
  data: any[],
  filename: string,
  headers: { key: string; label: string }[],
) {
  const csvContent = [
    headers.map((h) => h.label).join(","),
    ...data.map((item) =>
      headers
        .map((h) => {
          const value = item[h.key];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value ?? "";
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLotsToCSV(lots: Lot[], filename: string = "lotes") {
  exportToCSV(lots, filename, [
    { key: "codigo", label: "Código" },
    { key: "proveedor", label: "Proveedor" },
    { key: "peso", label: "Peso (kg)" },
    { key: "estado", label: "Estado" },
    { key: "fechaIngreso", label: "Fecha Ingreso" },
    { key: "responsable.nombre", label: "Responsable" },
  ]);
}

export function exportQualityReportToCSV(
  checks: QualityCheck[],
  dateRange?: { from?: Date; to?: Date },
  filename: string = "reporte-calidad",
) {
  const dateRangeStr =
    dateRange?.from && dateRange?.to
      ? `${dateRange.from.toLocaleDateString()}-${dateRange.to.toLocaleDateString()}`
      : "completo";

  const data = checks.map((check) => ({
    lote: check.lotCode,
    etapa: check.stage,
    grado: check.grade,
    temperatura: check.temperature,
    humedad: check.humidity,
    peso: check.weight,
    estado:
      check.status === "passed"
        ? "Aprobado"
        : check.status === "failed"
          ? "Rechazado"
          : "Observaciones",
    resultado: check.resultado,
    fecha_inspeccion: new Date(
      check.date || check.fechaInspeccion || Date.now(),
    ).toLocaleDateString(),
    inspector: check.inspector,
    observaciones: check.notes || check.observaciones,
    motivos_rechazo: check.rejectionReasons?.join(", ") || "-",
  }));

  exportToCSV(data, `${filename}-${dateRangeStr}`, [
    { key: "lote", label: "Lote" },
    { key: "etapa", label: "Etapa" },
    { key: "grado", label: "Grado" },
    { key: "temperatura", label: "Temperatura (°C)" },
    { key: "humedad", label: "Humedad (%)" },
    { key: "peso", label: "Peso (kg)" },
    { key: "estado", label: "Estado" },
    { key: "resultado", label: "Resultado" },
    { key: "fecha_inspeccion", label: "Fecha Inspección" },
    { key: "inspector", label: "Inspector" },
    { key: "observaciones", label: "Observaciones" },
    { key: "motivos_rechazo", label: "Motivos de Rechazo" },
  ]);
}

export function exportQualityToCSV(
  checks: QualityCheck[],
  filename: string = "controles-calidad",
) {
  exportToCSV(checks, filename, [
    { key: "lotCode", label: "Lote" },
    { key: "stage", label: "Etapa" },
    { key: "grade", label: "Grado" },
    { key: "temperature", label: "Temperatura (°C)" },
    { key: "humidity", label: "Humedad (%)" },
    { key: "status", label: "Estado" },
    { key: "date", label: "Fecha" },
    { key: "inspector", label: "Inspector" },
  ]);
}

export function exportProductionReportToCSV(
  lots: Lot[],
  dateRange?: { from?: Date; to?: Date },
  filename: string = "reporte-produccion",
) {
  const dateRangeStr =
    dateRange?.from && dateRange?.to
      ? `${dateRange.from.toLocaleDateString()}-${dateRange.to.toLocaleDateString()}`
      : "completo";

  const data = lots.map((lot) => ({
    codigo: lot.codigo || lot.code,
    proveedor: lot.proveedor || lot.supplier,
    etapa: lot.currentStage,
    peso_kg: lot.currentWeight,
    estado:
      lot.status === "active"
        ? "Activo"
        : lot.status === "completed"
          ? "Completado"
          : lot.status === "rejected"
            ? "Rechazado"
            : lot.status === "on_hold"
              ? "En Espera"
              : lot.status,
    fecha_ingreso: new Date(
      lot.entryDate || lot.fechaIngreso || Date.now(),
    ).toLocaleDateString(),
    responsable: lot.responsable?.nombre || "Sistema",
    calidad: lot.quality,
    observaciones: lot.observaciones || lot.notes,
  }));

  exportToCSV(data, `${filename}-${dateRangeStr}`, [
    { key: "codigo", label: "Código" },
    { key: "proveedor", label: "Proveedor" },
    { key: "etapa", label: "Etapa" },
    { key: "peso_kg", label: "Peso (kg)" },
    { key: "estado", label: "Estado" },
    { key: "fecha_ingreso", label: "Fecha Ingreso" },
    { key: "responsable", label: "Responsable" },
    { key: "calidad", label: "Calidad" },
    { key: "observaciones", label: "Observaciones" },
  ]);
}

export function exportPerformanceReportToCSV(
  lots: Lot[],
  dateRange?: { from?: Date; to?: Date },
  filename: string = "reporte-rendimiento",
) {
  const dateRangeStr =
    dateRange?.from && dateRange?.to
      ? `${dateRange.from.toLocaleDateString()}-${dateRange.to.toLocaleDateString()}`
      : "completo";

  // Calcular estadísticas por etapa
  const STAGES = [
    "reception",
    "classification",
    "selection",
    "packaging",
    "distribution",
  ];
  const STAGE_LABELS: Record<string, string> = {
    reception: "Recepción",
    classification: "Clasificación",
    selection: "Selección",
    packaging: "Empaque",
    distribution: "Distribución",
  };

  const stageStats = STAGES.map((stage) => {
    const stageLots = lots.filter((lot) => {
      const hasStageHistory = lot.stageHistory?.some((h) => h.stage === stage);
      if (!hasStageHistory) return false;

      if (dateRange?.from && dateRange?.to) {
        const lotDate = new Date(
          lot.entryDate || lot.fechaIngreso || Date.now(),
        );
        return lotDate >= dateRange.from && lotDate <= dateRange.to;
      }

      return true;
    });

    const stageHistories = stageLots.flatMap(
      (lot) => lot.stageHistory?.filter((h) => h.stage === stage) || [],
    );

    const durations = stageHistories
      .filter((h) => h.durationMinutes)
      .map((h) => h.durationMinutes!);

    const avgDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    const pendingLots = stageLots.filter((lot) => lot.currentStage === stage);
    const completedLots = stageLots.filter((lot) => lot.currentStage !== stage);

    return {
      etapa: STAGE_LABELS[stage] || stage,
      lotes_totales: stageLots.length,
      lotes_pendientes: pendingLots.length,
      lotes_completados: completedLots.length,
      tiempo_promedio_horas: Math.floor(avgDuration / 60),
      tiempo_promedio_minutos: Math.round(avgDuration % 60),
      tiempo_minimo_horas:
        durations.length > 0 ? Math.floor(Math.min(...durations) / 60) : 0,
      tiempo_maximo_horas:
        durations.length > 0 ? Math.floor(Math.max(...durations) / 60) : 0,
      es_cuello_botella: avgDuration / 60 >= 4 ? "Sí" : "No",
      severidad_cuello_botella:
        avgDuration / 60 >= 6
          ? "Alta"
          : avgDuration / 60 >= 4
            ? "Media"
            : "Baja",
      eficiencia:
        completedLots.length > 0
          ? ((completedLots.length / stageLots.length) * 100).toFixed(1)
          : "0.0",
    };
  });

  exportToCSV(stageStats, `${filename}-${dateRangeStr}`, [
    { key: "etapa", label: "Etapa" },
    { key: "lotes_totales", label: "Lotes Totales" },
    { key: "lotes_pendientes", label: "Lotes Pendientes" },
    { key: "lotes_completados", label: "Lotes Completados" },
    { key: "tiempo_promedio_horas", label: "Tiempo Promedio (horas)" },
    { key: "tiempo_promedio_minutos", label: "Tiempo Promedio (minutos)" },
    { key: "tiempo_minimo_horas", label: "Tiempo Mínimo (horas)" },
    { key: "tiempo_maximo_horas", label: "Tiempo Máximo (horas)" },
    { key: "es_cuello_botella", label: "Es Cuello de Botella" },
    { key: "severidad_cuello_botella", label: "Severidad Cuello de Botella" },
    { key: "eficiencia", label: "Eficiencia (%)" },
  ]);
}

export function exportTraceabilityReportToCSV(
  lot: Lot,
  events: (Movement | { [key: string]: any })[],
  stageHistory: LotStageHistory[],
  filename: string = "reporte-trazabilidad",
) {
  const STAGE_LABELS: Record<string, string> = {
    reception: "Recepción",
    classification: "Clasificación",
    selection: "Selección",
    packaging: "Empaque",
    distribution: "Distribución",
  };

  // Exportar historia de etapas
  const stageData = stageHistory.map((stage) => ({
    etapa: STAGE_LABELS[stage.stage] || stage.stage,
    responsable: stage.responsibleUserName,
    fecha_inicio: new Date(stage.startTime).toLocaleDateString(),
    fecha_fin: stage.endTime
      ? new Date(stage.endTime).toLocaleDateString()
      : "En curso",
    duracion: stage.durationMinutes
      ? `${Math.floor(stage.durationMinutes / 60)}h ${stage.durationMinutes % 60}m`
      : "En curso",
    observaciones: stage.observaciones || "-",
  }));

  exportToCSV(stageData, `${filename}-${lot.codigo || lot.code}`, [
    { key: "etapa", label: "Etapa" },
    { key: "responsable", label: "Responsable" },
    { key: "fecha_inicio", label: "Fecha Inicio" },
    { key: "fecha_fin", label: "Fecha Fin" },
    { key: "duracion", label: "Duración" },
    { key: "observaciones", label: "Observaciones" },
  ]);
}
