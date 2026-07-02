"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Lot, QualityCheck } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#1e40af",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 5,
    paddingBottom: 5,
  },
  cell: {
    fontSize: 10,
    color: "#334155",
  },
  col1: { width: "20%" },
  col2: { width: "20%" },
  col3: { width: "20%" },
  col4: { width: "20%" },
  col5: { width: "20%" },
});

interface ProductionReportProps {
  lots: Lot[];
  qualityChecks: QualityCheck[];
  dateRange: { from?: Date; to?: Date };
}

export function ProductionReport({
  lots,
  qualityChecks,
  dateRange,
}: ProductionReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Golden Leaf - Reporte de Producción</Text>
          <Text style={styles.subtitle}>
            Generado: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
          </Text>
          {dateRange.from && dateRange.to && (
            <Text style={styles.subtitle}>
              Periodo: {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
              {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
            </Text>
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.col1]}>Lote</Text>
            <Text style={[styles.cell, styles.col2]}>Origen</Text>
            <Text style={[styles.cell, styles.col3]}>Variedad</Text>
            <Text style={[styles.cell, styles.col4]}>Etapa Actual</Text>
            <Text style={[styles.cell, styles.col5]}>Estado</Text>
          </View>
          {lots.map((lot) => (
            <View key={lot.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.col1]}>{lot.code}</Text>
              <Text style={[styles.cell, styles.col2]}>{lot.origin}</Text>
              <Text style={[styles.cell, styles.col3]}>{lot.variety}</Text>
              <Text style={[styles.cell, styles.col4]}>{lot.currentStage}</Text>
              <Text style={[styles.cell, styles.col5]}>{lot.status}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
