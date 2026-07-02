"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/notification-context";
import type { Notification, NotificationCategory } from "@/lib/types";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const router = useRouter();

  const getTypeIcon = () => {
    switch (notification.type) {
      case "critical":
        return "🔴";
      case "warning":
        return "🟡";
      default:
        return "🔵";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (hours > 0) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    if (minutes > 0) return `Hace ${minutes} ${minutes === 1 ? "min" : "mins"}`;
    return "Ahora";
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case "lot":
        return "Producción";
      case "quality":
        return "Calidad";
      case "user":
        return "Usuarios";
      case "alert":
        return "Alertas";
      case "production":
        return "Producción";
      case "admin":
        return "Administración";
    }
  };

  const handleClick = () => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div
      className={`flex gap-4 p-4 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors border-b ${
        !notification.isRead ? "bg-muted/30" : ""
      }`}
      onClick={handleClick}
    >
      <div className="text-2xl shrink-0 mt-1">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold">{notification.title}</h4>
              <Badge variant="secondary" className="text-xs">
                {getCategoryLabel(notification.category)}
              </Badge>
              {!notification.isRead && (
                <Badge variant="default" className="text-xs">
                  No leída
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
          {notification.actionUrl && (
            <Button variant="ghost" size="sm" className="text-xs h-7">
              Ver detalle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
