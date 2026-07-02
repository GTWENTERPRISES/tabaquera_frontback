"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle, Users, ArrowRight, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ProduccionStats } from "./ProduccionStats";
import { LotTimeline } from "./LotTimeline";
import { LotProgressIndicator } from "@/components/lots/LotProgressIndicator";
import { LotItem } from "./LotItem";
import { ProductionRecord } from "./ProductionRecord";
import { ObservationDialog } from "./ObservationDialog";
import { MoveStageDialog } from "./MoveStageDialog";
import { ReassignDialog } from "./ReassignDialog";
import { formatDuration } from "./utils";
import { useLots } from "@/contexts/lot-context";
import { useAuth } from "@/contexts/auth-context";
import { STAGES, STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ProduccionView() {
  const {
    lots,
    moveLotToStage,
    getLotById,
    iniciarTrabajo,
    pausarTrabajo,
    reanudarTrabajo,
    addObservation,
    reasignarLote,
  } = useLots();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [obsDialogOpen, setObsDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newObservation, setNewObservation] = useState("");
  const [selectedResponsable, setSelectedResponsable] = useState("");

  const getCurrentMovement = useCallback((lot: Lot) => {
    const stageMovements = [...(lot.movements || [])]
      .filter(
        (movement: any) =>
          movement.toStage === lot.currentStage ||
          movement.fromStage === lot.currentStage,
      )
      .sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || a.startedAt || 0).getTime();
        const bTime = new Date(b.createdAt || b.startedAt || 0).getTime();
        return aTime - bTime;
      });

    let startedAt: string | undefined;
    let pausedAt: string | undefined;
    let resumedAt: string | undefined;
    let totalPausedMinutes = 0;

    for (const movement of stageMovements) {
      if (
        movement.movementType === "inicio" ||
        movement.movementType === "reanudacion"
      ) {
        startedAt = movement.startedAt || movement.createdAt;
        resumedAt =
          movement.movementType === "reanudacion"
            ? movement.resumedAt || movement.createdAt
            : resumedAt;
        pausedAt = undefined;
      }

      if (movement.movementType === "pausa" && startedAt) {
        pausedAt = movement.pausedAt || movement.createdAt;
        totalPausedMinutes += movement.totalPausedMinutes || 0;
      }

      if (movement.movementType === "finalizacion") {
        startedAt = undefined;
        pausedAt = undefined;
        resumedAt = undefined;
        totalPausedMinutes = 0;
      }
    }

    if (!startedAt) {
      return undefined;
    }

    return {
      startedAt,
      pausedAt,
      resumedAt,
      totalPausedMinutes,
    };
  }, []);

  const activeLots = lots.filter((lot) => lot.status === "active");
  const filteredLots = activeLots.filter(
    (lot) =>
      (lot.codigo || lot.code || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (lot.proveedor || lot.supplier || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      STAGE_LABELS[lot.currentStage as Stage]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const isSupervisorOrAdmin =
    user?.role === "supervisor" || user?.role === "admin";
  const isCalidad = user?.role === "quality";

  const handleSelectLot = async (lot: Lot) => {
    const detailedLot = await getLotById(lot.id);
    setSelectedLot(detailedLot || lot);
  };

  const handleMoveLot = async (data: any) => {
    if (!selectedLot) return;
    setIsLoading(true);
    try {
      const currentIndex = STAGES.indexOf(selectedLot.currentStage as Stage);
      const targetStage = STAGES[currentIndex + 1];

      const qty = data.quantityReceived
        ? parseFloat(data.quantityReceived)
        : undefined;
      await moveLotToStage(
        selectedLot.id,
        targetStage,
        data.observation,
        qty,
        data.delayReason,
      );

      const updatedLot = await getLotById(selectedLot.id);
      if (updatedLot) {
        setSelectedLot(updatedLot);
      }

      toast.success("Movimiento registrado correctamente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddObservation = async () => {
    if (!selectedLot || !newObservation.trim()) return;
    await addObservation({
      lotId: selectedLot.id,
      lotCode: selectedLot.codigo || selectedLot.code,
      stage: selectedLot.currentStage,
      text: newObservation,
      userId: user?.id || "system",
      userName: user?.nombre || user?.name || "Sistema",
    });
    const updatedLot = await getLotById(selectedLot.id);
    if (updatedLot) {
      setSelectedLot(updatedLot);
    }
    setObsDialogOpen(false);
    setNewObservation("");
    toast.success("Observación registrada");
  };

  const handleReassign = async () => {
    if (!selectedLot || !selectedResponsable) return;
    await reasignarLote(selectedLot.id, {
      id: Number.parseInt(selectedResponsable, 10),
      nombre: "",
    });
    const updatedLot = await getLotById(selectedLot.id);
    if (updatedLot) {
      setSelectedLot(updatedLot);
    }
    setReassignDialogOpen(false);
    setSelectedResponsable("");
    toast.success("Lote reasignado");
  };

  const handleIniciarTrabajo = async () => {
    if (!selectedLot) return;
    await iniciarTrabajo(selectedLot.id);
    const updatedLot = await getLotById(selectedLot.id);
    if (updatedLot) {
      setSelectedLot(updatedLot);
    }
    toast.success("Trabajo iniciado");
  };

  const handlePausarTrabajo = async () => {
    if (!selectedLot) return;
    await pausarTrabajo(selectedLot.id);
    const updatedLot = await getLotById(selectedLot.id);
    if (updatedLot) {
      setSelectedLot(updatedLot);
    }
    toast.success("Trabajo pausado");
  };

  const handleReanudarTrabajo = async () => {
    if (!selectedLot) return;
    await reanudarTrabajo(selectedLot.id);
    const updatedLot = await getLotById(selectedLot.id);
    if (updatedLot) {
      setSelectedLot(updatedLot);
    }
    toast.success("Trabajo reanudado");
  };

  const handleFinalizarEtapa = () => {
    if (!selectedLot) return;
    const currentIndex = STAGES.indexOf(selectedLot.currentStage as Stage);
    setMoveDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Producción
        </h1>
        <p className="text-muted-foreground">
          {isCalidad
            ? "Visualiza los lotes en producción"
            : "Gestiona y avanza lotes en el proceso productivo"}
        </p>
      </motion.div>

      <ProduccionStats />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-sm sm:text-base font-medium">
              Tabla de Producción
            </CardTitle>
            <Input
              placeholder="Buscar lote, proveedor o etapa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredLots.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No hay lotes activos</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredLots.map((lot, index) => (
                <LotItem
                  key={lot.id}
                  lot={lot}
                  index={index}
                  isSupervisorOrAdmin={isSupervisorOrAdmin}
                  isCalidad={isCalidad}
                  onProcess={handleSelectLot}
                  onReassign={(lot) => {
                    setSelectedLot(lot);
                    setReassignDialogOpen(true);
                  }}
                />
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedLot && !moveDialogOpen && !reassignDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLot(null);
          }
        }}
      >
        {selectedLot && (
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  Lote {selectedLot.codigo || selectedLot.code}
                  <Badge className={STAGE_COLORS[selectedLot.currentStage as Stage]}>
                    {STAGE_LABELS[selectedLot.currentStage as Stage]}
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription>
                {isCalidad
                  ? "Visualiza el proceso del lote"
                  : "Gestiona el proceso del lote"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Proveedor</p>
                    <p className="font-medium">{selectedLot.proveedor || selectedLot.supplier}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Peso</p>
                    <p className="font-medium">{selectedLot.peso || selectedLot.currentWeight} kg</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fecha de ingreso</p>
                    <p className="font-medium">
                      {selectedLot.fechaIngreso
                        ? format(new Date(selectedLot.fechaIngreso as string), "dd/MM/yyyy", { locale: es })
                        : selectedLot.entryDate
                          ? format(new Date(selectedLot.entryDate as string), "dd/MM/yyyy", { locale: es })
                          : ""}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg col-span-2">
                    <p className="text-xs text-muted-foreground">Responsable</p>
                    <p className="font-medium">{selectedLot.responsable?.nombre || "Sin asignar"}</p>
                  </div>
                </div>

                <LotProgressIndicator lot={selectedLot} />
                <LotTimeline lot={selectedLot} />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Historial de Movimientos</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedLot.movements?.map((movement: any, idx: number) => {
                      const toStage = STAGES.includes(movement.toStage)
                        ? (movement.toStage as Stage)
                        : undefined;
                      const fromStage = movement.fromStage && STAGES.includes(movement.fromStage)
                        ? (movement.fromStage as Stage)
                        : undefined;

                      return (
                        <div key={movement.id} className="p-3 bg-muted/30 rounded-lg border border-muted">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {toStage && (
                                <Badge className={STAGE_COLORS[toStage]}>
                                  {STAGE_LABELS[toStage]}
                                </Badge>
                              )}
                              {fromStage && (
                                <span className="text-muted-foreground">← {STAGE_LABELS[fromStage]}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {movement.startedAt
                                ? format(new Date(movement.startedAt as string), "dd/MM/yyyy HH:mm", { locale: es })
                                : ""}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {movement.userName} • {movement.userRole}
                          </p>
                          {movement.durationMinutes && (
                            <p className="text-xs text-muted-foreground">
                              Duración: {formatDuration(movement.durationMinutes)}
                            </p>
                          )}
                          {movement.observations && (
                            <p className="text-xs text-foreground mt-1">
                              "{movement.observations}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  {isCalidad ? "Información de Producción" : "Registro de Producción"}
                </h3>
                <ProductionRecord
                  lot={selectedLot}
                  onIniciarTrabajo={handleIniciarTrabajo}
                  onPausarTrabajo={handlePausarTrabajo}
                  onReanudarTrabajo={handleReanudarTrabajo}
                  onFinalizarEtapa={handleFinalizarEtapa}
                  onAddObservation={() => setObsDialogOpen(true)}
                  getCurrentMovement={getCurrentMovement}
                  isCalidad={isCalidad}
                />
              </div>
            </div>
            <DialogFooter>
              <Button asChild variant="outline">
                <Link href={`/dashboard/lotes/${selectedLot.id}`}>
                  Ver lote completo
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ObservationDialog
        open={obsDialogOpen}
        onOpenChange={setObsDialogOpen}
        onSubmit={handleAddObservation}
        value={newObservation}
        onChange={setNewObservation}
      />

      <MoveStageDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        onSubmit={handleMoveLot}
        isLoading={isLoading}
        selectedLot={selectedLot}
      />

      <ReassignDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        onSubmit={handleReassign}
        selectedResponsable={selectedResponsable}
        setSelectedResponsable={setSelectedResponsable}
        lotCode={selectedLot?.codigo || selectedLot?.code}
      />
    </div>
  );
}
