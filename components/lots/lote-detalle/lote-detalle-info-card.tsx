"use client";

import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  Scale,
  Package,
  Leaf,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoteDetalleInfoCardProps {
  lot: any;
}

export function LoteDetalleInfoCard({ lot }: LoteDetalleInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <Card className="border-0 shadow-sm w-full">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base font-medium">
            Informacion del Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 w-full">
          {/* 2 columns always — compact on mobile, roomier on desktop */}
          <div className="grid gap-2 sm:gap-3 grid-cols-2 w-full">
            {[
              {
                icon: Building2,
                label: "Proveedor",
                value: lot.proveedor || lot.supplier,
              },
              {
                icon: Scale,
                label: "Peso",
                value: `${lot.peso || lot.currentWeight} kg`,
              },
              {
                icon: Package,
                label: "Bultos",
                value: lot.quantityBales,
              },
              {
                icon: Leaf,
                label: "Tipo de tabaco",
                value: lot.variety,
              },
              {
                icon: Calendar,
                label: "Fecha de Ingreso",
                value: format(
                  new Date(lot.fechaIngreso || lot.entryDate),
                  "dd/MM/yyyy HH:mm",
                  { locale: es }
                ),
              },
              {
                icon: User,
                label: "Responsable",
                value: lot.responsable?.nombre || "-",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-muted/50"
              >
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-background shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                    {label}
                  </p>
                  <p className="font-medium text-xs sm:text-sm break-words leading-snug mt-0.5">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {lot.observaciones && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 w-full">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
                    Observaciones
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words mt-0.5">
                    {lot.observaciones}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
