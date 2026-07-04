"use client";

import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";
import { ProcesosKanbanCard } from "./procesos-kanban-card";

interface ProcesosKanbanColumnV2Props {
  stage: Stage;
  lots: Lot[];
  stageIndex: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: Stage) => void;
  onDragStart: (e: React.DragEvent, lot: Lot) => void;
  searchTerm?: string;
  fullWidth?: boolean;
}

/**
 * Derived load indicator:
 *  green  → 0–4 lots
 *  yellow → 5–9 lots
 *  red    → 10+ lots
 */
function getLoadColor(count: number) {
  if (count >= 10) return "border-destructive/40 bg-destructive/5";
  if (count >= 5) return "border-warning/40 bg-warning/5";
  return "border-success/30 bg-success/5";
}

function getLoadBadgeColor(count: number) {
  if (count >= 10) return "bg-destructive/10 text-destructive border-destructive/20";
  if (count >= 5) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

export function ProcesosKanbanColumnV2({
  stage,
  lots,
  stageIndex,
  onDragOver,
  onDrop,
  onDragStart,
  searchTerm = "",
  fullWidth = false,
}: ProcesosKanbanColumnV2Props) {
  const config = LOT_STATUS_CONFIG[stage];
  const loadColor = getLoadColor(lots.length);
  const loadBadgeColor = getLoadBadgeColor(lots.length);

  const filteredLots = searchTerm
    ? lots.filter(
        (l) =>
          (l.codigo ?? l.code ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (l.proveedor ?? l.supplier ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (l.responsable?.nombre ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : lots;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stageIndex * 0.08 }}
      className={fullWidth ? "w-full" : "min-w-[270px] sm:min-w-[290px] shrink-0"}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      <Card
        className={`border flex flex-col max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-240px)] shadow-sm ${loadColor}`}
      >
        <CardHeader className="py-2.5 sm:py-3 border-b shrink-0">
          <CardTitle
            className={`text-xs sm:text-sm font-semibold flex items-center justify-between ${config.color}`}
          >
            <span>{config.label}</span>
            <Badge className={`text-[10px] ${loadBadgeColor}`}>
              {lots.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-1.5 sm:p-2 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-1">
              {filteredLots.slice(0, 12).map((lot, i) => (
                <ProcesosKanbanCard
                  key={lot.id}
                  lot={lot}
                  index={i}
                  onDragStart={onDragStart}
                />
              ))}

              {filteredLots.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  {searchTerm ? "Sin coincidencias" : "Sin lotes"}
                </div>
              )}

              {filteredLots.length > 12 && (
                <p className="text-center text-[10px] text-muted-foreground py-2">
                  +{filteredLots.length - 12} lotes más
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
