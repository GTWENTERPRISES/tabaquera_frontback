"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Package,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLots } from "@/contexts/lot-context";
import type { SystemEvent } from "@/lib/types";

const getEventIcon = (type: SystemEvent["type"]) => {
  switch (type) {
    case "lot":
      return Package;
    case "quality":
      return CheckCircle;
    case "stage":
      return ArrowRight;
    case "observation":
      return MessageSquare;
    case "user":
      return User;
    case "alert":
      return AlertTriangle;
    default:
      return Package;
  }
};

const getEventColor = (type: SystemEvent["type"]) => {
  switch (type) {
    case "lot":
      return "bg-blue-500/10 text-blue-500";
    case "quality":
      return "bg-green-500/10 text-green-500";
    case "stage":
      return "bg-primary/10 text-primary";
    case "observation":
      return "bg-purple-500/10 text-purple-500";
    case "user":
      return "bg-chart-2/10 text-chart-2";
    case "alert":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getEventLabel = (type: SystemEvent["type"]) => {
  switch (type) {
    case "lot":
      return "Lote";
    case "quality":
      return "Calidad";
    case "stage":
      return "Etapa";
    case "observation":
      return "Observación";
    case "user":
      return "Usuario";
    case "alert":
      return "Alerta";
    default:
      return "Evento";
  }
};

export function SystemActivity() {
  const { systemEvents } = useLots();

  const recent = [...systemEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-0 shadow-sm h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Actividad del Sistema
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {systemEvents.length} eventos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[360px] px-6">
            <div className="space-y-4 pb-4">
              {recent.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Sin actividad registrada
                </p>
              )}
              {recent.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const colorClass = getEventColor(event.type);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.lotCode && (
                          <span className="font-mono text-xs font-semibold text-primary">
                            {event.lotCode}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                        >
                          {getEventLabel(event.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground leading-tight">
                        {event.detail}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] bg-muted">
                            {event.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{event.userName}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(event.date), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
