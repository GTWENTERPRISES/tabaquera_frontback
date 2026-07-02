"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Laptop, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Sesion } from "@/services/api";

interface SessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: Sesion[];
  onTerminateSession: (sessionId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const getDeviceIcon = (device: string) => {
  const lowerDevice = device.toLowerCase();
  if (lowerDevice.includes("smartphone") || lowerDevice.includes("phone")) {
    return Smartphone;
  }
  if (lowerDevice.includes("laptop")) {
    return Laptop;
  }
  return Monitor;
};

export function SessionsDialog({
  open,
  onOpenChange,
  sessions,
  onTerminateSession,
}: SessionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sesiones Activas</DialogTitle>
          <DialogDescription>
            Aquí puedes ver y revocar tus sesiones en diferentes dispositivos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.dispositivo);
            return (
              <Card
                key={session.id}
                className={session.es_actual ? "border-primary" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {session.navegador} - {session.dispositivo}
                          </p>
                          {session.es_actual && (
                            <Badge variant="default" className="shrink-0">
                              Actual
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {session.ubicacion || "Ubicación desconocida"} • {session.ip}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Última actividad:{" "}
                          {format(
                            new Date(session.ultima_actividad),
                            "dd/MM/yyyy HH:mm",
                            { locale: es },
                          )}
                        </p>
                      </div>
                    </div>
                    {!session.es_actual && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onTerminateSession(session.id)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
