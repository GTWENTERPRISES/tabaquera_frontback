import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Lot, QualityCheck, LotStageHistory } from "./types";
import { STAGE_LABELS, APP_CONFIG } from "./constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Paleta de colores unificada ───────────────────────────────────────────
const BRAND = "#15803d";     // green-700 — primary del sistema
const BRAND_LIGHT = "#dcfce7"; // green-100
const BRAND_MID = "#166534";   // green-800 — headers
const TEXT = "#111827";
const TEXT_MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const ROW_ALT = "#f9fafb";

// ─── Estilos compartidos ───────────────────────────────────────────────────
const shared = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", backgroundColor: "#ffffff" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: BRAND,
  },
  headerLeft: { flex: 1 },
  headerBrand: { fontSize: 9, color: BRAND, fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 },
  headerTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: TEXT, marginBottom: 2 },
  headerSub: { fontSize: 9, color: TEXT_MUTED },
  headerRight: { alignItems: "flex-end" },
  headerDate: { fontSize: 9, color: TEXT_MUTED },
  headerPeriod: { fontSize: 8, color: TEXT_MUTED, marginTop: 2 },

  // Section
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND_MID,
    marginBottom: 8, paddingBottom: 4,
    borderBottomWidth: 1, borderBottomColor: BRAND_LIGHT,
  },

  // KPI row
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  kpiBox: {
    flex: 1, backgroundColor: BRAND_LIGHT, borderRadius: 6,
    padding: 10, alignItems: "center",
  },
  kpiValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BRAND_MID },
  kpiLabel: { fontSize: 8, color: TEXT_MUTED, marginTop: 2, textAlign: "center" },

  // Info rows
  infoRow: { flexDirection: "row", marginBottom: 5 },
  infoLabel: { width: "32%", fontSize: 9, fontFamily: "Helvetica-Bold", color: TEXT },
  infoValue: { width: "68%", fontSize: 9, color: TEXT_MUTED },

  // Table
  table: { width: "100%", borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" },
  tableRow: { flexDirection: "row" },
  tableRowAlt: { flexDirection: "row", backgroundColor: ROW_ALT },
  tableHead: {
    backgroundColor: BRAND_MID, padding: "6 8",
    fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff",
    borderRightWidth: 1, borderRightColor: BRAND,
  },
  tableCell: {
    padding: "5 8", fontSize: 8, color: TEXT_MUTED,
    borderRightWidth: 1, borderRightColor: BORDER,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },

  // Footer
  footer: {
    position: "absolute", bottom: 24, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6,
  },
  footerText: { fontSize: 7, color: TEXT_MUTED },
});

// ─── Header y Footer compartidos ──────────────────────────────────────────
function PDFHeader({ title, subtitle, dateRange }: {
  title: string;
  subtitle?: string;
  dateRange?: { from?: Date; to?: Date };
}) {
  const reportDate = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });
  const period = dateRange?.from && dateRange?.to
    ? `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: es })} — ${format(dateRange.to, "dd/MM/yyyy", { locale: es })}`
    : "Período: Todos los registros";

  return (
    <View style={shared.header}>
      <View style={shared.headerLeft}>
        <Text style={shared.headerBrand}>{APP_CONFIG.company}</Text>
        <Text style={shared.headerTitle}>{title}</Text>
        {subtitle && <Text style={shared.headerSub}>{subtitle}</Text>}
      </View>
      <View style={shared.headerRight}>
        <Text style={shared.headerDate}>Generado: {reportDate}</Text>
        <Text style={shared.headerPeriod}>{period}</Text>
      </View>
    </View>
  );
}

function PDFFooter({ page, total }: { page?: number; total?: number }) {
  return (
    <View style={shared.footer} fixed>
      <Text style={shared.footerText}>{APP_CONFIG.name} — {APP_CONFIG.description}</Text>
      {page !== undefined && total !== undefined && (
        <Text style={shared.footerText}>Página {page} de {total}</Text>
      )}
      <Text style={[shared.footerText, { color: BRAND }]} render={({ pageNumber, totalPages }) =>
        `Página ${pageNumber} de ${totalPages}`
      } />
    </View>
  );
}

