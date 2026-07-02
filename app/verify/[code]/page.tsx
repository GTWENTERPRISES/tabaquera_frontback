"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  User,
  Scale,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  Truck,
  Leaf,
  Building2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LOT_STATUS_CONFIG,
  STAGE_LABELS,
  PRODUCTION_STAGES,
  STAGES,
} from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { useLots } from "@/contexts/lot-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { LoteQR } from "@/components/lots/LoteQR";

export default function VerifyLotPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    getLotById,
    getQualityChecksByLotId,
    getMovementsByLotId,
    getProcessStagesByLotId,
    lots,
  } = useLots();
  const [lot, setLot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lotCode = params.code as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundLot = lots.find(
        (l) => l.codigo === lotCode || l.code === lotCode,
      );

      if (foundLot) {
        const lotQualityChecks = getQualityChecksByLotId(foundLot.id);
        const lotMovements = getMovementsByLotId(foundLot.id);
        setLot({
          ...foundLot,
          qualityChecks: lotQualityChecks,
          movements: lotMovements,
        });
      } else {
        setError("Lote no encontrado");
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [lotCode, lots, getQualityChecksByLotId, getMovementsByLotId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Inspección";
      case "passed":
        return "Aprobado";
      case "passed_with_notes":
        return "Aprobado con Observaciones";
      case "failed":
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Verificando lote...</p>
        </div>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lote No Encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            El código {lotCode} no corresponde a ningún lote registrado en
            nuestro sistema.
          </p>
          <Button onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const latestQualityCheck = lot.qualityChecks?.[0];
  const latestMovement = lot.movements?.[lot.movements.length - 1];
  const statusConfig = lot.estado
    ? LOT_STATUS_CONFIG[lot.estado as keyof typeof LOT_STATUS_CONFIG]
    : LOT_STATUS_CONFIG["reception"];
  const currentStageIndex = lot.estado
    ? PRODUCTION_STAGES.indexOf(
        lot.estado as (typeof PRODUCTION_STAGES)[number],
      )
    : -1;
  const progress =
    lot.estado === "completado"
      ? 100
      : lot.estado === "rechazado"
        ? 0
        : currentStageIndex >= 0
          ? ((currentStageIndex + 1) / PRODUCTION_STAGES.length) * 100
          : 0;

  // External user view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Golden Leaf
                </h1>
                <p className="text-sm text-muted-foreground">
                  Verificación de Lotes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">
                    Lote Verificado
                  </p>
                  <h2 className="text-3xl font-bold font-mono">
                    {lot.codigo || lot.code}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">QR verificado ✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Información del Lote
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lote</p>
                        <p className="text-xl font-bold font-mono">
                          {lot.codigo || lot.code}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                          <Truck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Estado
                          </p>
                          <p className="text-lg font-bold">
                            {STAGE_LABELS[
                              lot.currentStage as keyof typeof STAGE_LABELS
                            ] || statusConfig.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Fecha de Ingreso
                          </p>
                          <p className="text-lg font-bold">
                            {format(
                              new Date(lot.fechaIngreso || lot.entryDate),
                              "dd/MM/yyyy",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    {lot.lastUpdatedAt && (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Última Actualización
                          </p>
                          <p className="text-lg font-bold">
                            {format(new Date(lot.lastUpdatedAt), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8 pb-8">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Golden Leaf. Sistema de
                Trazabilidad de Tabaco.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Verificación pública. Para acceso completo, inicie sesión en el
                sistema.
              </p>
              <Button asChild className="mt-4 gap-2">
                <Link href="/login">
                  <ArrowRight className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated user view - full details
  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl font-mono">
                  {lot.codigo || lot.code}
                </h1>
                <Badge
                  className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Ingresado el{" "}
                {format(
                  new Date(lot.fechaIngreso || lot.entryDate),
                  "dd 'de' MMMM, yyyy",
                  {
                    locale: es,
                  },
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/dashboard/lotes/${lot.id}`}>
                <ArrowRight className="h-4 w-4" />
                Ver Detalle Completo
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  Progreso de Producción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Avance</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {PRODUCTION_STAGES.map((stage, index) => {
                    const isCompleted =
                      index < currentStageIndex || lot.estado === "completado";
                    const isCurrent =
                      index === currentStageIndex &&
                      lot.estado !== "completado" &&
                      lot.estado !== "rechazado";
                    const config =
                      LOT_STATUS_CONFIG[
                        stage as keyof typeof LOT_STATUS_CONFIG
                      ];

                    return (
                      <div
                        key={stage}
                        className="flex flex-col items-center text-center"
                      >
                        <div
                          className={`
                          flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                          ${
                            isCompleted
                              ? "border-green-500 bg-green-500 text-white"
                              : isCurrent
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-muted bg-muted text-muted-foreground"
                          }
                        `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : isCurrent ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <span className="text-xs font-medium">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <span className="mt-2 text-xs font-medium text-muted-foreground">
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  Información del Lote
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proveedor</p>
                      <p className="font-medium">
                        {lot.proveedor || lot.supplier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Scale className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peso</p>
                      <p className="font-medium">
                        {lot.peso || lot.currentWeight} kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Cantidad de bultos
                      </p>
                      <p className="font-medium">{lot.quantityBales}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Leaf className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tipo de tabaco
                      </p>
                      <p className="font-medium">{lot.variety}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fecha de Ingreso
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(lot.fechaIngreso || lot.entryDate),
                          "dd/MM/yyyy HH:mm",
                          { locale: es },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Responsable
                      </p>
                      <p className="font-medium">
                        {lot.responsable?.nombre || "-"}
                      </p>
                    </div>
                  </div>
                </div>
                {lot.observaciones && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Observaciones
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lot.observaciones}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="movements">Movimientos</TabsTrigger>
                <TabsTrigger value="quality">Calidad</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    {lot.stageHistory && lot.stageHistory.length > 0 ? (
                      <div className="space-y-6">
                        {lot.stageHistory.map((stage: any, index: number) => (
                          <div key={stage.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`
                                flex h-10 w-10 items-center justify-center rounded-full border-2 
                                ${
                                  !stage.endTime
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-green-500 bg-green-500 text-white"
                                }
                              `}
                              >
                                {index + 1}
                              </div>
                              {index < lot.stageHistory.length - 1 && (
                                <div className="flex-1 w-0.5 bg-border" />
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-foreground">
                                    {LOT_STATUS_CONFIG[
                                      stage.stage as keyof typeof LOT_STATUS_CONFIG
                                    ]?.label || stage.stage}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    {stage.responsibleUserName}
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    stage.endTime
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {stage.endTime ? "Completado" : "En curso"}
                                </Badge>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Inicio
                                  </p>
                                  <p className="font-medium">
                                    {format(
                                      new Date(stage.startTime),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: es },
                                    )}
                                  </p>
                                </div>
                                {stage.endTime && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Fin
                                    </p>
                                    <p className="font-medium">
                                      {format(
                                        new Date(stage.endTime),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: es },
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {stage.durationMinutes && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground">
                                    Duración
                                  </p>
                                  <p className="font-medium">
                                    {Math.floor(stage.durationMinutes / 60)}h{" "}
                                    {stage.durationMinutes % 60}m
                                  </p>
                                </div>
                              )}
                              {stage.observaciones && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Observaciones
                                  </p>
                                  <p className="text-sm">
                                    {stage.observaciones}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No hay timeline disponible
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="movements" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    {lot.movements && lot.movements.length > 0 ? (
                      <div className="space-y-4">
                        {lot.movements.map((movement: any) => (
                          <div
                            key={movement.id}
                            className="p-4 rounded-lg border"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {movement.description || movement.descripcion}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {movement.userName}
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-muted-foreground">
                                  {movement.date
                                    ? format(
                                        new Date(movement.date),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: es },
                                      )
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No hay movimientos registrados
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="quality" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    {lot.qualityChecks && lot.qualityChecks.length > 0 ? (
                      <div className="space-y-4">
                        {lot.qualityChecks.map((qc: any) => (
                          <div key={qc.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge
                                  className={
                                    qc.status === "passed"
                                      ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                                      : qc.status === "failed"
                                        ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                  }
                                >
                                  {qc.status === "passed"
                                    ? "Aprobado"
                                    : qc.status === "failed"
                                      ? "Rechazado"
                                      : "Pendiente"}
                                </Badge>
                                {qc.notes && (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {qc.notes}
                                  </p>
                                )}
                                {qc.stage && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Etapa: {qc.stage}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm">
                                <p className="font-medium">{qc.inspector}</p>
                                <p className="text-muted-foreground">
                                  {qc.date
                                    ? format(
                                        new Date(qc.date),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: es },
                                      )
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No hay controles de calidad registrados
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Código QR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoteQR lot={lot} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Etapas completadas
                  </span>
                  <span className="font-medium">
                    {lot.stageHistory?.filter((s: any) => s.endTime).length ||
                      0}
                    /{PRODUCTION_STAGES.length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Controles de calidad
                  </span>
                  <span className="font-medium">
                    {lot.qualityChecks?.length || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Movimientos registrados
                  </span>
                  <span className="font-medium">
                    {lot.movements?.length || 0}
                  </span>
                </div>
                {lot.stageHistory &&
                  lot.stageHistory.some((s: any) => s.durationMinutes) && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tiempo total
                        </span>
                        <span className="font-medium">
                          {Math.floor(
                            lot.stageHistory.reduce(
                              (acc: number, s: any) =>
                                acc + (s.durationMinutes || 0),
                              0,
                            ) / 60,
                          )}
                          h{" "}
                          {lot.stageHistory.reduce(
                            (acc: number, s: any) =>
                              acc + (s.durationMinutes || 0),
                            0,
                          ) % 60}
                          m
                        </span>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
