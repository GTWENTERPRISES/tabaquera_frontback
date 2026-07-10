"use client";

import { useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
import { ActiveFilterTag } from "@/components/ui/filter-tag";
import { PRODUCTION_STAGES, LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Stage } from "@/lib/types";

export interface EstadosFilterValues {
  stage: Stage | "all";
  estado: string;
  responsable: string;
}

interface EstadosFiltersProps {
  filters: EstadosFilterValues;
  onChange: (f: EstadosFilterValues) => void;
  responsables: string[];
  total: number;
  filtered: number;
  /** Optional text search — add searchTerm/setSearchTerm to the parent view to enable */
  searchTerm?: string;
  setSearchTerm?: (v: string) => void;
}

const BACKEND_STATES = [
  { value: "all", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_espera", label: "En espera" },
  { value: "en_produccion", label: "En producción" },
  { value: "finalizado", label: "Finalizado" },
  { value: "rechazado", label: "Rechazado" },
];

export function EstadosFilters({
  filters,
  onChange,
  responsables,
  total,
  filtered,
  searchTerm = "",
  setSearchTerm,
}: EstadosFiltersProps) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (searchTerm) n++;
    if (filters.stage !== "all") n++;
    if (filters.estado !== "all") n++;
    if (filters.responsable !== "all") n++;
    return n;
  }, [searchTerm, filters]);

  const hasActiveFilters = activeCount > 0;

  const clearAll = () => {
    onChange({ stage: "all", estado: "all", responsable: "all" });
    setSearchTerm?.("");
  };

  const stageLabel =
    filters.stage !== "all"
      ? (LOT_STATUS_CONFIG[filters.stage]?.label ?? filters.stage)
      : null;

  const estadoLabel =
    filters.estado !== "all"
      ? (BACKEND_STATES.find((s) => s.value === filters.estado)?.label ?? filters.estado)
      : null;

  const responsableLabel =
    filters.responsable !== "all" ? filters.responsable : null;

  return (
    <Card className="border-0 shadow-sm">
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
            <Badge variant="secondary" className="text-xs ml-1 shrink-0">
              {filtered} / {total} lotes
            </Badge>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar lote, proveedor..."
              className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm?.(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Etapa */}
          <Select
            value={filters.stage}
            onValueChange={(v) =>
              onChange({ ...filters, stage: v as Stage | "all" })
            }
          >
            <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
              <SelectValue placeholder="Todas las etapas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              {PRODUCTION_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LOT_STATUS_CONFIG[s]?.label ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Estado backend */}
          <Select
            value={filters.estado}
            onValueChange={(v) => onChange({ ...filters, estado: v })}
          >
            <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              {BACKEND_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Responsable */}
          <Select
            value={filters.responsable}
            onValueChange={(v) => onChange({ ...filters, responsable: v })}
          >
            <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
              <SelectValue placeholder="Todos los responsables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los responsables</SelectItem>
              {responsables.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
            {searchTerm && (
              <ActiveFilterTag
                label={`"${searchTerm}"`}
                onRemove={() => setSearchTerm?.("")}
              />
            )}
            {stageLabel && (
              <ActiveFilterTag
                label={stageLabel}
                onRemove={() => onChange({ ...filters, stage: "all" })}
              />
            )}
            {estadoLabel && (
              <ActiveFilterTag
                label={estadoLabel}
                onRemove={() => onChange({ ...filters, estado: "all" })}
              />
            )}
            {responsableLabel && (
              <ActiveFilterTag
                label={responsableLabel}
                onRemove={() => onChange({ ...filters, responsable: "all" })}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
