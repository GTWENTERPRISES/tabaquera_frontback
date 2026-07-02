"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { TraceabilityReportPDF } from "@/lib/pdf-exports";
import { useAuth } from "@/contexts/auth-context";
import { useLots } from "@/contexts/lot-context";
import { STAGES } from "@/lib/constants";
import { LoteDetalleHeader } from "./lote-detalle/lote-detalle-header";
import { LoteDetalleProgressCard } from "./lote-detalle/lote-detalle-progress-card";
import { LoteDetalleInfoCard } from "./lote-detalle/lote-detalle-info-card";
import { LoteDetalleTabs } from "./lote-detalle/lote-detalle-tabs";
import { LoteDetalleSidebar } from "./lote-detalle/lote-detalle-sidebar";
import { LoteDetalleMoveDialog } from "./lote-detalle/lote-detalle-move-dialog";
import { toast } from "sonner";
import { api, type TimelineItem, type Trazabilidad } from "@/services/api";
import type {
  Lot,
  Movement,
  ProcessStage,
  QualityCheck,
  Stage,
} from "@/lib/types";

interface LoteDetalleViewProps {
  params: Promise<{ id: string }>;
}

const stageMap: Record<string, Stage> = {
  Recepción: "reception",
  Clasificación: "classification",
  Selección: "selection",
  Empaque: "packaging",
  Distribución: "distribution",
  // Also include the backend keys just in case
  recepción: "reception",
  clasificación: "classification",
  selección: "selection",
  empaque: "packaging",
  distribución: "distribution",
};

const parseNumber = (value: number | string | null | undefined) => {
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return value ?? 0;
};

const mapStageName = (stageName?: string | null): Stage | undefined => {
  if (!stageName) {
    return undefined;
  }

  return stageMap[stageName];
};

// Same movement mapper as in lot-context.tsx
const mapApiMovimientoToLotMovement = (apiLotId: number, mov: any) => ({
  id: mov.id.toString(),
  lotId: apiLotId.toString(),
  fromStage: mov.etapa_origen_nombre
    ? stageMap[mov.etapa_origen_nombre]
    : undefined,
  toStage: mov.etapa_destino_nombre
    ? stageMap[mov.etapa_destino_nombre]
    : "reception",
  userId: mov.usuario?.toString() || "",
  userName: mov.usuario_nombre || "Sistema",
  userRole: "",
  startedAt:
    mov.tipo_movimiento === "inicio" || mov.tipo_movimiento === "reanudacion"
      ? mov.fecha_hora
      : undefined,
  pausedAt: mov.tipo_movimiento === "pausa" ? mov.fecha_hora : undefined,
  resumedAt: mov.tipo_movimiento === "reanudacion" ? mov.fecha_hora : undefined,
  completedAt:
    mov.tipo_movimiento === "finalizacion" ? mov.fecha_hora : undefined,
  totalPausedMinutes: mov.tiempo_pausa_minutos || 0,
  durationMinutes: mov.tiempo_trabajo_minutos || 0,
  observations: mov.observaciones || "",
  quantityReceived: mov.cantidad_procesada_kg,
  createdAt: mov.fecha_hora,
  movementType: mov.tipo_movimiento,
});

