"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  Package,
  User,
  QrCode,
  MapPin,
  X,
  Circle,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  STAGES,
  LOT_STATUS_CONFIG,
  PRODUCTION_STAGES,
} from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import Link from "next/link";

// ── helpers ────────────────────────────────────────────────────────────────

function formatDuration(minutes?: number): string {
  if (!minutes) return "–";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
}

function isValidStage(s: any): s is Stage {
  return STAGES.includes(s);
}

// ── Timeline step ──────────────────────────────────────────────────────────

interface TimelineStepProps {
  stage: Stage;
  isCurrent: boolean;
  isCompleted: boolean;
  isPending: boolean;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  responsable?: string;
  observations?: string;
  isLast: boolean;
}

function TimelineStep({
  stage,
  isCurrent,
  isCompleted,
  isPending,
  startedAt,
  endedAt,
  durationMinutes,
  responsable,
  observations,
  isLast,
}: TimelineStepProps) {
  return (
    <div className="flex gap-3">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
            isCompleted
              ? "border-success bg-success text-white"
              : isCurrent
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted bg-muted/50 text-muted-foreground",
          ].join(" ")}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isCurrent ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Circle className="h-3 w-3" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 mt-1 ${
              isCompleted ? "bg-success/40" : "bg-muted"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-5 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge
              className={`text-xs ${STAGE_COLORS[stage]} ${
                isPending ? "opacity-40" : ""
              }`}
            >
              {STAGE_LABELS[stage]}
            </Badge>
            {isCurrent && (
              <span className="ml-2 text-[10px] text-primary font-medium">
                ← Actual
              </span>
            )}
          </div>
          {durationMinutes ? (
            <Badge variant="outline" className="text-[10px] shrink-0">
              {formatDuration(durationMinutes)}
            </Badge>
          ) : null}
        </div>

        {startedAt && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Inicio:{" "}
            {format(new Date(startedAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        )}
        {endedAt && (
          <p className="text-xs text-muted-foreground">
            Fin: {format(new Date(endedAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        )}
        {responsable && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <User className="h-3 w-3" />
            {responsable}
          </p>
        )}
        {observations && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            "{observations}"
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────

interface EstadosLotDetailModalProps {
  lot: Lot | null;
  open: boolean;
  onClose: () => void;
}

export function EstadosLotDetailModal({
  lot,
  open,
  onClose,
}: EstadosLotDetailModalProps) {
  if (!lot) return null;

  // Build a map of stage → movement data (most recent for that stage)
  const stageMovementsMap: Partial<
    Record<
      Stage,
      {
        startedAt?: string;
        completedAt?: string;
        durationMinutes?: number;
        userName?: string;
        observations?: string;
      }
    >
  > = {};

  (lot.movements ?? []).forEach((m: any) => {
    const stage = m.toStage as Stage;
    if (!isValidStage(stage)) return;
    const existing = stageMovementsMap[stage];
    // Keep the most recent entry per stage
    if (!existing || (m.startedAt && m.startedAt > (existing.startedAt ?? ""))) {
      stageMovementsMap[stage] = {
        startedAt: m.startedAt ?? m.createdAt,
        completedAt: m.completedAt,
        durationMinutes: m.durationMinutes,
        userName: m.userName,
        observations: m.observations,
      };
    }
  });

  const currentStageIndex = PRODUCTION_STAGES.indexOf(lot.currentStage);
  const isFullyCompleted =
    lot.estado === "finalizado" || lot.status === "completed";

  const estadoConfig =
    LOT_STATUS_CONFIG[lot.estado as keyof typeof LOT_STATUS_CONFIG];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl mx-auto rounded-xl max-h-[92vh] p-0 overflow-hidden flex flex-col">
        {/* Fixed header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-bold font-mono">
                {lot.codigo ?? lot.code}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {lot.proveedor ?? lot.supplier ?? "–"} · {lot.origin ?? "–"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {estadoConfig && (
                <Badge
                  className={`text-xs ${estadoConfig.bgColor} ${estadoConfig.color} border`}
                >
                  {estadoConfig.label}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <Tabs defaultValue="info" className="flex flex-col h-full">
            <TabsList className="mx-5 mt-3 w-auto justify-start bg-muted/50 h-8">
              <TabsTrigger value="info" className="text-xs h-7">
                Información
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs h-7">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="historial" className="text-xs h-7">
                Historial
              </TabsTrigger>
              <TabsTrigger value="qr" className="text-xs h-7">
                QR
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Información ── */}
            <TabsContent value="info" className="px-5 pb-5 mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Código", value: lot.codigo ?? lot.code },
                  {
                    label: "Proveedor",
                    value: lot.proveedor ?? lot.supplier ?? "–",
                  },
                  { label: "Origen", value: lot.origin ?? "–" },
                  { label: "Variedad", value: lot.variety ?? "–" },
                  {
                    label: "Peso inicial",
                    value: `${lot.initialWeight ?? "–"} kg`,
                  },
                  {
                    label: "Peso actual",
                    value: `${lot.currentWeight ?? "–"} kg`,
                  },
                  { label: "Bultos", value: lot.quantityBales ?? "–" },
                  {
                    label: "Fecha ingreso",
                    value: format(
                      new Date(lot.fechaIngreso ?? lot.entryDate),
                      "dd/MM/yyyy",
                      { locale: es },
                    ),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p className="font-medium text-xs truncate">{value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Responsable actual
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {(lot.responsable?.nombre ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">
                    {lot.responsable?.nombre ?? "Sin asignar"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
                  <Link href={`/dashboard/lotes/${lot.id}`}>
                    <Package className="h-3.5 w-3.5" />
                    Ver lote completo
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
                  <Link href={`/dashboard/trazabilidad/${lot.id}`}>
                    <MapPin className="h-3.5 w-3.5" />
                    Trazabilidad
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* ── Tab: Timeline ── */}
            <TabsContent value="timeline" className="px-5 pb-5 mt-4">
              <div className="space-y-0">
                {PRODUCTION_STAGES.map((stage, idx) => {
                  const isCompleted =
                    isFullyCompleted ||
                    (idx < currentStageIndex &&
                      !!stageMovementsMap[stage]?.completedAt);
                  const isCurrent = stage === lot.currentStage && !isFullyCompleted;
                  const isPending = idx > currentStageIndex && !isFullyCompleted;
                  const data = stageMovementsMap[stage];

                  return (
                    <TimelineStep
                      key={stage}
                      stage={stage}
                      isCurrent={isCurrent}
                      isCompleted={isCompleted}
                      isPending={isPending}
                      startedAt={data?.startedAt}
                      endedAt={data?.completedAt}
                      durationMinutes={data?.durationMinutes}
                      responsable={data?.userName}
                      observations={data?.observations}
                      isLast={idx === PRODUCTION_STAGES.length - 1}
                    />
                  );
                })}
              </div>
            </TabsContent>

            {/* ── Tab: Historial de movimientos ── */}
            <TabsContent value="historial" className="px-5 pb-5 mt-4 space-y-2">
              {(lot.movements ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin movimientos registrados
                </p>
              ) : (
                (lot.movements ?? []).map((m: any, i: number) => {
                  const toStage = isValidStage(m.toStage)
                    ? (m.toStage as Stage)
                    : null;
                  const fromStage = isValidStage(m.fromStage)
                    ? (m.fromStage as Stage)
                    : null;

                  return (
                    <div key={m.id ?? i} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium">
                            {fromStage && toStage
                              ? `${STAGE_LABELS[fromStage]} → ${STAGE_LABELS[toStage]}`
                              : toStage
                              ? `Ingresó a ${STAGE_LABELS[toStage]}`
                              : m.movementType ?? "Movimiento"}
                          </p>
                          {m.userName && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <User className="h-2.5 w-2.5" />
                              {m.userName}
                            </p>
                          )}
                          {m.observations && (
                            <p className="text-[10px] text-muted-foreground italic mt-1">
                              "{m.observations}"
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {(m.startedAt ?? m.createdAt) && (
                            <p className="text-[10px] text-muted-foreground">
                              {format(
                                new Date(m.startedAt ?? m.createdAt),
                                "dd/MM/yyyy",
                                { locale: es },
                              )}
                            </p>
                          )}
                          {(m.startedAt ?? m.createdAt) && (
                            <p className="text-[10px] text-muted-foreground">
                              {format(
                                new Date(m.startedAt ?? m.createdAt),
                                "HH:mm",
                                { locale: es },
                              )}
                            </p>
                          )}
                          {m.durationMinutes && (
                            <Badge variant="outline" className="text-[10px] mt-1">
                              {formatDuration(m.durationMinutes)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* ── Tab: QR ── */}
            <TabsContent value="qr" className="px-5 pb-5 mt-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                  <QrCode className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-mono text-sm font-medium">
                    {lot.qrCode ?? lot.codigo ?? lot.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Código de trazabilidad único
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    asChild
                  >
                    <Link href={`/dashboard/qr`}>
                      <QrCode className="h-3.5 w-3.5" />
                      Gestionar QR
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    asChild
                  >
                    <Link
                      href={`/verify/${lot.qrCode ?? lot.codigo ?? lot.code}`}
                      target="_blank"
                    >
                      Ver verificación pública
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
