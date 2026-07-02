"use client";

import { useState, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { SystemEvent } from "@/lib/types";

export function useSystemActivity(maxItems: number = 20) {
  const { systemEvents } = useLots();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    let filtered = [...systemEvents];

    if (eventTypeFilter !== "all") {
      filtered = filtered.filter((event) => event.type === eventTypeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.lotCode?.toLowerCase().includes(term) ||
          event.userName.toLowerCase().includes(term) ||
          event.detail.toLowerCase().includes(term) ||
          event.action.toLowerCase().includes(term),
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const hours = parseInt(dateFilter);

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        const diffHours =
          (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
        return diffHours <= hours;
      });
    }

    return filtered.slice(0, maxItems);
  }, [systemEvents, eventTypeFilter, searchTerm, dateFilter, maxItems]);

  const eventStats = useMemo(() => {
    const stats = {
      total: systemEvents.length,
      today: systemEvents.filter((event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return (
          eventDate.getDate() === today.getDate() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
        );
      }).length,
      byType: {} as Record<string, number>,
    };

    systemEvents.forEach((event) => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    });

    return stats;
  }, [systemEvents]);

  const clearFilters = () => {
    setSearchTerm("");
    setEventTypeFilter("all");
    setDateFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    eventTypeFilter,
    setEventTypeFilter,
    dateFilter,
    setDateFilter,
    filteredEvents,
    eventStats,
    clearFilters,
    systemEvents,
  };
}

export const getEventIcon = (type: string) => {
  const icons = {
    lot: "Package",
    quality: "CheckCircle",
    stage: "Clock",
    user: "User",
    observation: "FileText",
    alert: "Bell",
  };
  return icons[type as keyof typeof icons] || "Package";
};

export const getEventColor = (type: string) => {
  const colors = {
    lot: "text-blue-500 bg-blue-500/10",
    quality: "text-green-500 bg-green-500/10",
    stage: "text-purple-500 bg-purple-500/10",
    user: "text-orange-500 bg-orange-500/10",
    observation: "text-yellow-500 bg-yellow-500/10",
    alert: "text-red-500 bg-red-500/10",
  };
  return colors[type as keyof typeof colors] || "text-gray-500 bg-gray-500/10";
};

export const getEventTypeLabel = (type: string) => {
  const labels = {
    lot: "Lote",
    quality: "Calidad",
    stage: "Etapa",
    user: "Usuario",
    observation: "Observación",
    alert: "Alerta",
  };
  return labels[type as keyof typeof labels] || type;
};

export const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `Hace ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `Hace ${Math.floor(diffHours)} horas`;
  } else {
    return format(date, "dd/MM/yyyy HH:mm", { locale: es });
  }
};

export const isImportantEvent = (event: SystemEvent) => {
  return (
    event.type === "alert" ||
    event.detail.toLowerCase().includes("rechazado") ||
    event.detail.toLowerCase().includes("error") ||
    event.detail.toLowerCase().includes("alerta") ||
    event.detail.toLowerCase().includes("crítico")
  );
};
