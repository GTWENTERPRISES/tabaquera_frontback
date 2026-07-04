"use client";

import { X } from "lucide-react";
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
}: EstadosFiltersProps) {
  const hasActive =
    filters.stage !== "all" ||
    filters.estado !== "all" ||
    filters.responsable !== "all";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Etapa */}
      <Select
        value={filters.stage}
        onValueChange={(v) => onChange({ ...filters, stage: v as Stage | "all" })}
      >
        <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm">
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
        <SelectTrigger className="h-9 w-full sm:w-[200px] text-sm">
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
        <SelectTrigger className="h-9 w-full sm:w-[200px] text-sm">
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

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 text-xs text-muted-foreground"
          onClick={() =>
            onChange({ stage: "all", estado: "all", responsable: "all" })
          }
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}

      <Badge variant="secondary" className="text-xs ml-auto shrink-0">
        {filtered} / {total} lotes
      </Badge>
    </div>
  );
}
