"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
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
  const hasActiveFilters =
    filters.search !== "" ||
    filters.stage !== "all" ||
    filters.showDelayed;

  const reset = () =>
    onChange({ search: "", stage: "all", showDelayed: false });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar lote, proveedor, responsable…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Stage filter */}
      <Select
        value={filters.stage}
        onValueChange={(v) => onChange({ ...filters, stage: v as Stage | "all" })}
      >
        <SelectTrigger className="h-9 w-[180px] text-sm">
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
        onClick={() => onChange({ ...filters, showDelayed: !filters.showDelayed })}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Solo retrasados
      </Button>

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 text-xs text-muted-foreground"
          onClick={reset}
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}

      {/* Count badge */}
      <Badge variant="secondary" className="text-xs ml-auto shrink-0">
        {totalVisible} / {totalAll} lotes
      </Badge>
    </div>
  );
}
