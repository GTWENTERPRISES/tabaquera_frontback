"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, QrCode, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";
import { useRouter } from "next/navigation";

interface LotsTableProps {
  lots: Lot[];
  sortField: "fecha" | "codigo" | "peso";
  sortDirection: "asc" | "desc";
  onSort: (field: "fecha" | "codigo" | "peso") => void;
}

export function LotsTable({
  lots,
  sortField,
  sortDirection,
  onSort,
}: LotsTableProps) {
  const router = useRouter();

  if (lots.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        No hay lotes para mostrar con los filtros actuales.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="mb-4">
        <p className="text-base font-medium">{lots.length} lotes encontrados</p>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="md:hidden space-y-3">
        {lots.map((lot, index) => {
          const estado = lot.estado || lot.status || 'pending';
          const statusConfig = LOT_STATUS_CONFIG[estado as keyof typeof LOT_STATUS_CONFIG] || LOT_STATUS_CONFIG['pending'];
          
          return (
            <motion.div
              key={lot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/qr?lot=${lot.id}`)}
                    className="flex h-8 w-8 items-center justify-center rounded bg-muted hover:bg-primary/10 transition-colors"
                  >
                    <QrCode className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                  <span className="font-mono font-medium text-lg">
                    {lot.codigo || lot.code}
                  </span>
                </div>
                <Badge
                  className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span>{lot.proveedor || lot.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">
                    {lot.peso || lot.currentWeight} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span>
                    {format(
                      new Date(lot.fechaIngreso || lot.entryDate),
                      "dd MMM yyyy",
                      { locale: es },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responsable:</span>
                  <span>{lot.responsable?.nombre || "-"}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href={`/dashboard/lotes/${lot.id}`}>
                    <Eye className="h-4 w-4" />
                    Ver Detalle
                  </Link>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Vista de tabla para desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort("codigo")}
              >
                <div className="flex items-center gap-2">
                  Codigo
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort("peso")}
              >
                <div className="flex items-center gap-2">
                  Peso
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort("fecha")}
              >
                <div className="flex items-center gap-2">
                  Fecha Ingreso
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[180px]">Responsable</TableHead>
              <TableHead className="w-[140px] text-right pr-2">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot, index) => {
              const estado = lot.estado || lot.status || 'pending';
              const statusConfig = LOT_STATUS_CONFIG[estado as keyof typeof LOT_STATUS_CONFIG] || LOT_STATUS_CONFIG['pending'];
              
              return (
                <motion.tr
                  key={lot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/qr?lot=${lot.id}`)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded bg-muted hover:bg-primary/10 transition-colors"
                      >
                        <QrCode className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </button>
                      <span className="font-mono font-medium">
                        {lot.codigo || lot.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lot.proveedor || lot.supplier}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {lot.peso || lot.currentWeight} kg
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(
                      new Date(lot.fechaIngreso || lot.entryDate),
                      "dd MMM yyyy",
                      { locale: es },
                    )}
                  </TableCell>
                  <TableCell className="w-[180px] text-muted-foreground">
                    {lot.responsable?.nombre || "-"}
                  </TableCell>
                  <TableCell className="w-[140px] text-right pr-2">
                    <Button asChild variant="ghost" size="sm" className="gap-2">
                      <Link href={`/dashboard/lotes/${lot.id}`}>
                        <Eye className="h-4 w-4" />
                        Ver Detalle
                      </Link>
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
