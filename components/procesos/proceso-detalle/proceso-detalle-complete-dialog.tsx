"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProcesoDetalleCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ProcesoDetalleCompleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: ProcesoDetalleCompleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Completar Proceso</DialogTitle>
          <DialogDescription>
            Esta a punto de marcar este proceso como completado. Esta accion registrara el fin del proceso y avanzara el lote a la siguiente etapa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 w-full">
          <div className="space-y-2 w-full">
            <Label>Peso de Salida (kg)</Label>
            <Input type="number" placeholder="Ingrese el peso final" className="w-full" />
          </div>
          <div className="space-y-2 w-full">
            <Label>Calificacion de Calidad</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione calificacion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Grado A - Excelente</SelectItem>
                <SelectItem value="B">Grado B - Bueno</SelectItem>
                <SelectItem value="C">Grado C - Aceptable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full">
            <Label>Notas Finales</Label>
            <Textarea placeholder="Observaciones del proceso completado..." className="w-full" />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            Confirmar Completado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
