"use client";

import React from "react";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificaciones } from "./use-notificaciones";
import { NotificationItem } from "./notification-item";
import { NotificationFilters } from "./notification-filters";

export function NotificacionesView() {
  const { activeFilter, setActiveFilter, filteredNotifications } =
    useNotificaciones();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona todas las notificaciones del sistema
          </p>
        </div>
        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de notificaciones</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notificaciones en total
            {activeFilter !== "all" && ` (${getFilterLabel()})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center p-6">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
