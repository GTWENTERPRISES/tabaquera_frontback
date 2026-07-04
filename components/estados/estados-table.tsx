"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  Package,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STAGE_COLORS, STAGE_LABELS, LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";

function getTimeInStage(lot: Lot): { label: string; isDelayed: boolean } | null {
  const entry = lot.movements?.find(
    (m: any) => m.toStage === lot.currentStage && !m.completedAt,
  );
  if (!entry?.startedAt) return null;
  const ms = Date.now() - new Date(entry.startedAt).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return {
    label: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
    isDelayed: hours >= 8,
  };
}

function EstadoBadge({ estado }: { estado?: string }) {
  if (!estado) return null;
  const config = LOT_STATUS_CONFIG[estado as keyof typeof LOT_STATUS_CONFIG];
  if (!config)
    return (
      <Badge variant="outline" className="text-xs">
        {estado}
      </Badge>
    );
  return (
    <Badge className={`text-xs ${config.bgColor} ${config.color} border`}>
      {config.label}
    </Badge>
  );
}

interface EstadosTableProps {
  lots: Lot[];
  isLoading: boolean;
  onSelectLot: (lot: Lot) => void;
}

export function EstadosTable({ lots, isLoading, onSelectLot }: EstadosTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Cargando lotes…</span>
      </div>
    );
  }

  if (lots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <Package className="h-10 w-10 opacity-30" />
        <p className="text-sm">No se encontraron lotes</p>
        <p className="text-xs opacity-60">Intenta con otro término de búsqueda o filtro</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lots.map((lot, i) => {
        const timeData = getTimeInStage(lot);
        const isCompleted =
          lot.estado === "finalizado" || lot.status === "completed";

        return (
          <motion.div
            key={lot.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <button
              onClick={() => onSelectLot(lot)}
              className="w-full text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors px-4 py-3 group">
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Package className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Code + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm">
                      {lot.codigo ?? lot.code}
                    </span>
                    <Badge className={`text-[10px] ${STAGE_COLORS[lot.currentStage]}`}>
                      {STAGE_LABELS[lot.currentStage]}
                    </Badge>
                    <EstadoBadge estado={lot.estado} />
                    {timeData?.isDelayed && (
                      <Badge variant="destructive" className="text-[10px] gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Retraso
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {lot.proveedor ?? lot.supplier ?? "–"} ·{" "}
                    {lot.origin ?? "–"} · {lot.quantityBales ?? "–"} bultos
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{timeData?.label ?? "–"}</span>
                  </div>
                  <div className="hidden sm:block">
                    {format(
                      new Date(lot.fechaIngreso ?? lot.entryDate),
                      "dd MMM yyyy",
                      { locale: es },
                    )}
                  </div>
                  <div className="hidden md:block truncate max-w-[140px]">
                    {lot.responsable?.nombre ?? "Sin asignar"}
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
