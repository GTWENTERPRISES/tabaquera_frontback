import { QualityStatusBadge } from "./quality-status-badge";
import type { QualityCheck } from "@/lib/types";

function formatDate(val?: string | number) {
  return new Date(val ?? Date.now()).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function QualityCheckCard({ check }: { check: QualityCheck }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono font-semibold text-sm text-foreground">
          {check.lotCode}
        </span>
        <QualityStatusBadge status={check.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Etapa</dt>
          <dd className="font-medium text-foreground">{check.stage}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Grado</dt>
          <dd className="font-medium text-foreground">{check.grade}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Temperatura</dt>
          <dd className="font-medium text-foreground">{check.temperature}°C</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Humedad</dt>
          <dd className="font-medium text-foreground">{check.humidity}%</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Inspector</dt>
          <dd className="font-medium text-foreground truncate">
            {check.inspector}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha</dt>
          <dd className="font-medium text-foreground">
            {formatDate(check.date)}
          </dd>
        </div>
      </dl>

      {(check.notes || check.observaciones) && (
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground mb-0.5">Observaciones</p>
          <p className="text-sm text-foreground line-clamp-3">
            {check.notes ?? check.observaciones}
          </p>
        </div>
      )}
    </div>
  );
}
