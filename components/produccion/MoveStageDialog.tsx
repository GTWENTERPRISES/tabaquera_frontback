import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Clock, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

type Incidencia = "humedad" | "danios" | "retraso" | "otro";

interface MoveStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { quantityReceived: string; observation: string; incidencias: Incidencia[]; delayReason: string }) => void;
  isLoading: boolean;
  selectedLot: Lot | null;
}

export function MoveStageDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  selectedLot,
}: MoveStageDialogProps) {
  const { user } = useAuth();
  const [quantityReceived, setQuantityReceived] = useState("");
  const [observation, setObservation] = useState("");
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [delayReason, setDelayReason] = useState("");

  const handleClose = () => {
    setQuantityReceived("");
    setObservation("");
    setIncidencias([]);
    setDelayReason("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    onSubmit({
      quantityReceived,
      observation,
      incidencias,
      delayReason,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {selectedLot ? `Finalizar ${STAGE_LABELS[selectedLot.currentStage as Stage]}` : "Finalizar etapa"}
          </DialogTitle>
          {selectedLot && (
            <DialogDescription>
              Lote: <span className="font-mono font-medium">{selectedLot.codigo || selectedLot.code}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        {selectedLot && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-xs text-muted-foreground">Etapa actual</p>
                <p className="font-semibold">
                  {STAGE_LABELS[selectedLot.currentStage as Stage]}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Siguiente etapa</p>
                <p className="font-semibold text-primary">
                  {(() => {
                    const currentIndex = STAGES.indexOf(selectedLot.currentStage as Stage);
                    if (currentIndex < STAGES.length - 1) {
                      return STAGE_LABELS[STAGES[currentIndex + 1]];
                    }
                    return "Fin del proceso";
                  })()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Cantidad procesada (kg)</Label>
              <Input
                type="number"
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(e.target.value)}
                placeholder={String(selectedLot.peso || selectedLot.currentWeight)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Observaciones (opcional)</Label>
              <Textarea
                placeholder="Agrega observaciones sobre el proceso..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Incidencias</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "ninguna", label: "Ninguna" },
                  { id: "humedad", label: "Humedad" },
                  { id: "danios", label: "Daños" },
                  { id: "retraso", label: "Retraso" },
                  { id: "otro", label: "Otro" },
                ].map((incidencia) => (
                  <div key={incidencia.id} className="flex items-center gap-2">
                    <Checkbox
                      id={incidencia.id}
                      checked={
                        incidencia.id === "ninguna"
                          ? incidencias.length === 0
                          : incidencias.includes(incidencia.id as Incidencia)
                      }
                      onCheckedChange={(checked) => {
                        if (incidencia.id === "ninguna") {
                          if (checked) setIncidencias([]);
                        } else {
                          setIncidencias((prev) =>
                            checked
                              ? [...prev, incidencia.id as Incidencia]
                              : prev.filter((i) => i !== incidencia.id),
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={incidencia.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {incidencia.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Motivo de retraso (opcional)</Label>
              <Select value={delayReason} onValueChange={setDelayReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maquinaria">Maquinaria</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="materia-prima">Materia prima</SelectItem>
                  <SelectItem value="calidad">Calidad</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>Usuario: {user?.nombre}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Fecha: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="h-4 w-4" />
              </motion.div>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isLoading ? "Procesando..." : "Guardar Movimiento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
