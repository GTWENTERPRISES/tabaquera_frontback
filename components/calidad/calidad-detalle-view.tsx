"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import {
  Activity,
  CalendarDays,
  Droplets,
  Scale,
  ShieldCheck,
  Thermometer,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Camera,
  QrCode,
  Download,
  ZoomIn,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import BackButton from "@/components/BackButton";
import { useLots } from "@/contexts/lot-context";
import { pdf } from "@react-pdf/renderer";
import { QualityReportPDF } from "@/lib/pdf-exports";
import type {
  RejectionReason,
  FinalDecision,
  QualityStatus,
  Evidence,
} from "@/lib/types";

interface CalidadDetalleViewProps {
  id: string;
}

const statusBadgeClass: Record<QualityStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  passed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  passed_with_notes:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const resultBadge: Record<string, string> = {
  aprobado: "bg-primary/10 text-primary border-primary/20",
  "aprobado con observaciones":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  en_inspeccion:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pendiente: "bg-accent/10 text-accent border-accent/20",
  rechazado: "bg-destructive/10 text-destructive border-destructive/20",
};

const rejectionReasonLabels: Record<RejectionReason, string> = {
  humedad_excesiva: "Humedad excesiva",
  dano_fisico: "Daño físico",
  peso_incorrecto: "Peso incorrecto",
  contaminacion: "Contaminación",
  mala_clasificacion: "Mala clasificación",
  otro: "Otro",
};

const finalDecisionLabels: Record<FinalDecision, string> = {
  aprobar_lote: "Aprobar lote",
  rechazar_lote: "Rechazar lote",
  solicitar_correccion: "Solicitar corrección",
  solicitar_reinspeccion: "Solicitar reinspección",
};

export function CalidadDetalleView({ id }: CalidadDetalleViewProps) {
  const { qualityChecks } = useLots();
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);
  const check = qualityChecks.find((item) => item.id === id);

  if (!check) {
    notFound();
  }

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(<QualityReportPDF checks={[check]} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inspeccion-${check.lotCode}-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  const handleDownloadEvidence = (evidence: Evidence) => {
    const a = document.createElement("a");
    a.href = evidence.url;
    a.download = evidence.name || `evidence-${evidence.id}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Detalle de Inspección
          </h1>
          <p className="text-muted-foreground">
            Revisión del lote {check.lotCode}
          </p>
        </div>
        <Button variant="ghost" onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Resultado</p>
              <Badge
                variant="outline"
                className={resultBadge[check.resultado ?? "pendiente"]}
              >
                {check.resultado?.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <Thermometer className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Temperatura</p>
              <p className="text-lg font-semibold">{check.temperature} °C</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <Droplets className="h-5 w-5 text-chart-2" />
            <div>
              <p className="text-sm text-muted-foreground">Humedad</p>
              <p className="text-lg font-semibold">{check.humidity}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <Scale className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Peso</p>
              <p className="text-lg font-semibold">{check.weight ?? 0} kg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tiempo de inspección */}
      {check.inspectionStartTime && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Tiempo de Inspección</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="font-medium">Inicio</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(check.inspectionStartTime).toLocaleString("es-ES")}
              </p>
            </div>
            {check.inspectionEndTime && (
              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <p className="font-medium">Fin</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(check.inspectionEndTime).toLocaleString("es-ES")}
                </p>
              </div>
            )}
            {check.durationMinutes && (
              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <p className="font-medium">Duración</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {check.durationMinutes} minutos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen técnico */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Resumen técnico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="font-medium">Inspección</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Etapa: {check.stage}
            </p>
            <p className="text-sm text-muted-foreground">
              Grado: {check.grade}
            </p>
            <p className="text-sm text-muted-foreground">
              Inspector: {check.inspector}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              <p className="font-medium">Validación QR</p>
            </div>
            <Badge variant={check.qrVerified ? "default" : "destructive"}>
              {check.qrVerified ? "Verificado" : "No verificado"}
            </Badge>
          </div>
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <p className="font-medium">Registro</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Fecha: {new Date(check.date).toLocaleDateString("es-ES")}
            </p>
            <p className="text-sm text-muted-foreground">
              Observaciones: {check.observaciones ?? "Sin observaciones"}
            </p>
          </div>
          {check.finalDecision && (
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="font-medium">Decisión Final</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {finalDecisionLabels[check.finalDecision]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      {check.checklist && check.checklist.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Checklist de Inspección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {check.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {item.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Motivos de rechazo */}
      {check.rejectionReasons && check.rejectionReasons.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Motivos de Rechazo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {check.rejectionReasons.map((reason) => (
              <Badge key={reason} variant="destructive">
                {rejectionReasonLabels[reason]}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Evidencias */}
      {check.evidence && check.evidence.length > 0 && (
        <>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Evidencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {check.evidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="group relative flex flex-col gap-2 p-3 border rounded-lg bg-card"
                  >
                    {/* Preview/Icon */}
                    <div className="w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {evidence.type === "photo" ? (
                        <img
                          src={evidence.url}
                          alt={evidence.name || "Foto"}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewEvidence(evidence)}
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {evidence.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(evidence.uploadedAt).toLocaleDateString(
                            "es-ES",
                          )}
                        </span>
                        {evidence.fileSize && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(evidence.fileSize / 1024)} KB
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1">
                        {evidence.type === "photo" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewEvidence(evidence)}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownloadEvidence(evidence)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Dialog */}
          <Dialog
            open={!!previewEvidence}
            onOpenChange={(open) => !open && setPreviewEvidence(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 sm:p-6">
              {previewEvidence?.type === "photo" ? (
                <div className="flex flex-col h-full">
                  <DialogHeader className="p-4 sm:p-0 sm:pb-4">
                    <DialogTitle>{previewEvidence.name}</DialogTitle>
                    <DialogClose className="absolute right-4 top-4" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-12 top-4"
                      onClick={() => handleDownloadEvidence(previewEvidence)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto flex items-center justify-center bg-black/5 rounded-lg">
                    <img
                      src={previewEvidence.url}
                      alt={previewEvidence.name || "Preview"}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-0">
                  <DialogHeader className="pb-4">
                    <DialogTitle>{previewEvidence?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center py-12 bg-muted rounded-lg">
                    <FileText className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Vista previa solo disponible para imágenes
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() =>
                        previewEvidence &&
                        handleDownloadEvidence(previewEvidence)
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Archivo
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
