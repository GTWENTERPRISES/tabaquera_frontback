"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/constants";
import { ProductionLotCard } from "./production-lot-card";
import type { Lot } from "@/lib/types";

interface ProductionTableProps {
  filteredLots: Lot[];
}

export function ProductionTable({ filteredLots }: ProductionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Lotes</CardTitle>
        <CardDescription>Lista completa de lotes filtrados</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col gap-3 md:hidden px-6">
          {filteredLots.map((lot) => (
            <ProductionLotCard key={lot.id} lot={lot} />
          ))}
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">
                        {lot.codigo ?? lot.code}
                      </TableCell>
                      <TableCell>{lot.proveedor ?? lot.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {STAGE_LABELS[
                            lot.currentStage as keyof typeof STAGE_LABELS
                          ] ?? lot.currentStage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lot.currentWeight?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lot.status === "active" ? "default" : "secondary"
                          }
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
                      </TableCell>
                      <TableCell>
                        {new Date(
                          lot.entryDate ?? lot.fechaIngreso ?? Date.now(),
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
