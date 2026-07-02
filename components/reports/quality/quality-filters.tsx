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
import type { DateRange } from "react-day-picker";

interface QualityFiltersProps {
  dateRange: DateRange | undefined;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  inspectorFilter: string;
  onInspectorFilterChange: (value: string) => void;
  inspectors: string[];
}

export function QualityFilters({
  dateRange,
  statusFilter,
  onStatusFilterChange,
  inspectorFilter,
  onInspectorFilterChange,
  inspectors,
}: QualityFiltersProps) {
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
            <label className="text-sm font-medium">Estado</label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="passed">Aprobado</SelectItem>
                <SelectItem value="failed">Rechazado</SelectItem>
                <SelectItem value="passed_with_notes">Observaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Inspector</label>
            <Select
              value={inspectorFilter}
              onValueChange={onInspectorFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los inspectores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los inspectores</SelectItem>
                {inspectors.map((inspector) => (
                  <SelectItem key={inspector} value={inspector}>
                    {inspector}
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
