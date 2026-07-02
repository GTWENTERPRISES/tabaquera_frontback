"use client";

import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package, Edit, Printer, Download, ArrowRight } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import { STAGES } from "@/lib/constants";

interface LoteDetalleHeaderProps {
  lot: any;
  id: string;
  canEditLots: boolean;
  onMoveClick: () => void;
  onExportPDF: () => void;
}

export function LoteDetalleHeader({
  lot,
  id,
  canEditLots,
  onMoveClick,
  onExportPDF,
}: LoteDetalleHeaderProps) {
  const statusKey =
    lot.estado || lot.status || lot.currentStage || "pending";
  const statusConfig =
    LOT_STATUS_CONFIG[statusKey as keyof typeof LOT_STATUS_CONFIG] ||
    LOT_STATUS_CONFIG["pending"];

  const currentIndex = STAGES.indexOf(lot.currentStage);
  const isLastStage = currentIndex >= STAGES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 w-full"
    >
      <BackButton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Package className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground font-mono break-all">
                {lot.codigo || lot.code}
              </h1>
              <Badge
                className={`${statusConfig.bgColor} ${statusConfig.color} border-0 shrink-0`}
              >
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              Ingresado el{" "}
              {format(
                new Date(lot.fechaIngreso || lot.entryDate),
                "dd 'de' MMMM, yyyy",
                { locale: es },
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canEditLots &&
            lot.status === "active" &&
            lot.estado !== "completado" &&
            lot.estado !== "finalizado" &&
            lot.estado !== "rechazado" && (
              <Button
                size="sm"
                className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3"
                onClick={onMoveClick}
              >
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{isLastStage ? "Completar Lote" : "Mover Etapa"}</span>
              </Button>
            )}
          {canEditLots && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <Link href={`/dashboard/lotes/${id}/editar`}>
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Editar</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={onExportPDF}
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
