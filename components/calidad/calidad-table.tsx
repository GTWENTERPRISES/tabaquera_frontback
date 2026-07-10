"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Thermometer,
  Droplets,
  Eye,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActiveFilterTag } from "@/components/ui/filter-tag";
import type { QualityCheck, QualityStatus } from "@/lib/types";

const gradeColors: Record<string, string> = {
  A: "bg-primary/10 text-primary border-primary/20",
  B: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  C: "bg-accent/10 text-accent border-accent/20",
  D: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusColors: Record<QualityStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  passed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  passed_with_notes:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels: Record<QualityStatus, string> = {
  pending: "Pendiente",
  in_progress: "En Inspección",
  passed: "Aprobado",
  passed_with_notes: "Aprobado con Observaciones",
  failed: "Rechazado",
};

interface CalidadTableProps {
  checks: QualityCheck[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export function CalidadTable({
  checks,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: CalidadTableProps) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (searchTerm) n++;
    if (statusFilter !== "all") n++;
    return n;
  }, [searchTerm, statusFilter]);

  const hasActiveFilters = activeCount > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div>
      {/* ── Filter Card ── */}
      <Card className="border-0 shadow-sm mb-4">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              Filtros
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full bg-primary text-primary-foreground"
                >
                  {activeCount}
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Filter grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Código de lote, inspector..."
                className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_progress">En Inspección</SelectItem>
                <SelectItem value="passed">Aprobados</SelectItem>
                <SelectItem value="passed_with_notes">
                  Aprobados con Observaciones
                </SelectItem>
                <SelectItem value="failed">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
              {searchTerm && (
                <ActiveFilterTag
                  label={`"${searchTerm}"`}
                  onRemove={() => setSearchTerm("")}
                />
              )}
              {statusFilter !== "all" && (
                <ActiveFilterTag
                  label={statusLabels[statusFilter as QualityStatus] ?? statusFilter}
                  onRemove={() => setStatusFilter("all")}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {checks.map((check, index) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono font-medium">{check.lotCode}</p>
                <p className="text-sm text-muted-foreground">{check.stage}</p>
              </div>
              <Badge className={statusColors[check.status]}>
                {statusLabels[check.status]}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Grado</p>
                <Badge variant="outline" className={gradeColors[check.grade]}>
                  Grado {check.grade}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-sm">
                  {new Date(check.date).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Temperatura</p>
                <div className="flex items-center gap-1 text-sm">
                  <Thermometer className="h-3 w-3 text-destructive" />
                  {check.temperature}°C
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Humedad</p>
                <div className="flex items-center gap-1 text-sm">
                  <Droplets className="h-3 w-3 text-chart-2" />
                  {check.humidity}%
                </div>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">Inspector</p>
              <p className="text-sm">{check.inspector}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href={`/dashboard/calidad/${check.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalle
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Humedad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[180px]">Inspector</TableHead>
              <TableHead className="w-[140px] text-right pr-2">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((check, index) => (
              <motion.tr
                key={check.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <TableCell className="font-mono font-medium">
                  {check.lotCode}
                </TableCell>
                <TableCell>{check.stage}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={gradeColors[check.grade]}>
                    Grado {check.grade}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-destructive" />
                    {check.temperature}°C
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-chart-2" />
                    {check.humidity}%
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[check.status]}>
                    {statusLabels[check.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(check.date).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell className="w-[180px]">{check.inspector}</TableCell>
                <TableCell className="w-[140px] text-right pr-2">
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href={`/dashboard/calidad/${check.id}`}>
                      <Eye className="h-4 w-4" />
                      Ver Detalle
                    </Link>
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
