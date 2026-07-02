import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Lot, QualityCheck, Movement, SystemEvent } from "./types";
import { STAGE_LABELS } from "./constants";

// Configuración del PDF
const PDF_CONFIG = {
  pageSize: "a4" as const,
  orientation: "portrait" as const,
  margin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  font: {
    normal: "helvetica",
    bold: "helvetica",
    size: {
      title: 16,
      subtitle: 12,
      normal: 10,
      small: 8,
    },
  },
  colors: {
    primary: "#1e40af",
    secondary: "#6b7280",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    lightGray: "#f3f4f6",
  },
};

// Interfaz para datos de reporte
interface ReportData {
  title: string;
  subtitle?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  generatedBy?: string;
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  type: "table" | "text" | "stats";
  data?: any[];
  columns?: { header: string; dataKey: string }[];
  content?: string;
  stats?: Record<string, any>;
}

// Función principal para generar PDF
export function generatePDFReport(
  reportData: ReportData,
  filename: string = "reporte",
) {
  const doc = new jsPDF({
    orientation: PDF_CONFIG.orientation,
    unit: "mm",
    format: PDF_CONFIG.pageSize,
  });

  // Configurar fuente
  doc.setFont(PDF_CONFIG.font.normal);
  doc.setFontSize(PDF_CONFIG.font.size.normal);

  // Encabezado
  addHeader(doc, reportData);

  // Contenido
  let currentY = PDF_CONFIG.margin.top + 30;

  reportData.sections.forEach((section, index) => {
    // Agregar título de sección
    doc.setFont(PDF_CONFIG.font.bold, "bold");
    doc.setFontSize(PDF_CONFIG.font.size.subtitle);
    doc.text(section.title, PDF_CONFIG.margin.left, currentY);
    currentY += 8;

    // Agregar contenido según tipo
    switch (section.type) {
      case "table":
        if (section.data && section.columns) {
          currentY = addTable(doc, section.data, section.columns, currentY);
        }
        break;
      case "stats":
        if (section.stats) {
          currentY = addStats(doc, section.stats, currentY);
        }
        break;
      case "text":
        if (section.content) {
          currentY = addText(doc, section.content, currentY);
        }
        break;
    }

    // Agregar espacio entre secciones
    if (index < reportData.sections.length - 1) {
      currentY += 10;
    }

    // Verificar si necesita nueva página
    if (currentY > 270) {
      doc.addPage();
      currentY = PDF_CONFIG.margin.top;
    }
  });

  // Pie de página
  addFooter(doc);

  // Guardar PDF
  doc.save(`${filename}.pdf`);
}

// Función para agregar encabezado
function addHeader(doc: jsPDF, reportData: ReportData) {
  const { title, subtitle, dateRange, generatedBy } = reportData;

  // Logo y título
  doc.setFont(PDF_CONFIG.font.bold, "bold");
  doc.setFontSize(PDF_CONFIG.font.size.title);
  doc.setTextColor(PDF_CONFIG.colors.primary);
  doc.text(
    "Golden Leaf Tabacos",
    PDF_CONFIG.margin.left,
    PDF_CONFIG.margin.top,
  );

  doc.setFont(PDF_CONFIG.font.bold, "bold");
  doc.setFontSize(PDF_CONFIG.font.size.subtitle);
  doc.setTextColor(PDF_CONFIG.colors.secondary);
  doc.text(title, PDF_CONFIG.margin.left, PDF_CONFIG.margin.top + 8);

  if (subtitle) {
    doc.setFont(PDF_CONFIG.font.normal, "normal");
    doc.setFontSize(PDF_CONFIG.font.size.normal);
    doc.text(subtitle, PDF_CONFIG.margin.left, PDF_CONFIG.margin.top + 14);
  }

  // Información del reporte
  const infoY = PDF_CONFIG.margin.top;
  const infoX = 150;

  doc.setFont(PDF_CONFIG.font.normal, "normal");
  doc.setFontSize(PDF_CONFIG.font.size.small);
  doc.setTextColor(PDF_CONFIG.colors.secondary);

  // Fecha de generación
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, infoX, infoY);

  // Rango de fechas
  if (dateRange?.from && dateRange?.to) {
    doc.text(
      `Período: ${dateRange.from.toLocaleDateString("es-ES")} - ${dateRange.to.toLocaleDateString("es-ES")}`,
      infoX,
      infoY + 4,
    );
  }

  // Generado por
  if (generatedBy) {
    doc.text(`Responsable: ${generatedBy}`, infoX, infoY + 8);
  }

  // Línea separadora
  doc.setDrawColor(PDF_CONFIG.colors.primary);
  doc.setLineWidth(0.5);
  doc.line(
    PDF_CONFIG.margin.left,
    PDF_CONFIG.margin.top + 20,
    210 - PDF_CONFIG.margin.right,
    PDF_CONFIG.margin.top + 20,
  );
}

