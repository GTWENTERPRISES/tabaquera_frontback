"use client";

import { useState, useMemo } from "react";
import { useNotifications as useNotificationsContext } from "@/contexts/notification-context";

type FilterType =
  | "all"
  | "unread"
  | "critical"
  | "production"
  | "quality"
  | "admin"
  | "today"
  | "this_week";

export function useNotificaciones() {
  const { notifications } = useNotificationsContext();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (activeFilter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (activeFilter === "critical") {
      filtered = filtered.filter((n) => n.type === "critical");
    } else if (activeFilter === "production") {
      filtered = filtered.filter(
        (n) => n.category === "production" || n.category === "lot",
      );
    } else if (activeFilter === "quality") {
      filtered = filtered.filter((n) => n.category === "quality");
    } else if (activeFilter === "admin") {
      filtered = filtered.filter(
        (n) => n.category === "admin" || n.category === "user",
      );
    } else if (activeFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (n) => new Date(n.createdAt).toDateString() === today,
      );
    } else if (activeFilter === "this_week") {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((n) => new Date(n.createdAt) >= weekAgo);
    }

    return filtered;
  }, [notifications, activeFilter]);

  return {
    activeFilter,
    setActiveFilter,
    filteredNotifications,
  };
}
