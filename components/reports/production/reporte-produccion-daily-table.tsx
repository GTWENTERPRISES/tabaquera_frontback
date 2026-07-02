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

interface DailyProductionData {
  [date: string]: { lots: number; weight: number };
}

interface ReporteProduccionDailyTableProps {
  dailyProduction: DailyProductionData;
}

export function ReporteProduccionDailyTable({
  dailyProduction,
}: ReporteProduccionDailyTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Producción diaria</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Lotes</TableHead>
              <TableHead>Peso total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(dailyProduction).map(([date, data]) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>{data.lots}</TableCell>
                <TableCell>{data.weight.toLocaleString()} kg</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
