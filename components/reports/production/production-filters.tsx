"use client";

import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import type { DateRange } from "react-day-picker";

interface ProductionFiltersProps {
  dateRange: DateRange | undefined;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  supplierFilter: string;
  onSupplierFilterChange: (value: string) => void;
  suppliers: string[];
}

export function ProductionFilters({
  dateRange,
  stageFilter,
  onStageFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  suppliers,
}: ProductionFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rango de fechas</label>
            <DatePickerWithRange date={dateRange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Etapa</label>
            <Select value={stageFilter} onValueChange={onStageFilterChange}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Proveedor</label>
            <Select
              value={supplierFilter}
              onValueChange={onSupplierFilterChange}
            >
              <SelectTrigger>
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
      </CardContent>
    </Card>
  );
}