// ─── Reporte de Producción ─────────────────────────────────────────────────
export function ProductionReportPDF({
  lots,
  dateRange,
}: {
  lots: Lot[];
  dateRange?: { from?: Date; to?: Date };
}) {
  const totalWeight = lots.reduce((acc, lot) => acc + (lot.currentWeight || 0), 0);
  const completedLots = lots.filter((l) => l.status === "completed" || l.status === "finalizado").length;
  const activeLots = lots.filter((l) => l.status === "active" || l.status === "en_produccion").length;

  return (
    <Document title="Reporte de Producción" author={APP_CONFIG.company}>
      <Page size="A4" style={shared.page}>
        <PDFHeader
          title="Reporte de Producción"
          subtitle="Consolidado por lote, etapa y volumen procesado"
          dateRange={dateRange}
        />

        {/* KPIs */}
        <View style={shared.kpiRow}>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{lots.length}</Text>
            <Text style={shared.kpiLabel}>Total de Lotes</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{totalWeight.toLocaleString()} kg</Text>
            <Text style={shared.kpiLabel}>Peso Total Procesado</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{completedLots}</Text>
            <Text style={shared.kpiLabel}>Lotes Completados</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{activeLots}</Text>
            <Text style={shared.kpiLabel}>Lotes Activos</Text>
          </View>
        </View>

        {/* Tabla de lotes */}
        <View style={shared.section}>
          <Text style={shared.sectionTitle}>Detalle de Lotes</Text>
          <View style={shared.table}>
            <View style={shared.tableRow}>
              {["Código", "Proveedor", "Etapa Actual", "Peso (kg)", "Estado"].map((h, i) => (
                <View key={i} style={[shared.tableHead, { flex: [1, 2, 2, 1, 1][i] }]}>
                  <Text>{h}</Text>
                </View>
              ))}
            </View>
            {lots.map((lot, idx) => (
              <View key={lot.id} style={idx % 2 === 0 ? shared.tableRow : shared.tableRowAlt}>
                <View style={[shared.tableCell, { flex: 1 }]}>
                  <Text>{lot.code || lot.codigo || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 2 }]}>
                  <Text>{lot.supplier || lot.proveedor || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 2 }]}>
                  <Text>{STAGE_LABELS[lot.currentStage as keyof typeof STAGE_LABELS] || lot.currentStage || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1 }]}>
                  <Text>{(lot.currentWeight || 0).toLocaleString()}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1, borderRightWidth: 0 }]}>
                  <Text style={{ textTransform: "capitalize" }}>{lot.status || "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}

// ─── Reporte de Calidad ────────────────────────────────────────────────────
export function QualityReportPDF({
  checks,
  dateRange,
}: {
  checks: QualityCheck[];
  dateRange?: { from?: Date; to?: Date };
}) {
  const approved = checks.filter((c) => c.status === "passed").length;
  const approvedWithNotes = checks.filter((c) => c.status === "passed_with_notes").length;
  const rejected = checks.filter((c) => c.status === "failed").length;
  const pending = checks.filter((c) => c.status === "pending" || c.status === "in_progress").length;
  const approvalRate = checks.length > 0 ? Math.round(((approved + approvedWithNotes) / checks.length) * 100) : 0;

  const statusLabel = (s: string) => {
    switch (s) {
      case "passed": return "Aprobado";
      case "failed": return "Rechazado";
      case "passed_with_notes": return "Con observ.";
      default: return "Pendiente";
    }
  };

  return (
    <Document title="Reporte de Calidad" author={APP_CONFIG.company}>
      <Page size="A4" style={shared.page}>
        <PDFHeader
          title="Reporte de Calidad"
          subtitle="Inspecciones, aprobaciones y motivos de rechazo"
          dateRange={dateRange}
        />

        {/* KPIs */}
        <View style={shared.kpiRow}>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{checks.length}</Text>
            <Text style={shared.kpiLabel}>Total Inspecciones</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={[shared.kpiValue, { color: "#166534" }]}>{approved + approvedWithNotes}</Text>
            <Text style={shared.kpiLabel}>Aprobadas</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={[shared.kpiValue, { color: "#991b1b" }]}>{rejected}</Text>
            <Text style={shared.kpiLabel}>Rechazadas</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{approvalRate}%</Text>
            <Text style={shared.kpiLabel}>Tasa de Aprobación</Text>
          </View>
        </View>

        {/* Tabla */}
        <View style={shared.section}>
          <Text style={shared.sectionTitle}>Detalle de Inspecciones</Text>
          <View style={shared.table}>
            <View style={shared.tableRow}>
              {["Lote", "Etapa", "Grado", "Inspector", "Resultado", "Fecha"].map((h, i) => (
                <View key={i} style={[shared.tableHead, { flex: [1, 2, 0.7, 1.5, 1.5, 1.8][i] }]}>
                  <Text>{h}</Text>
                </View>
              ))}
            </View>
            {checks.map((check, idx) => (
              <View key={check.id} style={idx % 2 === 0 ? shared.tableRow : shared.tableRowAlt}>
                <View style={[shared.tableCell, { flex: 1 }]}>
                  <Text>{check.lotCode || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 2 }]}>
                  <Text>{STAGE_LABELS[check.stage as keyof typeof STAGE_LABELS] || check.stage || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 0.7 }]}>
                  <Text>{check.grade || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1.5 }]}>
                  <Text>{check.inspector || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1.5 }]}>
                  <Text>{statusLabel(check.status)}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1.8, borderRightWidth: 0 }]}>
                  <Text>{check.date ? format(new Date(check.date), "dd/MM/yyyy HH:mm", { locale: es }) : "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}

// ─── Reporte de Trazabilidad ───────────────────────────────────────────────
export function TraceabilityReportPDF({
  lot,
}: {
  lot: Lot & { stageHistory?: LotStageHistory[] };
}) {
  const history = lot.stageHistory || [];

  return (
    <Document title={`Trazabilidad — ${lot.code || lot.codigo}`} author={APP_CONFIG.company}>
      <Page size="A4" style={shared.page}>
        <PDFHeader
          title="Reporte de Trazabilidad"
          subtitle={`Lote: ${lot.code || lot.codigo}`}
        />

        {/* Info del lote */}
        <View style={shared.section}>
          <Text style={shared.sectionTitle}>Información del Lote</Text>
          {[
            ["Código", lot.code || lot.codigo || "-"],
            ["Proveedor", lot.supplier || lot.proveedor || "-"],
            ["Variedad", lot.variety || "-"],
            ["Peso actual", `${lot.currentWeight || 0} kg`],
            ["Etapa actual", STAGE_LABELS[lot.currentStage as keyof typeof STAGE_LABELS] || lot.currentStage || "-"],
            ["Fecha ingreso", lot.entryDate || (lot as any).fechaIngreso
              ? format(new Date(lot.entryDate || (lot as any).fechaIngreso), "dd/MM/yyyy HH:mm", { locale: es })
              : "-"],
          ].map(([label, value], i) => (
            <View key={i} style={shared.infoRow}>
              <Text style={shared.infoLabel}>{label}:</Text>
              <Text style={shared.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Historial de etapas */}
        <View style={shared.section}>
          <Text style={shared.sectionTitle}>Historial de Etapas ({history.length} registros)</Text>
          <View style={shared.table}>
            <View style={shared.tableRow}>
              {["Etapa", "Responsable", "Inicio", "Fin", "Duración", "Observaciones"].map((h, i) => (
                <View key={i} style={[shared.tableHead, { flex: [1.5, 1.5, 1.8, 1.8, 1, 2][i] }]}>
                  <Text>{h}</Text>
                </View>
              ))}
            </View>
            {history.map((stage, idx) => (
              <View key={stage.id ?? idx} style={idx % 2 === 0 ? shared.tableRow : shared.tableRowAlt}>
                <View style={[shared.tableCell, { flex: 1.5 }]}>
                  <Text>{STAGE_LABELS[stage.stage as keyof typeof STAGE_LABELS] || stage.stage}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1.5 }]}>
                  <Text>{stage.responsibleUserName || (stage as any).operator || "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1.8 }]}>
                  <Text>{format(new Date(stage.startTime), "dd/MM/yy HH:mm", { locale: es })}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1.8 }]}>
                  <Text>{stage.endTime ? format(new Date(stage.endTime), "dd/MM/yy HH:mm", { locale: es }) : "En curso"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 1 }]}>
                  <Text>{stage.durationMinutes ? `${Math.floor(stage.durationMinutes / 60)}h ${stage.durationMinutes % 60}m` : "-"}</Text>
                </View>
                <View style={[shared.tableCell, { flex: 2, borderRightWidth: 0 }]}>
                  <Text>{stage.observations || (stage as any).notes || "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}

// ─── Reporte de Rendimiento ────────────────────────────────────────────────
export function PerformanceReportPDF({
  lots,
  dateRange,
}: {
  lots: Lot[];
  dateRange?: { from?: Date; to?: Date };
}) {
  // Calcular estadísticas por etapa
  const stageData: Record<string, { totalMinutes: number; count: number; minMinutes: number; maxMinutes: number }> = {};

  lots.forEach((lot) => {
    (lot.stageHistory || []).forEach((stage) => {
      if (stage.endTime && typeof stage.durationMinutes === "number") {
        if (!stageData[stage.stage]) {
          stageData[stage.stage] = { totalMinutes: 0, count: 0, minMinutes: Infinity, maxMinutes: 0 };
        }
        stageData[stage.stage].totalMinutes += stage.durationMinutes;
        stageData[stage.stage].count += 1;
        stageData[stage.stage].minMinutes = Math.min(stageData[stage.stage].minMinutes, stage.durationMinutes);
        stageData[stage.stage].maxMinutes = Math.max(stageData[stage.stage].maxMinutes, stage.durationMinutes);
      }
    });
  });

  const fmtTime = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const bottleneckCount = Object.values(stageData).filter((d) => d.count > 0 && (d.totalMinutes / d.count) / 60 >= 4).length;

  const totalAvgMinutes = Object.values(stageData).reduce((sum, d) =>
    sum + (d.count > 0 ? d.totalMinutes / d.count : 0), 0
  );

  return (
    <Document title="Reporte de Rendimiento" author={APP_CONFIG.company}>
      <Page size="A4" style={shared.page}>
        <PDFHeader
          title="Reporte de Rendimiento"
          subtitle="Tiempo promedio por etapa y detección de cuellos de botella"
          dateRange={dateRange}
        />

        {/* KPIs */}
        <View style={shared.kpiRow}>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{lots.length}</Text>
            <Text style={shared.kpiLabel}>Lotes Analizados</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{fmtTime(Math.round(totalAvgMinutes))}</Text>
            <Text style={shared.kpiLabel}>Tiempo Promedio Total</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={[shared.kpiValue, { color: bottleneckCount > 0 ? "#b45309" : BRAND }]}>{bottleneckCount}</Text>
            <Text style={shared.kpiLabel}>Cuellos de Botella</Text>
          </View>
          <View style={shared.kpiBox}>
            <Text style={shared.kpiValue}>{Object.keys(stageData).length}</Text>
            <Text style={shared.kpiLabel}>Etapas con Datos</Text>
          </View>
        </View>

        {/* Tabla por etapa */}
        <View style={shared.section}>
          <Text style={shared.sectionTitle}>Rendimiento por Etapa</Text>
          <View style={shared.table}>
            <View style={shared.tableRow}>
              {["Etapa", "Lotes", "Tpo. Promedio", "Tpo. Mínimo", "Tpo. Máximo", "Bottleneck"].map((h, i) => (
                <View key={i} style={[shared.tableHead, { flex: [2, 0.8, 1.5, 1.5, 1.5, 1.2][i] }]}>
                  <Text>{h}</Text>
                </View>
              ))}
            </View>
            {Object.entries(stageData).map(([stage, data], idx) => {
              const avg = data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0;
              const isBottleneck = avg / 60 >= 4;
              return (
                <View key={stage} style={idx % 2 === 0 ? shared.tableRow : shared.tableRowAlt}>
                  <View style={[shared.tableCell, { flex: 2 }]}>
                    <Text>{STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}</Text>
                  </View>
                  <View style={[shared.tableCell, { flex: 0.8 }]}>
                    <Text>{data.count}</Text>
                  </View>
                  <View style={[shared.tableCell, { flex: 1.5 }]}>
                    <Text>{fmtTime(avg)}</Text>
                  </View>
                  <View style={[shared.tableCell, { flex: 1.5 }]}>
                    <Text>{data.minMinutes === Infinity ? "-" : fmtTime(data.minMinutes)}</Text>
                  </View>
                  <View style={[shared.tableCell, { flex: 1.5 }]}>
                    <Text>{fmtTime(data.maxMinutes)}</Text>
                  </View>
                  <View style={[shared.tableCell, { flex: 1.2, borderRightWidth: 0 }]}>
                    <Text style={{ color: isBottleneck ? "#b45309" : BRAND, fontFamily: "Helvetica-Bold" }}>
                      {isBottleneck ? "⚠ Sí" : "No"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}
