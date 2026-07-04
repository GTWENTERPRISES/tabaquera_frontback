"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { STAGE_LABELS, LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface ProcesosStageMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot: Lot | null;
  targetStage: Stage | null;
  observation: string;
  onObservationChange: (v: string) => void;
  onConfirm: () => void;
}

export function ProcesosStageMoveDialog({
  open,
  onOpenChange,
  lot,
  targetStage,
  observation,
  onObservationChange,
  onConfirm,
}: ProcesosStageMoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Mover a siguiente etapa
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {lot && targetStage && (
              <>
                Mover lote{" "}
                <span className="font-mono font-medium">
                  {lot.codigo ?? lot.code}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {STAGE_LABELS[targetStage]}
                </span>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {targetStage && (
            <div className="rounded-lg border p-3 bg-muted/30 text-sm">
              <span className="text-muted-foreground">Nueva etapa: </span>
              <span
                className={`font-medium ${LOT_STATUS_CONFIG[targetStage]?.color}`}
              >
                {STAGE_LABELS[targetStage]}
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Observaciones (opcional)</Label>
            <Textarea
              placeholder="Motivo del traslado u observaciones…"
              value={observation}
              onChange={(e) => onObservationChange(e.target.value)}
              className="text-xs sm:text-sm"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs sm:text-sm h-9"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto text-xs sm:text-sm h-9"
          >
            Confirmar traslado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
