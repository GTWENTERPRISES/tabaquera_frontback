"use client";

import { motion } from "framer-motion";
import { History, FileText, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Movement, Observation, SystemEvent } from "@/lib/types";

interface TimelineTabProps {
  filteredEvents: (Movement | Observation | SystemEvent)[];
  isMovement: (e: any) => e is Movement;
  isObservation: (e: any) => e is Observation;
  isSystemEvent: (e: any) => e is SystemEvent;
}

export function TimelineTab({
  filteredEvents,
  isMovement,
  isObservation,
  isSystemEvent,
}: TimelineTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Línea de Tiempo del Lote</CardTitle>
        <CardDescription>
          Secuencia completa de movimientos y eventos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={`event-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isMovement(event) && event.type === "stage_change" ? (
                  <History className="h-5 w-5 text-primary" />
                ) : isMovement(event) && event.type === "quality_check" ? (
                  <FileText className="h-5 w-5 text-green-500" />
                ) : isObservation(event) ? (
                  <FileText className="h-5 w-5 text-orange-500" />
                ) : (
                  <History className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    {isMovement(event)
                      ? event.type === "stage_change"
                        ? "Cambio de Etapa"
                        : event.type === "quality_check"
                          ? "Control de Calidad"
                          : event.type
                      : isObservation(event)
                        ? "Observación"
                        : "Evento del Sistema"}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {(() => {
                      if (
                        isMovement(event) ||
                        isObservation(event) ||
                        isSystemEvent(event)
                      ) {
                        return new Date(event.date).toLocaleString();
                      }
                      return "";
                    })()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(() => {
                    if (isMovement(event)) {
                      return event.description || event.descripcion;
                    }
                    if (isObservation(event)) {
                      return event.text;
                    }
                    if (isSystemEvent(event)) {
                      return event.detail;
                    }
                    return "";
                  })()}
                </p>
                {"userName" in event && (
                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {event.userName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