const mapApiLotToDetailLot = (apiLot: any, fallbackLot?: Lot): Lot => {
  const providerName =
    typeof apiLot.proveedor === "object"
      ? apiLot.proveedor?.nombre
      : apiLot.proveedor_nombre;
  const varietyName =
    typeof apiLot.variedad === "object"
      ? apiLot.variedad?.nombre
      : apiLot.variedad_nombre;
  const responsibleName =
    typeof apiLot.responsable_actual === "object"
      ? apiLot.responsable_actual?.nombre_completo
      : apiLot.responsable_nombre;
  const currentStage =
    mapStageName(apiLot.etapa_actual?.nombre || apiLot.etapa_actual_nombre) ||
    fallbackLot?.currentStage ||
    "reception";

  // Status map from lot-context.tsx
  const statusMap: Record<string, any> = {
    pendiente: "active",
    en_espera: "on_hold",
    en_produccion: "in_production",
    finalizado: "completed",
    rechazado: "rejected",
  };

  // Map movements from apiLot.movimientos
  const mappedMovements = (apiLot.movimientos || []).map((mov: any) =>
    mapApiMovimientoToLotMovement(apiLot.id, mov),
  );

  return {
    id: apiLot.id.toString(),
    codigo: apiLot.codigo,
    code: apiLot.codigo,
    qrCode: apiLot.codigo_qr,
    origin: apiLot.origen,
    variety: varietyName || fallbackLot?.variety || "-",
    supplier: providerName || fallbackLot?.supplier || "-",
    proveedor: providerName || fallbackLot?.proveedor || "-",
    entryDate: apiLot.fecha_ingreso,
    fechaIngreso: apiLot.fecha_ingreso,
    initialWeight: parseNumber(apiLot.peso_inicial_kg),
    currentWeight: parseNumber(apiLot.peso_actual_kg),
    peso: parseNumber(apiLot.peso_actual_kg),
    quantityBales: apiLot.cantidad_bultos,
    currentStage,
    estado: apiLot.estado,
    status: statusMap[apiLot.estado] || "active",
    quality: fallbackLot?.quality || "A",
    notes: apiLot.observaciones_iniciales || fallbackLot?.notes,
    observaciones: apiLot.observaciones_iniciales || fallbackLot?.observaciones,
    responsibleId:
      (typeof apiLot.responsable_actual === "object"
        ? apiLot.responsable_actual?.id?.toString()
        : apiLot.responsable_actual?.toString()) ||
      fallbackLot?.responsibleId ||
      "",
    responsable: responsibleName ? { nombre: responsibleName } : fallbackLot?.responsable,
    stageHistory: fallbackLot?.stageHistory || [],
    movements: mappedMovements.length > 0 ? mappedMovements : fallbackLot?.movements || [],
    lastUpdatedAt: apiLot.fecha_actualizacion || fallbackLot?.lastUpdatedAt || new Date().toISOString(),
    totalTimeMinutes: fallbackLot?.totalTimeMinutes,
  };
};

const buildProcessStages = (timeline: TimelineItem[], lotId: string) => {
  const movementItems = [...timeline]
    .filter((item) => item.tipo === "movimiento")
    .sort(
      (a, b) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
    );

  const stages: ProcessStage[] = [];

  for (const item of movementItems) {
    const movementData = item.datos || {};
    const originStage = mapStageName(
      movementData.etapa_origen_nombre || item.etapa_origen,
    );
    const destinationStage = mapStageName(
      movementData.etapa_destino_nombre || item.etapa_destino,
    );

    if (originStage) {
      const existingOrigin = [...stages]
        .reverse()
        .find((stage) => stage.etapa === originStage && !stage.fechaFin);

      if (existingOrigin) {
        existingOrigin.fechaFin = item.fecha;
        existingOrigin.duracion = movementData.tiempo_trabajo_minutos;
        existingOrigin.observaciones =
          movementData.observaciones || existingOrigin.observaciones;
      }
    }

    if (destinationStage) {
      const existingDestination = [...stages]
        .reverse()
        .find(
          (stage) =>
            stage.etapa === destinationStage &&
            stage.fechaInicio === item.fecha,
        );

      if (!existingDestination) {
        stages.push({
          id: `stage-${lotId}-${destinationStage}-${stages.length}`,
          etapa: destinationStage,
          fechaInicio: item.fecha,
          fechaFin: undefined,
          duracion: undefined,
          usuario: item.usuario ? { nombre: item.usuario } : undefined,
          observaciones: item.descripcion || movementData.observaciones,
        });
      }
    }
  }

  return stages;
};

