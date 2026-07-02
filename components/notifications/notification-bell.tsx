"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/notification-context";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NotificationCategory } from "@/lib/types";
import { NotificationBellItem } from "./notification-bell-item";

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, filterNotifications } =
    useNotifications();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | NotificationCategory
  >("all");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredNotifications = (() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return filterNotifications(undefined, true);
    return filterNotifications(activeFilter, false);
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          ref={buttonRef}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-1 text-[10px] rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("unread")}>
                    No leídas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveFilter("production")}
                  >
                    Producción
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("quality")}>
                    Calidad
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("admin")}>
                    Administración
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("user")}>
                    Usuarios
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("alert")}>
                    Alertas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllAsRead}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>
          </div>
        </div>
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay notificaciones
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotifications.map((notification) => (
                <NotificationBellItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/notificaciones");
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
