"use client";

import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActiveFilterTag } from "@/components/ui/filter-tag";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { DateRange } from "react-day-picker";

interface ProductionFiltersProps {
  dateRange: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  supplierFilter: string;
  onSupplierFilterChange: (value: string) => void;
  suppliers: string[];
  /** Optional: provide to enable the "Limpiar filtros" button from the parent */
  onClear?: () => void;
}

export function ProductionFilters({
  dateRange,
  onDateChange,
  stageFilter,
  onStageFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  suppliers,
  onClear,
}: ProductionFiltersProps) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (dateRange !== undefined) n++;
    if (stageFilter !== "all") n++;
    if (supplierFilter !== "all") n++;
    return n;
  }, [dateRange, stageFilter, supplierFilter]);

  const hasActiveFilters = activeCount > 0;

  const handleClear = () => {
    onDateChange(undefined);
    onStageFilterChange("all");
    onSupplierFilterChange("all");
    onClear?.();
  };

  const stageName =
    stageFilter !== "all"
      ? (STAGE_LABELS[stageFilter as keyof typeof STAGE_LABELS] ?? stageFilter)
      : null;

  const dateLabel = useMemo(() => {
    if (!dateRange) return null;
    const from = dateRange.from?.toLocaleDateString("es-ES") ?? "?";
    const to = dateRange.to?.toLocaleDateString("es-ES");
    return to ? `${from} – ${to}` : `Desde ${from}`;
  }, [dateRange]);

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
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Rango de fechas
            </label>
            <DatePickerWithRange date={dateRange} onDateChange={onDateChange} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Etapa
            </label>
            <Select value={stageFilter} onValueChange={onStageFilterChange}>
              <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
                <SelectValue placeholder="Todas las etapas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Proveedor
            </label>
            <Select
              value={supplierFilter}
              onValueChange={onSupplierFilterChange}
            >
              <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
                <SelectValue placeholder="Todos los proveedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
            {dateLabel && (
              <ActiveFilterTag
                label={`Fecha: ${dateLabel}`}
                onRemove={() => onDateChange(undefined)}
              />
            )}
            {stageName && (
              <ActiveFilterTag
                label={stageName}
                onRemove={() => onStageFilterChange("all")}
              />
            )}
            {supplierFilter !== "all" && (
              <ActiveFilterTag
                label={supplierFilter}
                onRemove={() => onSupplierFilterChange("all")}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
