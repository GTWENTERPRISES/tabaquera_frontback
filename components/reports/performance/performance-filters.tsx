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

const TIME_RANGE_LABELS: Record<string, string> = {
  "2": "Más de 2 horas",
  "4": "Más de 4 horas",
  "6": "Más de 6 horas",
  "8": "Más de 8 horas",
};

interface PerformanceFiltersProps {
  dateRange: DateRange | undefined;
  onDateChange: (dateRange: DateRange | undefined) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  timeRangeFilter: string;
  onTimeRangeFilterChange: (value: string) => void;
  /** Optional: provide to handle clear from the parent */
  onClear?: () => void;
}

export function PerformanceFilters({
  dateRange,
  onDateChange,
  stageFilter,
  onStageFilterChange,
  timeRangeFilter,
  onTimeRangeFilterChange,
  onClear,
}: PerformanceFiltersProps) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (dateRange !== undefined) n++;
    if (stageFilter !== "all") n++;
    if (timeRangeFilter !== "all") n++;
    return n;
  }, [dateRange, stageFilter, timeRangeFilter]);

  const hasActiveFilters = activeCount > 0;

  const handleClear = () => {
    onDateChange(undefined);
    onStageFilterChange("all");
    onTimeRangeFilterChange("all");
    onClear?.();
  };

  const stageName =
    stageFilter !== "all"
      ? (STAGE_LABELS[stageFilter as keyof typeof STAGE_LABELS] ?? stageFilter)
      : null;

  const timeRangeLabel =
    timeRangeFilter !== "all"
      ? (TIME_RANGE_LABELS[timeRangeFilter] ?? timeRangeFilter)
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
              Rango de Fechas
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
                    {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tiempo Mínimo
            </label>
            <Select
              value={timeRangeFilter}
              onValueChange={onTimeRangeFilterChange}
            >
              <SelectTrigger className="h-9 bg-muted/40 border-border/60 focus:bg-background transition-colors">
                <SelectValue placeholder="Cualquier tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier tiempo</SelectItem>
                <SelectItem value="2">Más de 2 horas</SelectItem>
                <SelectItem value="4">Más de 4 horas</SelectItem>
                <SelectItem value="6">Más de 6 horas</SelectItem>
                <SelectItem value="8">Más de 8 horas</SelectItem>
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
            {timeRangeLabel && (
              <ActiveFilterTag
                label={timeRangeLabel}
                onRemove={() => onTimeRangeFilterChange("all")}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
