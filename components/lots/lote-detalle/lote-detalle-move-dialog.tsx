"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Clock, CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { Stage, Lot } from "@/lib/types";

interface LoteDetalleMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot: Lot;
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  observation: string;
  setObservation: (obs: string) => void;
  isLoading: boolean;
  onConfirm: () => void;
  user?: { nombre?: string; name?: string } | null;
}

export function LoteDetalleMoveDialog({
  open,
  onOpenChange,
  lot,
  selectedStage,
  setSelectedStage,
  observation,
  setObservation,
  isLoading,
  onConfirm,
  user,
}: LoteDetalleMoveDialogProps) {
  const currentIndex = STAGES.indexOf(lot.currentStage);
  const isLastStage = currentIndex >= STAGES.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isLastStage ? "Completar lote" : "Mover a la siguiente etapa"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Lote:{" "}
            <span className="font-mono font-medium">
              {lot.codigo || lot.code}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 w-full">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Etapa actual
              </p>
              <p className="font-semibold text-xs sm:text-sm">
                {STAGE_LABELS[lot.currentStage]}
              </p>
            </div>
            {!isLastStage && (
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Etapa destino
                </p>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm mt-0.5">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.slice(STAGES.indexOf(lot.currentStage) + 1).map(
                      (stage) => (
                        <SelectItem
                          key={stage}
                          value={stage}
                          className="text-xs sm:text-sm"
                        >
                          {STAGE_LABELS[stage]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isLastStage && (
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Estado final
                </p>
                <p className="font-semibold text-xs sm:text-sm">Completado</p>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Observaciones (opcional)
            </label>
            <Textarea
              placeholder="Agrega observaciones sobre el proceso..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              className="text-xs sm:text-sm"
            />
          </div>
          <div className="pt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 shrink-0" />
              <span>{user?.nombre || user?.name || "Usuario"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {new Date().toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedStage("");
              setObservation("");
            }}
            disabled={isLoading}
            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={(!selectedStage && !isLastStage) || isLoading}
            className="gap-2 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2 className="h-3.5 w-3.5" />
              </motion.div>
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            {isLoading ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