const buildStageHistory = (stages: ProcessStage[], lotId: string) =>
  stages.map((stage) => ({
    id: stage.id,
    lotId,
    stage: stage.etapa,
    startTime: stage.fechaInicio,
    endTime: stage.fechaFin,
    durationMinutes: stage.duracion,
    responsibleUserId: "",
    responsibleUserName: stage.usuario?.nombre || "Sistema",
    observations: stage.observaciones,
    observaciones: stage.observaciones,
  }));

const buildMovements = (timeline: TimelineItem[]): Movement[] =>
  [...timeline]
    .filter((item) => item.tipo === "movimiento")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((item) => ({
      id: `${item.tipo}-${item.fecha}-${item.titulo}`,
      lotId: String(item.datos?.lote || ""),
      type:
        item.tipo === "movimiento"
          ? "stage_change"
          : item.tipo === "inspeccion"
            ? "quality_check"
            : "observation",
      tipo:
        item.tipo === "movimiento"
          ? "etapa"
          : item.tipo === "inspeccion"
            ? "calidad"
            : "observacion",
      description: item.descripcion || item.titulo,
      descripcion: item.descripcion || item.titulo,
      date: item.fecha,
      fecha: new Date(item.fecha),
      userId: String(item.datos?.usuario || ""),
      userName: item.usuario || "Sistema",
      usuario: item.usuario ? { nombre: item.usuario } : undefined,
      fromStage: mapStageName(item.etapa_origen),
      toStage: mapStageName(item.etapa_destino),
      details: item.datos,
    }));

const buildQualityChecks = (inspections: any[]): QualityCheck[] =>
  inspections.map((inspection) => ({
    id: inspection.id.toString(),
    lotId: inspection.lote.toString(),
    lotCode: inspection.lote_codigo || `LT-${inspection.lote}`,
    stage: inspection.etapa_nombre || "Sin etapa",
    grade: inspection.grado_calidad || "A",
    temperature: parseNumber(inspection.temperatura),
    humidity: parseNumber(inspection.humedad),
    weight: parseNumber(inspection.peso_kg),
    status:
      inspection.estado_calidad === "aprobado" ||
      inspection.estado_calidad === "aprobado_con_observaciones"
        ? "passed"
        : inspection.estado_calidad === "rechazado"
          ? "failed"
          : inspection.estado_calidad === "en_inspeccion"
            ? "in_progress"
            : "pending",
    resultado: inspection.estado_calidad,
    date: inspection.fecha_hora_inicio,
    fechaInspeccion: inspection.fecha_hora_inicio,
    inspector: inspection.inspector_nombre || "Inspector",
    notes: inspection.observaciones || "",
    observaciones: inspection.observaciones || "",
  }));

