"use client";

import { Send } from "lucide-react";
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

interface MoveStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  observation: string;
  setObservation: (text: string) => void;
  onMove: () => void;
}

export function MoveStageDialog({
  open,
  onOpenChange,
  selectedStage,
  setSelectedStage,
  observation,
  setObservation,
  onMove,
}: MoveStageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover Lote de Etapa</DialogTitle>
          <DialogDescription>
            Selecciona la etapa y agrega observaciones
            (opcional)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Etapa Destino
            </label>
            <Select
              value={selectedStage}
              onValueChange={setSelectedStage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona etapa" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {STAGE_LABELS[stage] || stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Observaciones
            </label>
            <Textarea
              placeholder="Agrega observaciones sobre el cambio de etapa..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={onMove}
            disabled={!selectedStage}
          >
            <Send className="mr-2 h-4 w-4" />
            Mover Lote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
