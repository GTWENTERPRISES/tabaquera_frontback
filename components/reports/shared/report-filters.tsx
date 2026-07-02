"use client"

import { useState, useEffect, useMemo } from "react"
import type { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarDays, Calendar, CalendarRange, CalendarIcon } from "lucide-react"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"

interface ReportFiltersProps {
  dateRange?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  reportType: string
  onReportTypeChange?: (value: string) => void
}

export function ReportFilters({
  dateRange,
  onDateChange,
  reportType,
  onReportTypeChange,
}: ReportFiltersProps) {
  const today = new Date()
  
  const presets = [
    { key: "day", label: "Día", icon: CalendarDays },
    { key: "week", label: "Semana", icon: Calendar },
    { key: "month", label: "Mes", icon: CalendarRange },
    { key: "year", label: "Año", icon: CalendarIcon },
  ]

  const activePreset = useMemo(() => {
    if (!dateRange?.from || !dateRange.to) return null
    
    const presetRanges = {
      day: { from: startOfDay(today), to: endOfDay(today) },
      week: { from: startOfWeek(today, { locale: es }), to: endOfWeek(today, { locale: es }) },
      month: { from: startOfMonth(today), to: endOfMonth(today) },
      year: { from: startOfYear(today), to: endOfYear(today) },
    }

    for (const [key, range] of Object.entries(presetRanges)) {
      if (
        isSameDay(dateRange.from, range.from) &&
        isSameDay(dateRange.to, range.to)
      ) {
        return key
      }
    }
    return null
  }, [dateRange, today])

  const setPreset = (preset: "day" | "week" | "month" | "year") => {
    if (!onDateChange) return
    let from: Date, to: Date
    switch (preset) {
      case "day":
        from = startOfDay(today)
        to = endOfDay(today)
        break
      case "week":
        from = startOfWeek(today, { locale: es })
        to = endOfWeek(today, { locale: es })
        break
      case "month":
        from = startOfMonth(today)
        to = endOfMonth(today)
        break
      case "year":
        from = startOfYear(today)
        to = endOfYear(today)
        break
    }
    onDateChange({ from, to })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {presets.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activePreset === key ? "default" : "outline"}
            size="sm"
            onClick={() => setPreset(key as any)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <DatePickerWithRange date={dateRange} onDateChange={onDateChange} />
        {onReportTypeChange && (
          <Select value={reportType} onValueChange={onReportTypeChange}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Tipo de reporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Producción</SelectItem>
              <SelectItem value="quality">Calidad</SelectItem>
              <SelectItem value="traceability">Trazabilidad</SelectItem>
              <SelectItem value="performance">Rendimiento</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
