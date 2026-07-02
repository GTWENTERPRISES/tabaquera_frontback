"use client";

import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventFilterCardProps {
  eventTypeFilter: string;
  setEventTypeFilter: (value: string) => void;
}

export function EventFilterCard({ eventTypeFilter, setEventTypeFilter }: EventFilterCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtrar Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Select
            value={eventTypeFilter}
            onValueChange={setEventTypeFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="stage_change">
                Cambios de Etapa
              </SelectItem>
              <SelectItem value="quality_check">
                Controles de Calidad
              </SelectItem>
              <SelectItem value="observation">Observaciones</SelectItem>
              <SelectItem value="system">Eventos del Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
