"use client";

import { motion } from "framer-motion";
import { Search, Filter, Calendar, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { LotFilters, LegacyLotState } from "@/lib/types";
import { useLots } from "@/contexts/lot-context";

interface LotsFiltersProps {
  filters: LotFilters;
  setFilters: (filters: LotFilters) => void;
}

export function LotsFilters({ filters, setFilters }: LotsFiltersProps) {
  const { lots } = useLots();

  const proveedores = Array.from(
    new Set(lots.map((lot) => lot.proveedor || lot.supplier).filter(Boolean)),
  ).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por codigo, proveedor, responsable..."
                className="pl-9"
                value={filters.busqueda || ""}
                onChange={(e) =>
                  setFilters({ ...filters, busqueda: e.target.value })
                }
              />
            </div>
            <Select
              value={filters.estado?.[0] || "todos"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  estado:
                    value === "todos" ? undefined : [value as LegacyLotState],
                })
              }
            >
              <SelectTrigger className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(LOT_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.proveedor || "todos"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  proveedor: value === "todos" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proveedores</SelectItem>
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor} value={proveedor}>
                    {proveedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row gap-2">
              <Input
                type="date"
                placeholder="Fecha desde"
                value={
                  filters.fechaDesde
                    ? new Date(filters.fechaDesde).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    fechaDesde: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="flex-1"
              />
              <Input
                type="date"
                placeholder="Fecha hasta"
                value={
                  filters.fechaHasta
                    ? new Date(filters.fechaHasta).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    fechaHasta: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
