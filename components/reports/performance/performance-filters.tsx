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

interface PerformanceFiltersProps {
  dateRange: DateRange | undefined;
  onDateChange: (dateRange: DateRange | undefined) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  timeRangeFilter: string;
  onTimeRangeFilterChange: (value: string) => void;
}

export function PerformanceFilters({
  dateRange,
  onDateChange,
  stageFilter,
  onStageFilterChange,
  timeRangeFilter,
  onTimeRangeFilterChange,
}: PerformanceFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rango de Fechas</label>
            <DatePickerWithRange date={dateRange} onDateChange={onDateChange} />
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
                    {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiempo Mínimo</label>
            <Select
              value={timeRangeFilter}
              onValueChange={onTimeRangeFilterChange}
            >
              <SelectTrigger>
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
      </CardContent>
    </Card>
  );
}
