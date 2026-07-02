import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Line,
} from "@react-pdf/renderer";
import type { Lot, QualityCheck, LotStageHistory } from "./types";
import { STAGE_LABELS, APP_CONFIG } from "./constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
    padding: 6,
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
    padding: 6,
    fontSize: 9,
    color: "#4b5563",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: "30%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  infoValue: {
    width: "70%",
    fontSize: 10,
    color: "#4b5563",
  },
  timelineItem: {
    marginLeft: 10,
    marginBottom: 12,
    paddingLeft: 10,
    borderLeft: 2,
    borderLeftColor: "#3b82f6",
  },
  statusBadge: {
    fontSize: 8,
    padding: 3,
    borderRadius: 3,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

// Create Production Report PDF
export function ProductionReportPDF({
  lots,
  dateRange,
}: {
  lots: Lot[];
  dateRange?: { from?: Date; to?: Date };
}) {
  const totalWeight = lots.reduce((acc, lot) => acc + lot.currentWeight, 0);
  const reportDate = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{APP_CONFIG.company}</Text>
            <Text style={styles.subtitle}>Reporte de Producción</Text>
          </View>
          <View>
            <Text style={[styles.subtitle, { textAlign: "right" }]}>
              Fecha: {format(reportDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Lotes:</Text>
            <Text style={styles.infoValue}>{lots.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso Total Procesado:</Text>
            <Text style={styles.infoValue}>
              {totalWeight.toLocaleString()} kg
            </Text>
          </View>
          {dateRange && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Periodo:</Text>
              <Text style={styles.infoValue}>
                {dateRange.from
                  ? format(dateRange.from, "dd/MM/yyyy", { locale: es })
                  : "Desde siempre"}{" "}
                -{" "}
                {dateRange.to
                  ? format(dateRange.to, "dd/MM/yyyy", { locale: es })
                  : "Hasta hoy"}
              </Text>
            </View>
          )}
        </View>

        {/* Lots Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Lotes</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: "15%" }]}>
                <Text>Lote</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text>Proveedor</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "20%" }]}>
                <Text>Etapa</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "15%" }]}>
                <Text>Peso (kg)</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text>Estado</Text>
              </View>
            </View>
            {lots.map((lot) => (
              <View key={lot.id} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text>{lot.code || lot.codigo}</Text>
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text>{lot.supplier || lot.proveedor}</Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text>
                    {STAGE_LABELS[
                      lot.currentStage as keyof typeof STAGE_LABELS
                    ] || lot.currentStage}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text>{lot.currentWeight}</Text>
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text style={{ textTransform: "capitalize" }}>
                    {lot.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{APP_CONFIG.name} - Sistema de Trazabilidad Industrial</Text>
        </View>
      </Page>
    </Document>
  );
}

// Create Quality Report PDF
export function QualityReportPDF({
  checks,
  dateRange,
}: {
  checks: QualityCheck[];
  dateRange?: { from?: Date; to?: Date };
}) {
  const approved = checks.filter(
    (c) => c.status === "passed" || c.status === "passed_with_notes",
  ).length;
  const rejected = checks.filter((c) => c.status === "failed").length;
  const pending = checks.filter(
    (c) => c.status === "pending" || c.status === "in_progress",
  ).length;
  const approvalRate =
    checks.length > 0 ? Math.round((approved / checks.length) * 100) : 0;
  const reportDate = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{APP_CONFIG.company}</Text>
            <Text style={styles.subtitle}>Reporte de Calidad</Text>
          </View>
          <View>
            <Text style={[styles.subtitle, { textAlign: "right" }]}>
              Fecha: {format(reportDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Inspecciones:</Text>
            <Text style={styles.infoValue}>{checks.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aprobadas:</Text>
            <Text style={styles.infoValue}>
              {approved} ({approvalRate}%)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rechazadas:</Text>
            <Text style={styles.infoValue}>{rejected}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pendientes:</Text>
            <Text style={styles.infoValue}>{pending}</Text>
          </View>
          {dateRange && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Periodo:</Text>
              <Text style={styles.infoValue}>
                {dateRange.from
                  ? format(dateRange.from, "dd/MM/yyyy", { locale: es })
                  : "Desde siempre"}{" "}
                -{" "}
                {dateRange.to
                  ? format(dateRange.to, "dd/MM/yyyy", { locale: es })
                  : "Hasta hoy"}
              </Text>
            </View>
          )}
        </View>

        {/* Checks Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Inspecciones</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: "15%" }]}>
                <Text>Lote</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "20%" }]}>
                <Text>Etapa</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "10%" }]}>
                <Text>Grado</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "15%" }]}>
                <Text>Inspector</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "20%" }]}>
                <Text>Resultado</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "20%" }]}>
                <Text>Fecha</Text>
              </View>
            </View>
            {checks.map((check) => (
              <View key={check.id} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text>{check.lotCode}</Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text>
                    {STAGE_LABELS[check.stage as keyof typeof STAGE_LABELS] ||
                      check.stage}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text>{check.grade}</Text>
                </View>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text>{check.inspector}</Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text style={{ textTransform: "capitalize" }}>
                    {check.status === "passed"
                      ? "Aprobado"
                      : check.status === "failed"
                        ? "Rechazado"
                        : check.status === "passed_with_notes"
                          ? "Aprobado con obs."
                          : "Pendiente"}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text>
                    {check.date
                      ? format(new Date(check.date), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })
                      : "-"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{APP_CONFIG.name} - Sistema de Trazabilidad Industrial</Text>
        </View>
      </Page>
    </Document>
  );
}

// Create Traceability Report PDF
export function TraceabilityReportPDF({
  lot,
}: {
  lot: Lot & { stageHistory: LotStageHistory[] };
}) {
  const reportDate = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{APP_CONFIG.company}</Text>
            <Text style={styles.subtitle}>Reporte de Trazabilidad</Text>
          </View>
          <View>
            <Text style={[styles.subtitle, { textAlign: "right" }]}>
              Fecha: {format(reportDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Lote</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Código:</Text>
            <Text style={styles.infoValue}>{lot.code || lot.codigo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Proveedor:</Text>
            <Text style={styles.infoValue}>
              {lot.supplier || lot.proveedor}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso:</Text>
            <Text style={styles.infoValue}>{lot.currentWeight} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Variedad:</Text>
            <Text style={styles.infoValue}>{lot.variety}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha Ingreso:</Text>
            <Text style={styles.infoValue}>
              {format(
                new Date(lot.entryDate || lot.fechaIngreso || new Date()),
                "dd/MM/yyyy HH:mm",
                { locale: es },
              )}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Etapas</Text>
          {lot.stageHistory.map((stage, index) => (
            <View key={stage.id} style={styles.timelineItem}>
              <View style={[styles.infoRow, { marginBottom: 4 }]}>
                <Text style={styles.infoLabel}>
                  <Text style={{ fontWeight: "bold", color: "#2563eb" }}>
                    {STAGE_LABELS[stage.stage as keyof typeof STAGE_LABELS] ||
                      stage.stage}
                  </Text>
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Responsable:</Text>
                <Text style={styles.infoValue}>
                  {stage.responsibleUserName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inicio:</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(stage.startTime), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </Text>
              </View>
              {stage.endTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fin:</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(stage.endTime), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </Text>
                </View>
              )}
              {stage.durationMinutes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duración:</Text>
                  <Text style={styles.infoValue}>
                    {Math.floor(stage.durationMinutes / 60)}h{" "}
                    {stage.durationMinutes % 60}m
                  </Text>
                </View>
              )}
              {stage.observations && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Observaciones:</Text>
                  <Text style={styles.infoValue}>{stage.observations}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>{APP_CONFIG.name} - Sistema de Trazabilidad Industrial</Text>
        </View>
      </Page>
    </Document>
  );
}

// Create Performance Report PDF
export function PerformanceReportPDF({
  lots,
  dateRange,
}: {
  lots: Lot[];
  dateRange?: { from?: Date; to?: Date };
}) {
  // Calculate stage performance
  const stageData: Record<string, { totalMinutes: number; count: number }> = {};

  lots.forEach((lot) => {
    lot.stageHistory.forEach((stage) => {
      if (stage.endTime && stage.durationMinutes) {
        if (!stageData[stage.stage]) {
          stageData[stage.stage] = { totalMinutes: 0, count: 0 };
        }
        stageData[stage.stage].totalMinutes += stage.durationMinutes;
        stageData[stage.stage].count += 1;
      }
    });
  });

  const reportDate = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{APP_CONFIG.company}</Text>
            <Text style={styles.subtitle}>Reporte de Rendimiento</Text>
          </View>
          <View>
            <Text style={[styles.subtitle, { textAlign: "right" }]}>
              Fecha: {format(reportDate, "dd/MM/yyyy HH:mm", { locale: es })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Lotes Analizados:</Text>
            <Text style={styles.infoValue}>{lots.length}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rendimiento por Etapa</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: "30%" }]}>
                <Text>Etapa</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "20%" }]}>
                <Text>Lotes</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text>Tiempo Promedio</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text>Tiempo Total</Text>
              </View>
            </View>
            {Object.entries(stageData).map(([stage, data]) => {
              const avgMinutes =
                data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0;
              const avgHours = Math.floor(avgMinutes / 60);
              const avgMins = avgMinutes % 60;
              const totalHours = Math.floor(data.totalMinutes / 60);
              const totalMins = data.totalMinutes % 60;

              return (
                <View key={stage} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: "30%" }]}>
                    <Text>
                      {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ||
                        stage}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: "20%" }]}>
                    <Text>{data.count}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: "25%" }]}>
                    <Text>
                      {avgHours}h {avgMins}m
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: "25%" }]}>
                    <Text>
                      {totalHours}h {totalMins}m
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>{APP_CONFIG.name} - Sistema de Trazabilidad Industrial</Text>
        </View>
      </Page>
    </Document>
  );
}
