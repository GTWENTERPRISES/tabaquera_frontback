"use client";

import React from "react";
import { Filter, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/contexts/notification-context";

type FilterType =
  | "all"
  | "unread"
  | "critical"
  | "production"
  | "quality"
  | "admin"
  | "today"
  | "this_week";

interface NotificationFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function NotificationFilters({
  activeFilter,
  onFilterChange,
}: NotificationFiltersProps) {
  const { unreadCount, markAllAsRead } = useNotifications();

  const getFilterLabel = () => {
    switch (activeFilter) {
      case "all":
        return "Todas";
      case "unread":
        return "No leídas";
      case "critical":
        return "Críticas";
      case "production":
        return "Producción";
      case "quality":
        return "Calidad";
      case "admin":
        return "Administración";
      case "today":
        return "Hoy";
      case "this_week":
        return "Esta semana";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            {getFilterLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onFilterChange("all")}>
            Todas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("unread")}>
            No leídas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("critical")}>
            Críticas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Categorías
          </div>
          <DropdownMenuItem onClick={() => onFilterChange("production")}>
            Producción
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("quality")}>
            Calidad
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("admin")}>
            Administración
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            <Calendar className="h-3 w-3 inline mr-1" />
            Fecha
          </div>
          <DropdownMenuItem onClick={() => onFilterChange("today")}>
            Hoy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("this_week")}>
            Esta semana
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {unreadCount > 0 && (
        <Button onClick={markAllAsRead} variant="ghost" size="sm">
          <Check className="h-4 w-4 mr-1" />
          Marcar todas como leídas
        </Button>
      )}
    </div>
  );
}
