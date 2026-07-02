"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lote } from "@/services/api";

interface ReporteProduccionLotDetailsTableProps {
  filteredLots: Lote[];
}

export function ReporteProduccionLotDetailsTable({
  filteredLots,
}: ReporteProduccionLotDetailsTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Detalle de lotes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-mono">
                    {lot.codigo}
                  </TableCell>
                  <TableCell>
                    {lot.etapa_actual_nombre || "N/A"}
                  </TableCell>
                  <TableCell>{lot.proveedor_nombre || "N/A"}</TableCell>
                  <TableCell>{lot.peso_actual_kg} kg</TableCell>
                  <TableCell className="capitalize">{lot.estado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
