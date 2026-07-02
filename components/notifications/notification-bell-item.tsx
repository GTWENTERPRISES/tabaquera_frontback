"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/notification-context";
import type { Notification } from "@/lib/types";

interface NotificationBellItemProps {
  notification: Notification;
}

export function NotificationBellItem({
  notification,
}: NotificationBellItemProps) {
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

  const getTimeAgo = () => {
    const now = new Date();
    const created = new Date(notification.createdAt);
    const diff = now.getTime() - created.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} ${days === 1 ? "día" : "días"}`;
    if (hours > 0) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    if (minutes > 0) return `Hace ${minutes} ${minutes === 1 ? "min" : "mins"}`;
    return "Ahora";
  };

  const handleClick = () => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors ${
        !notification.isRead ? "bg-muted/30 border-l-2 border-primary" : ""
      }`}
      onClick={handleClick}
    >
      <div className="text-xl shrink-0 mt-0.5">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{getTimeAgo()}</p>
          {!notification.isRead && (
            <Badge
              variant="secondary"
              className="h-1.5 w-1.5 rounded-full p-0"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