export function LoteDetalleView({ params }: LoteDetalleViewProps) {
  const { id } = React.use(params);
  const {
    getLotById,
    moveLotToStage,
    completeLot,
    lots,
  } = useLots();
  const { user, hasPermission } = useAuth();
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [observation, setObservation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(true);
  const [detailLot, setDetailLot] = useState<Lot | null>(null);
  const [traceability, setTraceability] = useState<Trazabilidad | null>(null);

  const canEditLots = hasPermission(["administrador", "supervisor"]);

  const loadLotDetail = useCallback(async () => {
    try {
      setIsDetailLoading(true);
      
      console.log("Loading lot detail for id:", id);
      
      // First find lot from context if available (might have numeric id as string)
      // Try direct string match or parse as number
      let foundLot = lots.find(l => l.id === id);
      if (!foundLot) {
        // Maybe id is numeric string, try to find by numeric id
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          foundLot = lots.find(l => parseInt(l.id) === numericId);
        }
      }

      const [apiLot, traceabilityData] = await Promise.all([
        api.getLote(parseInt(id)),
        api.getTrazabilidad(parseInt(id)),
      ]);
      
      console.log("Got API lot:", apiLot);
      console.log("Got traceability data:", traceabilityData);

      const lotFromContext = await getLotById(id);
      
      const processStages = buildProcessStages(traceabilityData.timeline, id);
      const stageHistory = buildStageHistory(processStages, id);
      const movementsFromTimeline = buildMovements(traceabilityData.timeline || []);
      const mappedLot = mapApiLotToDetailLot(apiLot, lotFromContext || foundLot || undefined);
      
      console.log("Mapped lot for view:", mappedLot);
      
      setDetailLot({
        ...mappedLot,
        stageHistory,
        movements: movementsFromTimeline,
        totalTimeMinutes: traceabilityData.tiempo_total_minutos,
      });
      setTraceability(traceabilityData);
    } catch (error) {
      console.error("Error cargando detalle del lote:", error);
      // Try to use lot from context even if API fails
      const foundLot = lots.find(l => l.id === id);
      if (foundLot) {
        setDetailLot(foundLot);
      }
      setTraceability(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, [id, lots, getLotById]);

  useEffect(() => {
    if (id) {
      void loadLotDetail();
    }
  }, [loadLotDetail, id]);

  const lot = detailLot;

  const stages = useMemo(
    () => buildProcessStages(traceability?.timeline || [], id),
    [id, traceability?.timeline],
  );

  const qualityControls = useMemo(
    () => buildQualityChecks(traceability?.lote?.inspecciones || []),
    [traceability?.lote?.inspecciones],
  );

  const movements = useMemo(
    () => buildMovements(traceability?.timeline || []),
    [traceability?.timeline],
  );

  if (isDetailLoading && !lot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando detalle del lote...</p>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Lote no encontrado</p>
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(lot.currentStage);
  const isLastStage = currentIndex >= STAGES.length - 1;

  const handleMoveLot = async () => {
    setIsLoading(true);
    try {
      if (isLastStage) {
        await completeLot(lot.id, observation);
        await loadLotDetail();
        toast.success("Lote finalizado exitosamente");
      } else if (selectedStage) {
        await moveLotToStage(lot.id, selectedStage as any, observation);
        await loadLotDetail();
        toast.success("Lote movido exitosamente");
      }
    } catch (error) {
      console.error("Error al mover lote:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al mover el lote. Por favor, intente nuevamente.",
      );
    } finally {
      setIsLoading(false);
      setMoveDialogOpen(false);
      setSelectedStage("");
      setObservation("");
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(<TraceabilityReportPDF lot={lot} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lote-${lot.codigo || lot.code || lot.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  const currentStageIndex = STAGES.indexOf(lot.currentStage);
  const progress =
    lot.estado === "completado" || lot.estado === "finalizado"
      ? 100
      : lot.estado === "rechazado"
        ? 0
        : currentStageIndex >= 0
          ? ((currentStageIndex + 1) / STAGES.length) * 100
          : 0;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <LoteDetalleHeader
        lot={lot}
        id={id}
        canEditLots={canEditLots}
        onMoveClick={() => {
          if (!isLastStage) {
            setSelectedStage(STAGES[currentIndex + 1]);
          }
          setMoveDialogOpen(true);
        }}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 w-full">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full">
          <LoteDetalleProgressCard
            lot={lot}
            progress={progress}
            currentStageIndex={currentStageIndex}
          />
          <LoteDetalleInfoCard lot={lot} />
          <LoteDetalleTabs
            lot={lot}
            stages={stages}
            qualityControls={qualityControls}
            movements={movements}
          />
        </div>

        {/* Right Column */}
        <LoteDetalleSidebar
          lot={lot}
          qualityControls={qualityControls}
          movements={movements}
        />
      </div>

      <LoteDetalleMoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        lot={lot}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        observation={observation}
        setObservation={setObservation}
        isLoading={isLoading}
        onConfirm={handleMoveLot}
        user={user}
      />
    </div>
  );
}
