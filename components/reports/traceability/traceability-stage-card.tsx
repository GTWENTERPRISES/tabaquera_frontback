"use client";

import { User, Calendar } from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";
import type { Lot, LotStageHistory } from "@/lib/types";

interface TraceabilityStageCardProps {
  check: LotStageHistory & { lotCode?: string };
  selectedLot?: Lot | null;
}

export function TraceabilityStageCard({
  check,
  selectedLot,
}: TraceabilityStageCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono font-semibold text-sm text-foreground">
          {"lotCode" in (check as any)
            ? (check as any).lotCode
            : selectedLot?.code ?? selectedLot?.codigo ?? "-"}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {STAGE_LABELS[check.stage as keyof typeof STAGE_LABELS] || check.stage}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Responsable</dt>
          <dd className="font-medium text-foreground flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            {check.responsibleUserName}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha inicio</dt>
          <dd className="font-medium text-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {new Date(check.startTime).toLocaleString("es-ES")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha fin</dt>
          <dd className="font-medium text-foreground">
            {check.endTime ? (
              new Date(check.endTime).toLocaleString("es-ES")
            ) : (
              <span className="text-muted-foreground italic">En curso</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Duración</dt>
          <dd className="font-medium text-foreground">
            {check.durationMinutes ? (
              `${Math.floor(check.durationMinutes / 60)}h ${check.durationMinutes % 60}m`
            ) : check.endTime ? (
              "-"
            ) : (
              <span className="text-muted-foreground italic">En curso</span>
            )}
          </dd>
        </div>
      </dl>

      {(check.observations || check.observaciones) && (
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground mb-0.5">Observaciones</p>
          <p className="text-sm text-foreground line-clamp-3">
            {check.observations ?? check.observaciones ?? "-"}
          </p>
        </div>
      )}
    </div>
  );
}
