import { Bell, Search } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemActivityHeaderProps {
  eventStats: {
    total: number;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  eventTypeFilter: string;
  setEventTypeFilter: (type: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
}

export function SystemActivityHeader({
  eventStats,
  searchTerm,
  setSearchTerm,
  eventTypeFilter,
  setEventTypeFilter,
  dateFilter,
  setDateFilter,
}: SystemActivityHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Actividad del Sistema
        </CardTitle>
        <Badge variant="outline" className="ml-auto">
          {eventStats.total} eventos
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 mt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="lot">Lotes</SelectItem>
                <SelectItem value="quality">Calidad</SelectItem>
                <SelectItem value="stage">Etapas</SelectItem>
                <SelectItem value="user">Usuarios</SelectItem>
                <SelectItem value="observation">Observaciones</SelectItem>
                <SelectItem value="alert">Alertas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Cualquier fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier fecha</SelectItem>
                <SelectItem value="1">Última hora</SelectItem>
                <SelectItem value="24">Últimas 24 horas</SelectItem>
                <SelectItem value="168">Última semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
