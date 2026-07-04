"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";
import { api } from "@/services/api";
import {
  STAGE_COLORS,
  STAGE_LABELS,
  LOT_STATUS_CONFIG,
  QUALITY_STATUS_CONFIG,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotMovements } from "@/components/lots/lot-movements";
import { LotTimeline } from "@/components/lots/lot-timeline";
import { useLots } from "@/contexts/lot-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Trazabilidad } from "@/services/api";

interface TraceabilityViewProps {
  lotId: string;
}

export function TraceabilityView({ lotId }: TraceabilityViewProps) {
  const { getLotById } = useLots();
  const lot = getLotById(lotId);
  const [trazabilidad, setTrazabilidad] = useState<Trazabilidad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrazabilidad = async () => {
      try {
        setLoading(true);
        const data = await api.getTrazabilidad(parseInt(lotId));
        setTrazabilidad(data);
      } catch (error) {
        console.error('Error cargando trazabilidad:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lotId) {
      loadTrazabilidad();
    }
  }, [lotId]);

  if (loading) {
    return <div className="p-6">Cargando trazabilidad...</div>;
  }

  if (!lot || !trazabilidad) {
    return <div className="p-6">No se encontró información del lote</div>;
  }

  const movements = trazabilidad.timeline.filter(item => item.tipo === 'movimiento');
  const inspecciones = trazabilidad.timeline.filter(item => item.tipo === 'inspeccion');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="grid gap-4 p-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lote</p>
                <p className="font-mono font-semibold">{lot.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-2/10">
                <Leaf className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Etapa actual</p>
                <Badge
                  variant="outline"
                  className={STAGE_COLORS[lot.currentStage]}
                >
                  {STAGE_LABELS[lot.currentStage]}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origen</p>
                <p className="font-medium">{lot.origin}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsable</p>
                <p className="font-medium">{lot.responsable?.nombre || 'Sin asignar'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Tiempo total (min)
              </p>
              <p className="text-xl font-semibold">{trazabilidad.tiempo_total_minutos}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <ShieldCheck className="h-5 w-5 text-chart-2" />
            <div>
              <p className="text-sm text-muted-foreground">Inspecciones</p>
              <p className="text-xl font-semibold">{inspecciones.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <Package className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Movimientos</p>
              <p className="text-xl font-semibold">{movements.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:w-[420px]">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="movements">Auditoria</TabsTrigger>
          <TabsTrigger value="quality">Calidad</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recorrido del lote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trazabilidad.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${item.tipo === 'inspeccion' ? 'bg-chart-2' : 'bg-primary'}`} />
                      {index < trazabilidad.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                      {item.descripcion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.descripcion}
                        </p>
                      )}
                      {item.usuario && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Por: {item.usuario}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Movimientos auditados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.map((mov, index) => (
                  <div key={index} className="rounded-xl border p-4">
                    <p className="font-medium">{mov.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(mov.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                    {mov.etapa_origen && mov.etapa_destino && (
                      <p className="text-sm text-muted-foreground mt-1">
                        De: {mov.etapa_origen} → A: {mov.etapa_destino}
                      </p>
                    )}
                    {mov.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {mov.descripcion}
                      </p>
                    )}
                  </div>
                ))}
                {movements.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No hay movimientos registrados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Controles de calidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inspecciones.map((insp, index) => (
                <div key={index} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{insp.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {insp.usuario} •{" "}
                        {format(new Date(insp.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                      {insp.descripcion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {insp.descripcion}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-chart-2">
                      {insp.datos?.estado_calidad || 'Inspeccionado'}
                    </Badge>
                  </div>
                </div>
              ))}
              {inspecciones.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No hay controles de calidad registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
