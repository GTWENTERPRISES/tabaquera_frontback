"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Building2, CalendarRange, X, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { LotFilters, LegacyLotState } from "@/lib/types";
import { useLots } from "@/contexts/lot-context";

interface LotsFiltersProps {
  filters: LotFilters;
  setFilters: (filters: LotFilters) => void;
}

const EMPTY_FILTERS: LotFilters = {};

export function LotsFilters({ filters, setFilters }: LotsFiltersProps) {
  const { lots } = useLots();

  const proveedores = useMemo(
    () =>
      Array.from(
        new Set(lots.map((lot) => lot.proveedor || lot.supplier).filter(Boolean)),
      ).sort() as string[],
    [lots],
  );

  // Cantidad de filtros activos
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.busqueda) n++;
    if (filters.estado?.length) n++;
    if (filters.proveedor) n++;
    if (filters.fechaDesde) n++;
    if (filters.fechaHasta) n++;
    return n;
  }, [filters]);

  const hasActiveFilters = activeCount > 0;

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          {/* Header de la sección de filtros */}
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

          {/* Filtros en grilla */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Búsqueda */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Código, proveedor, responsable..."
                className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
                value={filters.busqueda || ""}
                onChange={(e) =>
                  setFilters({ ...filters, busqueda: e.target.value || undefined })
                }
              />
              {filters.busqueda && (
                <button
                  onClick={() => setFilters({ ...filters, busqueda: undefined })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Estado */}
            <Select
              value={filters.estado?.[0] || "todos"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  estado:
                    value === "todos" ? undefined : [value as LegacyLotState],
                })
              }
            >
              <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(LOT_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${config.bgColor}`}
                      />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Proveedor */}
            <Select
              value={filters.proveedor || "todos"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  proveedor: value === "todos" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Proveedor" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proveedores</SelectItem>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor} value={proveedor}>
                    {proveedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rango de fechas */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60 h-9">
                <CalendarRange className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Input
                  type="date"
                  title="Fecha desde"
                  value={
                    filters.fechaDesde
                      ? new Date(filters.fechaDesde).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      fechaDesde: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="h-auto p-0 border-0 bg-transparent text-xs focus-visible:ring-0 w-[100px] text-muted-foreground"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="date"
                  title="Fecha hasta"
                  value={
                    filters.fechaHasta
                      ? new Date(filters.fechaHasta).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      fechaHasta: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="h-auto p-0 border-0 bg-transparent text-xs focus-visible:ring-0 w-[100px] text-muted-foreground"
                />
                {(filters.fechaDesde || filters.fechaHasta) && (
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        fechaDesde: undefined,
                        fechaHasta: undefined,
                      })
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
              {filters.busqueda && (
                <ActiveFilterTag
                  label={`"${filters.busqueda}"`}
                  onRemove={() => setFilters({ ...filters, busqueda: undefined })}
                />
              )}
              {filters.estado?.[0] && (
                <ActiveFilterTag
                  label={LOT_STATUS_CONFIG[filters.estado[0] as keyof typeof LOT_STATUS_CONFIG]?.label || filters.estado[0]}
                  onRemove={() => setFilters({ ...filters, estado: undefined })}
                />
              )}
              {filters.proveedor && (
                <ActiveFilterTag
                  label={filters.proveedor}
                  onRemove={() => setFilters({ ...filters, proveedor: undefined })}
                />
              )}
              {filters.fechaDesde && (
                <ActiveFilterTag
                  label={`Desde ${new Date(filters.fechaDesde).toLocaleDateString("es-ES")}`}
                  onRemove={() => setFilters({ ...filters, fechaDesde: undefined })}
                />
              )}
              {filters.fechaHasta && (
                <ActiveFilterTag
                  label={`Hasta ${new Date(filters.fechaHasta).toLocaleDateString("es-ES")}`}
                  onRemove={() => setFilters({ ...filters, fechaHasta: undefined })}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActiveFilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary/70 transition-colors ml-0.5"
        aria-label="Quitar filtro"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