// Función para agregar tabla
function addTable(
  doc: jsPDF,
  data: any[],
  columns: { header: string; dataKey: string }[],
  startY: number,
): number {
  const tableData = data.map((item) =>
    columns.map((col) => {
      const value = item[col.dataKey];
      return value !== undefined && value !== null ? String(value) : "";
    }),
  );

  const headers = columns.map((col) => col.header);

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY,
    theme: "striped",
    headStyles: {
      fillColor: PDF_CONFIG.colors.primary,
      textColor: "#ffffff",
      fontSize: PDF_CONFIG.font.size.normal,
    },
    bodyStyles: {
      fontSize: PDF_CONFIG.font.size.small,
    },
    alternateRowStyles: {
      fillColor: PDF_CONFIG.colors.lightGray,
    },
    margin: {
      left: PDF_CONFIG.margin.left,
      right: PDF_CONFIG.margin.right,
    },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Función para agregar estadísticas
function addStats(
  doc: jsPDF,
  stats: Record<string, any>,
  startY: number,
): number {
  let currentY = startY;

  Object.entries(stats).forEach(([key, value]) => {
    doc.setFont(PDF_CONFIG.font.normal, "normal");
    doc.setFontSize(PDF_CONFIG.font.size.normal);
    doc.setTextColor(PDF_CONFIG.colors.secondary);
    doc.text(`${key}:`, PDF_CONFIG.margin.left, currentY);

    doc.setFont(PDF_CONFIG.font.bold, "bold");
    doc.setTextColor(PDF_CONFIG.colors.primary);
    doc.text(String(value), PDF_CONFIG.margin.left + 40, currentY);

    currentY += 6;
  });

  return currentY;
}

// Función para agregar texto
function addText(doc: jsPDF, content: string, startY: number): number {
  const maxWidth = 210 - PDF_CONFIG.margin.left - PDF_CONFIG.margin.right;
  const lines = doc.splitTextToSize(content, maxWidth);

  doc.setFont(PDF_CONFIG.font.normal, "normal");
  doc.setFontSize(PDF_CONFIG.font.size.normal);
  doc.setTextColor(PDF_CONFIG.colors.secondary);

  lines.forEach((line: string, index: number) => {
    const y = startY + index * 6;
    if (y < 280) {
      doc.text(line, PDF_CONFIG.margin.left, y);
    }
  });

  return startY + lines.length * 6;
}

// Función para agregar pie de página
function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Línea separadora
    doc.setDrawColor(PDF_CONFIG.colors.lightGray);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONFIG.margin.left, 280, 210 - PDF_CONFIG.margin.right, 280);

    // Información del pie
    doc.setFont(PDF_CONFIG.font.normal, "normal");
    doc.setFontSize(PDF_CONFIG.font.size.small);
    doc.setTextColor(PDF_CONFIG.colors.secondary);

    // Página actual / total
    doc.text(`Página ${i} de ${pageCount}`, PDF_CONFIG.margin.left, 285);

    // Fecha y hora
    const now = new Date();
    const dateTime = now.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Generado: ${dateTime}`, 150, 285);

    // Sistema
    doc.text("Sistema de Trazabilidad Tabaquera", 70, 285);
  }
}

// Funciones específicas para cada tipo de reporte

export function generateProductionReportPDF(
  lots: Lot[],
  dateRange?: { from?: Date; to?: Date },
  generatedBy?: string,
) {
  const filteredLots =
    dateRange?.from && dateRange?.to
      ? lots.filter((lot) => {
          const lotDate = new Date(
            lot.entryDate || lot.fechaIngreso || Date.now(),
          );
          return lotDate >= dateRange.from! && lotDate <= dateRange.to!;
        })
      : lots;

  // Calcular estadísticas
  const totalWeight = filteredLots.reduce(
    (sum, lot) => sum + (lot.currentWeight || 0),
    0,
  );
  const avgWeight =
    filteredLots.length > 0 ? totalWeight / filteredLots.length : 0;

  const stageCounts: Record<string, number> = {};
  filteredLots.forEach((lot) => {
    const stage = lot.currentStage;
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const reportData: ReportData = {
    title: "Reporte de Producción",
    subtitle: "Análisis de lotes procesados",
    dateRange,
    generatedBy,
    sections: [
      {
        title: "Resumen General",
        type: "stats",
        stats: {
          "Total de Lotes": filteredLots.length,
          "Peso Total (kg)": totalWeight.toFixed(2),
          "Peso Promedio (kg)": avgWeight.toFixed(2),
          "Fecha de Generación": new Date().toLocaleDateString("es-ES"),
        },
      },
      {
        title: "Distribución por Etapa",
        type: "stats",
        stats: Object.entries(stageCounts).reduce(
          (acc, [stage, count]) => ({
            ...acc,
            [STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage]: count,
          }),
          {},
        ),
      },
      {
        title: "Detalle de Lotes",
        type: "table",
        data: filteredLots.map((lot) => ({
          codigo: lot.codigo || lot.code,
          proveedor: lot.proveedor || lot.supplier,
          etapa:
            STAGE_LABELS[lot.currentStage as keyof typeof STAGE_LABELS] ||
            lot.currentStage,
          peso_kg: lot.currentWeight?.toFixed(2) || "0.00",
          estado: getStatusLabel(lot.status),
          fecha_ingreso: new Date(
            lot.entryDate || lot.fechaIngreso || Date.now(),
          ).toLocaleDateString("es-ES"),
          responsable: lot.responsable?.nombre || "Sistema",
        })),
        columns: [
          { header: "Código", dataKey: "codigo" },
          { header: "Proveedor", dataKey: "proveedor" },
          { header: "Etapa", dataKey: "etapa" },
          { header: "Peso (kg)", dataKey: "peso_kg" },
          { header: "Estado", dataKey: "estado" },
          { header: "Fecha Ingreso", dataKey: "fecha_ingreso" },
          { header: "Responsable", dataKey: "responsable" },
        ],
      },
    ],
  };

  const dateRangeStr =
    dateRange?.from && dateRange?.to
      ? `${dateRange.from.toLocaleDateString("es-ES").replace(/\//g, "-")}_${dateRange.to.toLocaleDateString("es-ES").replace(/\//g, "-")}`
      : "completo";

  generatePDFReport(reportData, `reporte-produccion-${dateRangeStr}`);
}

export function generateQualityReportPDF(
  checks: QualityCheck[],
  dateRange?: { from?: Date; to?: Date },
  generatedBy?: string,
) {
  const filteredChecks =
    dateRange?.from && dateRange?.to
      ? checks.filter((check) => {
          const checkDate = new Date(check.date || Date.now());
          return checkDate >= dateRange.from! && checkDate <= dateRange.to!;
        })
      : checks;

  // Calcular estadísticas
  const statusCounts = {
    aprobados: filteredChecks.filter((c) => c.status === "passed").length,
    observaciones: filteredChecks.filter(
      (c) => c.status === "passed_with_notes",
    ).length,
    rechazados: filteredChecks.filter((c) => c.status === "failed").length,
  };

  const rejectionReasons: Record<string, number> = {};
  filteredChecks.forEach((check) => {
    check.rejectionReasons?.forEach((reason) => {
      rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
    });
  });

  const reportData: ReportData = {
    title: "Reporte de Calidad",
    subtitle: "Análisis de controles de calidad",
    dateRange,
    generatedBy,
    sections: [
      {
        title: "Resumen General",
        type: "stats",
        stats: {
          "Total de Controles": filteredChecks.length,
          Aprobados: statusCounts.aprobados,
          "Con Observaciones": statusCounts.observaciones,
          Rechazados: statusCounts.rechazados,
          "Tasa de Aprobación":
            filteredChecks.length > 0
              ? `${((statusCounts.aprobados / filteredChecks.length) * 100).toFixed(1)}%`
              : "0%",
        },
      },
      {
        title: "Motivos de Rechazo",
        type: "stats",
        stats: Object.entries(rejectionReasons).reduce(
          (acc, [reason, count]) => ({
            ...acc,
            [getRejectionReasonLabel(reason)]: count,
          }),
          {},
        ),
      },
      {
        title: "Detalle de Controles",
        type: "table",
        data: filteredChecks.map((check) => ({
          lote: check.lotCode,
          etapa:
            STAGE_LABELS[check.stage as keyof typeof STAGE_LABELS] ||
            check.stage,
          grado: check.grade,
          temperatura: check.temperature?.toFixed(1) || "-",
          humedad: check.humidity?.toFixed(1) || "-",
          estado: getQualityStatusLabel(check.status),
          fecha_inspeccion: new Date(
            check.date || Date.now(),
          ).toLocaleDateString("es-ES"),
          inspector: check.inspector,
          observaciones: check.notes || check.observaciones || "-",
        })),
        columns: [
          { header: "Lote", dataKey: "lote" },
          { header: "Etapa", dataKey: "etapa" },
          { header: "Grado", dataKey: "grado" },
          { header: "Temperatura (°C)", dataKey: "temperatura" },
          { header: "Humedad (%)", dataKey: "humedad" },
          { header: "Estado", dataKey: "estado" },
          { header: "Fecha Inspección", dataKey: "fecha_inspeccion" },
          { header: "Inspector", dataKey: "inspector" },
          { header: "Observaciones", dataKey: "observaciones" },
        ],
      },
    ],
  };

  const dateRangeStr =
    dateRange?.from && dateRange?.to
      ? `${dateRange.from.toLocaleDateString("es-ES").replace(/\//g, "-")}_${dateRange.to.toLocaleDateString("es-ES").replace(/\//g, "-")}`
      : "completo";

  generatePDFReport(reportData, `reporte-calidad-${dateRangeStr}`);
}

export function generatePerformanceReportPDF(
  lots: Lot[],
  dateRange?: { from?: Date; to?: Date },
  generatedBy?: string,
  options?: {
    stageFilter?: string;
    minimumHours?: number;
  },
) {
  const filteredLots =
    dateRange?.from && dateRange?.to
      ? lots.filter((lot) => {
          const lotDate = new Date(
            lot.entryDate || lot.fechaIngreso || Date.now(),
          );
          return lotDate >= dateRange.from! && lotDate <= dateRange.to!;
        })
      : lots;

  // Calcular estadísticas de rendimiento
  const STAGES = [
    "reception",
    "classification",
    "selection",
    "packaging",
    "distribution",
  ];
  const stageStats = STAGES.map((stage) => {
    const stageLots = filteredLots.filter((lot) =>
      lot.stageHistory?.some((h) => h.stage === stage),
    );

    const durations = stageLots.flatMap(
      (lot) =>
        lot.stageHistory
          ?.filter((h) => h.stage === stage && h.durationMinutes)
          .map((h) => h.durationMinutes!) || [],
    );

    const avgDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    const pendingLots = stageLots.filter((lot) => lot.currentStage === stage);
    const completedLots = stageLots.filter((lot) => lot.currentStage !== stage);

    return {
      stage,
      etapa: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage,
      lotes_totales: stageLots.length,
      lotes_pendientes: pendingLots.length,
      lotes_completados: completedLots.length,
      tiempo_promedio_horas: Math.floor(avgDuration / 60),
      tiempo_promedio_minutos: Math.round(avgDuration % 60),
      tiempo_promedio: `${Math.floor(avgDuration / 60)}h ${Math.round(avgDuration % 60)}m`,
      es_cuello_botella: avgDuration / 60 >= 4 ? "Sí" : "No",
      severidad:
        avgDuration / 60 >= 6
          ? "Alta"
          : avgDuration / 60 >= 4
            ? "Media"
            : "Baja",
      eficiencia:
        completedLots.length > 0
          ? ((completedLots.length / stageLots.length) * 100).toFixed(1)
          : "0.0",
      avgDuration,
    };
  });

  const visibleStageStats = stageStats.filter((stage) => {
    const matchesStage =
      !options?.stageFilter ||
      options.stageFilter === "all" ||
      stage.stage === options.stageFilter;
    const matchesMinimumHours =
      options?.minimumHours === undefined ||
      stage.avgDuration / 60 >= options.minimumHours;

    return matchesStage && matchesMinimumHours;
  });

  const totalDuration = visibleStageStats.reduce(
    (sum, stage) => sum + stage.avgDuration * stage.lotes_totales,
    0,
  );
  const avgTotalDuration =
    filteredLots.length > 0 ? totalDuration / filteredLots.length : 0;
  const bottleneckStages = visibleStageStats.filter(
    (stage) => stage.es_cuello_botella === "Sí",
  );
  const mostBottleneckStage =
    bottleneckStages.length > 0
      ? bottleneckStages.reduce((prev, current) =>
          prev.avgDuration > current.avgDuration ? prev : current,
        ).etapa
      : "Ninguna";

  const reportData: ReportData = {
    title: "Reporte de Rendimiento",
    subtitle: "Análisis de tiempo promedio por etapa",
    dateRange,
    generatedBy,
    sections: [
      {
        title: "Estadísticas Generales",
        type: "stats",
        stats: {
          "Total de Lotes Analizados": filteredLots.length,
          "Tiempo Promedio Total": `${Math.floor(avgTotalDuration / 60)}h ${Math.round(avgTotalDuration % 60)}m`,
          "Etapas con Cuellos de Botella": bottleneckStages.length,
          "Etapa Más Crítica": mostBottleneckStage,
          "Eficiencia General":
            visibleStageStats.length > 0
              ? `${(
                  visibleStageStats.reduce(
                    (sum, stage) => sum + Number(stage.eficiencia),
                    0,
                  ) / visibleStageStats.length
                ).toFixed(1)}%`
              : "0.0%",
          "Fecha de Análisis": new Date().toLocaleDateString("es-ES"),
        },
      },
      {
        title: "Rendimiento por Etapa",
        type: "table",
        data: visibleStageStats,
        columns: [
          { header: "Etapa", dataKey: "etapa" },
          { header: "Lotes Totales", dataKey: "lotes_totales" },
          { header: "Lotes Pendientes", dataKey: "lotes_pendientes" },
          { header: "Lotes Completados", dataKey: "lotes_completados" },
          { header: "Tiempo Promedio", dataKey: "tiempo_promedio" },
          { header: "Es Cuello de Botella", dataKey: "es_cuello_botella" },
          { header: "Severidad", dataKey: "severidad" },
          { header: "Eficiencia (%)", dataKey: "eficiencia" },
        ],
      },
      {
        title: "Recomendaciones",
        type: "text",
        content: getPerformanceRecommendations(visibleStageStats),
      },
    ],
  };

  const dateRangeStr =
    dateRange?.from && dateRange?.to
      ? `${dateRange.from.toLocaleDateString("es-ES").replace(/\//g, "-")}_${dateRange.to.toLocaleDateString("es-ES").replace(/\//g, "-")}`
      : "completo";

  generatePDFReport(reportData, `reporte-rendimiento-${dateRangeStr}`);
}

export function generateTraceabilityReportPDF(
  lot: Lot,
  movements: Movement[],
  observations: any[],
  systemEvents: SystemEvent[],
  generatedBy?: string,
) {
  const lotMovements = movements.filter((m) => m.lotId === lot.id);
  const lotObservations = observations.filter((o) => o.lotId === lot.id);
  const lotEvents = systemEvents.filter((e) => e.lotId === lot.id);

  const reportData: ReportData = {
    title: "Reporte de Trazabilidad",
    subtitle: `Historial completo del lote ${lot.codigo || lot.code}`,
    generatedBy,
    sections: [
      {
        title: "Información del Lote",
        type: "stats",
        stats: {
          Código: lot.codigo || lot.code,
          Proveedor: lot.proveedor || lot.supplier,
          "Peso Actual (kg)": lot.currentWeight?.toFixed(2) || "0.00",
          "Etapa Actual":
            STAGE_LABELS[lot.currentStage as keyof typeof STAGE_LABELS] ||
            lot.currentStage,
          Estado: getStatusLabel(lot.status),
          "Fecha de Ingreso": new Date(
            lot.entryDate || lot.fechaIngreso || Date.now(),
          ).toLocaleDateString("es-ES"),
          Responsable: lot.responsable?.nombre || "Sistema",
          Calidad: lot.quality,
        },
      },
      {
        title: "Historial de Etapas",
        type: "table",
        data:
          lot.stageHistory?.map((history) => ({
            etapa:
              STAGE_LABELS[history.stage as keyof typeof STAGE_LABELS] ||
              history.stage,
            fecha_inicio: new Date(history.startTime).toLocaleString("es-ES"),
            fecha_fin: history.endTime
              ? new Date(history.endTime).toLocaleString("es-ES")
              : "En curso",
            duracion_minutos: history.durationMinutes || "-",
            responsable: history.responsibleUserName,
            observaciones: history.observations || "-",
          })) || [],
        columns: [
          { header: "Etapa", dataKey: "etapa" },
          { header: "Fecha Inicio", dataKey: "fecha_inicio" },
          { header: "Fecha Fin", dataKey: "fecha_fin" },
          { header: "Duración (min)", dataKey: "duracion_minutos" },
          { header: "Responsable", dataKey: "responsable" },
          { header: "Observaciones", dataKey: "observaciones" },
        ],
      },
      {
        title: "Controles de Calidad",
        type: "table",
        data: lotEvents
          .filter((e) => e.type === "quality")
          .map((event) => ({
            fecha: new Date(event.date).toLocaleString("es-ES"),
            inspector: event.userName,
            resultado: event.detail.includes("aprobado")
              ? "Aprobado"
              : "Rechazado",
            observaciones: event.detail,
          })),
        columns: [
          { header: "Fecha", dataKey: "fecha" },
          { header: "Inspector", dataKey: "inspector" },
          { header: "Resultado", dataKey: "resultado" },
          { header: "Observaciones", dataKey: "observaciones" },
        ],
      },
      {
        title: "Observaciones Registradas",
        type: "text",
        content:
          lotObservations.length > 0
            ? lotObservations
                .map(
                  (obs) =>
                    `• ${new Date(obs.date).toLocaleString("es-ES")} - ${obs.userName}: ${obs.text}`,
                )
                .join("\n")
            : "No hay observaciones registradas para este lote.",
      },
    ],
  };

  generatePDFReport(
    reportData,
    `reporte-trazabilidad-${lot.codigo || lot.code}`,
  );
}

// Funciones auxiliares
function getStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Activo";
    case "completed":
      return "Completado";
    case "rejected":
      return "Rechazado";
    case "on_hold":
      return "En Espera";
    case "in_production":
      return "En Producción";
    case "waiting":
      return "En Espera";
    default:
      return status;
  }
}

