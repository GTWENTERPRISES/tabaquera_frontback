"use client";

import { motion } from "framer-motion";
import { CheckCircle, X, ArrowRightCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";

interface ResultContentProps {
  scannedLot: Lot;
  onClear: () => void;
  onOpenMoveDialog: () => void;
}

export function ResultContent({ scannedLot, onClear, onOpenMoveDialog }: ResultContentProps) {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      {/* Success indicator */}
      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="font-medium text-green-600 dark:text-green-400">
          Lote encontrado
        </span>
      </div>

      {/* Lot info */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xl font-bold">
              {scannedLot.codigo || scannedLot.code}
            </p>
            <p className="text-sm text-muted-foreground">
              {scannedLot.proveedor || scannedLot.supplier}
            </p>
          </div>
          {scannedLot.status && (
            <Badge
              className={`${(LOT_STATUS_CONFIG[scannedLot.status as keyof typeof LOT_STATUS_CONFIG] || LOT_STATUS_CONFIG['pending']).bgColor} ${(LOT_STATUS_CONFIG[scannedLot.status as keyof typeof LOT_STATUS_CONFIG] || LOT_STATUS_CONFIG['pending']).color} border-0`}
            >
              {
                (LOT_STATUS_CONFIG[
                  scannedLot.status as keyof typeof LOT_STATUS_CONFIG
                ] || LOT_STATUS_CONFIG['pending']).label
              }
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Peso</p>
            <p className="font-semibold">
              {scannedLot.peso || scannedLot.currentWeight} kg
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Bultos
            </p>
            <p className="font-semibold">
              {scannedLot.quantityBales}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Variedad
            </p>
            <p className="font-semibold">{scannedLot.variety}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Responsable
            </p>
            <p className="font-semibold">
              {scannedLot.responsable?.nombre || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClear}
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onOpenMoveDialog}
        >
          <ArrowRightCircle className="mr-2 h-4 w-4" />
          Mover Etapa
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/dashboard/lotes/${scannedLot.id}`}>
            Ver Detalle
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
