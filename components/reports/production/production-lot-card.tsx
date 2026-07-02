"use client";

import { Package, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/constants";
import type { Lot } from "@/lib/types";

interface ProductionLotCardProps {
  lot: Lot;
}

export function ProductionLotCard({ lot }: ProductionLotCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-mono font-semibold text-sm text-foreground">
            {lot.codigo ?? lot.code}
          </span>
        </div>
        <Badge
          variant={lot.status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
          {lot.status === "active"
            ? "Activo"
            : lot.status === "completed"
              ? "Completado"
              : lot.status === "rejected"
                ? "Rechazado"
                : lot.status === "on_hold"
                  ? "En Espera"
                  : lot.status}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Proveedor</dt>
          <dd className="font-medium text-foreground">
            {lot.proveedor ?? lot.supplier}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Etapa</dt>
          <dd className="font-medium text-foreground">
            {STAGE_LABELS[lot.currentStage as keyof typeof STAGE_LABELS] ?? lot.currentStage}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Peso</dt>
          <dd className="font-medium text-foreground flex items-center gap-1">
            <Scale className="h-3 w-3 text-muted-foreground" />
            {lot.currentWeight?.toLocaleString()} kg
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha Ingreso</dt>
          <dd className="font-medium text-foreground">
            {new Date(lot.entryDate ?? lot.fechaIngreso ?? Date.now()).toLocaleDateString()}
          </dd>
        </div>
      </dl>

      {(lot.notes || lot.observaciones) && (
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground mb-0.5">Observaciones</p>
          <p className="text-sm text-foreground line-clamp-3">
            {lot.notes ?? lot.observaciones ?? "-"}
          </p>
        </div>
      )}
    </div>
  );
}