function getQualityStatusLabel(status: string): string {
  switch (status) {
    case "passed":
      return "Aprobado";
    case "warning":
      return "Observaciones";
    case "failed":
      return "Rechazado";
    default:
      return status;
  }
}

function getRejectionReasonLabel(reason: string): string {
  switch (reason) {
    case "humidity":
      return "Humedad";
    case "color":
      return "Color";
    case "damage":
      return "Daños";
    case "size":
      return "Tamaño";
    case "odor":
      return "Olor";
    case "other":
      return "Otro";
    default:
      return reason;
  }
}

function getPerformanceRecommendations(stageStats: any[]): string {
  const bottlenecks = stageStats.filter((s) => s.es_cuello_botella === "Sí");

  if (bottlenecks.length === 0) {
    return "El sistema está funcionando de manera eficiente. No se detectaron cuellos de botella significativos.";
  }

  let recommendations =
    "Se detectaron cuellos de botella en las siguientes etapas:\n\n";

  bottlenecks.forEach((stage) => {
    recommendations += `• ${stage.etapa}:\n`;
    recommendations += `  - Tiempo promedio: ${stage.tiempo_promedio_horas}h ${stage.tiempo_promedio_minutos}m\n`;
    recommendations += `  - Severidad: ${stage.severidad}\n`;

    if (stage.severidad === "Alta") {
      recommendations +=
        "  - Recomendación: Revisión inmediata del proceso, posible reasignación de personal y verificación de equipos.\n";
    } else if (stage.severidad === "Media") {
      recommendations +=
        "  - Recomendación: Optimización del flujo de trabajo y capacitación del personal.\n";
    } else {
      recommendations +=
        "  - Recomendación: Monitoreo continuo e implementación de mejoras incrementales.\n";
    }

    recommendations += "\n";
  });

  return recommendations;
}
