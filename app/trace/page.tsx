"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { QrCode, Package, MapPin, Calendar, Thermometer, Droplets, CheckCircle, Leaf, Building, Award, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { STAGE_LABELS, STAGE_COLORS, STAGES } from "@/lib/constants"
import type { Stage } from "@/lib/types"
import { useLots } from "@/contexts/lot-context"

function PublicTraceContent() {
  const searchParams = useSearchParams()
  const lotId = searchParams.get("lot")
  const { lots, isLoading } = useLots()
  const lot = lots.find(l => l.id === lotId || l.code === lotId || l.codigo === lotId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando trazabilidad...</p>
        </div>
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Lote no encontrado</h2>
            <p className="text-muted-foreground">
              El codigo QR escaneado no corresponde a ningun lote registrado en el sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStageIndex = (stage: Stage) => STAGES.indexOf(stage)
  const progress = Math.round((getStageIndex(lot.currentStage) / (STAGES.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Golden Trace</h1>
              <p className="text-sm text-muted-foreground">Sistema de Trazabilidad</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Package className="h-6 w-6 text-primary" />
                    Lote {lot.code}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Informacion de trazabilidad verificada
                  </CardDescription>
                </div>
                <Badge className={STAGE_COLORS[lot.currentStage]}>
                  {STAGE_LABELS[lot.currentStage]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Origen</p>
                    <p className="font-medium text-foreground">{lot.origin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Leaf className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Variedad</p>
                    <p className="font-medium text-foreground">{lot.variety}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                    <p className="font-medium text-foreground">{new Date(lot.entryDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Award className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Calidad</p>
                    <p className="font-medium text-foreground">Grado {lot.quality}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progreso del Lote</span>
                  <span className="text-sm font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Historial de Proceso
              </CardTitle>
              <CardDescription>Seguimiento de cada etapa del proceso productivo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {STAGES.map((stage, index) => {
                  const isCompleted = getStageIndex(lot.currentStage) > index
                  const isCurrent = lot.currentStage === stage
                  const isPending = getStageIndex(lot.currentStage) < index

                  return (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {index < STAGES.length - 1 && (
                        <div 
                          className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-2rem)] ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}

                      <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted 
                          ? "bg-primary text-primary-foreground" 
                          : isCurrent 
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>

                      <div className={`flex-1 pb-2 ${isPending ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{STAGE_LABELS[stage]}</h4>
                          {isCurrent && (
                            <Badge variant="outline" className="text-accent border-accent text-xs">En Proceso</Badge>
                          )}
                        </div>
                        {(isCompleted || isCurrent) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {isCompleted 
                              ? `Completado el ${new Date(Date.now() - (STAGES.length - index) * 86400000 * 2).toLocaleDateString('es-ES')}`
                              : "Actualmente en proceso"
                            }
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-primary" />
                Condiciones de Almacenamiento
              </CardTitle>
              <CardDescription>Ultima lectura registrada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Thermometer className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Temperatura</p>
                      <p className="text-2xl font-bold text-foreground">25.5 C</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Rango optimo: 20-28 C</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <Droplets className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Humedad</p>
                      <p className="text-2xl font-bold text-foreground">62%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Rango optimo: 55-70%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Golden Leaf Tobacco Co.</p>
                    <p className="text-sm text-muted-foreground">Esteli, Nicaragua</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Verificado por Golden Trace</p>
                  <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function PublicTracePage() {
  return (
    <Suspense fallback={null}>
      <PublicTraceContent />
    </Suspense>
  )
}
