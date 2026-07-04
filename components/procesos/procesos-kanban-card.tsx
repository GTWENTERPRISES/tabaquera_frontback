"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Eye,
  GitBranch,
  Package,
  Clock,
  AlertTriangle,
  User,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";

function getTimeInStage(lot: Lot): { label: string; isDelayed: boolean } | null {
  const entry = lot.movements?.find(
    (m: any) => m.toStage === lot.currentStage && !m.completedAt,
  );
  if (!entry?.startedAt) return null;

  const ms = Date.now() - new Date(entry.startedAt).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const isDelayed = hours >= 8;

  const label =
    hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { label, isDelayed };
}

interface ProcesosKanbanCardProps {
  lot: Lot;
  index: number;
  onDragStart: (e: React.DragEvent, lot: Lot) => void;
  highlighted?: boolean;
}

export function ProcesosKanbanCard({
  lot,
  index,
  onDragStart,
  highlighted = false,
}: ProcesosKanbanCardProps) {
  const timeData = getTimeInStage(lot);
  const stageConfig = LOT_STATUS_CONFIG[lot.currentStage];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, lot)}
      className={`group cursor-grab active:cursor-grabbing ${
        highlighted ? "ring-2 ring-primary ring-offset-1 rounded-xl" : ""
      }`}
    >
      <Card className="border shadow-sm hover:shadow-md transition-shadow w-full">
        <CardContent className="p-2.5 sm:p-3 space-y-2">
          {/* Code + priority */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-mono text-xs font-semibold truncate">
                {lot.codigo ?? lot.code}
              </span>
            </div>
            {timeData?.isDelayed && (
              <Badge
                variant="destructive"
                className="text-[10px] px-1.5 py-0 h-4 shrink-0"
              >
                <Flag className="h-2.5 w-2.5 mr-0.5" />
                Retraso
              </Badge>
            )}
          </div>

          {/* Supplier + weight */}
          <p className="text-[10px] text-muted-foreground truncate">
            {lot.proveedor ?? lot.supplier ?? "–"} ·{" "}
            {lot.currentWeight ?? lot.peso ?? "–"} kg
          </p>

          {/* Responsible */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {lot.responsable?.nombre ?? "Sin asignar"}
            </span>
          </div>

          {/* Time in stage */}
          {timeData && (
            <div
              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full w-fit ${
                timeData.isDelayed
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {timeData.isDelayed ? (
                <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
              ) : (
                <Clock className="h-2.5 w-2.5 shrink-0" />
              )}
              <span>{timeData.label} en etapa</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-1.5 border-t gap-1">
            <span className="text-[10px] text-muted-foreground">
              {format(
                new Date(lot.fechaIngreso ?? lot.entryDate),
                "dd MMM",
                { locale: es },
              )}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                asChild
                title="Ver detalle del lote"
              >
                <Link href={`/dashboard/lotes/${lot.id}`}>
                  <Eye className="h-3 w-3" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                asChild
                title="Ver trazabilidad"
              >
                <Link href={`/dashboard/trazabilidad/${lot.id}`}>
                  <GitBranch className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
