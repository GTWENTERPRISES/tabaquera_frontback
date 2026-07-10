"use client";

import { useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export interface ProcesosFilterValues {
  search: string;
  stage: Stage | "all";
  showDelayed: boolean;
}

interface ProcesosFiltersProps {
  filters: ProcesosFilterValues;
  onChange: (filters: ProcesosFilterValues) => void;
  totalVisible: number;
  totalAll: number;
}

export function ProcesosFilters({
  filters,
  onChange,
  totalVisible,
  totalAll,
}: ProcesosFiltersProps) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.search !== "") n++;
    if (filters.stage !== "all") n++;
    if (filters.showDelayed) n++;
    return n;
  }, [filters]);

  const hasActiveFilters = activeCount > 0;

  const reset = () => onChange({ search: "", stage: "all", showDelayed: false });

  const stageLabel =
    filters.stage !== "all"
      ? (LOT_STATUS_CONFIG[filters.stage]?.label ?? filters.stage)
      : null;

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
              {totalVisible} / {totalAll} lotes
            </Badge>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar lote, proveedor, responsable…"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => onChange({ ...filters, search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stage filter */}
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

          {/* Delayed toggle */}
          <Button
            variant={filters.showDelayed ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5 text-sm"
            onClick={() =>
              onChange({ ...filters, showDelayed: !filters.showDelayed })
            }
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Solo retrasados
          </Button>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
            {filters.search && (
              <ActiveFilterTag
                label={`"${filters.search}"`}
                onRemove={() => onChange({ ...filters, search: "" })}
              />
            )}
            {stageLabel && (
              <ActiveFilterTag
                label={stageLabel}
                onRemove={() => onChange({ ...filters, stage: "all" })}
              />
            )}
            {filters.showDelayed && (
              <ActiveFilterTag
                label="Solo retrasados"
                onRemove={() => onChange({ ...filters, showDelayed: false })}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
