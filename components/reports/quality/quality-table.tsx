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
import { useQualityTable } from "./use-quality-table";
import { QualityStatusBadge } from "./quality-status-badge";
import { QualityCheckCard } from "./quality-check-card";
import { QualityPaginationControls } from "./quality-pagination-controls";
import type { QualityCheck } from "@/lib/types";

function formatDate(val?: string | number) {
  return new Date(val ?? Date.now()).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface QualityTableProps {
  filteredChecks: QualityCheck[];
}

export function QualityTable({ filteredChecks }: QualityTableProps) {
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    currentItems,
    startItem,
    endItem,
    handlePageChange,
    handlePageSizeChange,
  } = useQualityTable(filteredChecks);

  const empty = filteredChecks.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Inspecciones</CardTitle>
        <CardDescription>
          Lista completa de controles de calidad filtrados
          {!empty && (
            <span className="ml-2 font-medium">
              (Total: {totalItems} inspecciones)
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {empty ? (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-2 px-6">
            <p className="font-medium text-foreground">Sin inspecciones</p>
            <p className="text-sm text-muted-foreground">
              No hay registros que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden px-6">
              {currentItems.map((check) => (
                <QualityCheckCard key={check.id} check={check} />
              ))}
            </div>

            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lote</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Grado</TableHead>
                        <TableHead>Temperatura</TableHead>
                        <TableHead>Humedad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((check) => (
                        <TableRow key={check.id}>
                          <TableCell className="font-medium">
                            {check.lotCode}
                          </TableCell>
                          <TableCell>{check.stage}</TableCell>
                          <TableCell>{check.grade}</TableCell>
                          <TableCell>{check.temperature}°C</TableCell>
                          <TableCell>{check.humidity}%</TableCell>
                          <TableCell>
                            <QualityStatusBadge status={check.status} />
                          </TableCell>
                          <TableCell>{check.inspector}</TableCell>
                          <TableCell>{formatDate(check.date)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {check.notes ?? check.observaciones ?? "–"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="px-6 pt-4">
                <QualityPaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  startItem={startItem}
                  endItem={endItem}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
