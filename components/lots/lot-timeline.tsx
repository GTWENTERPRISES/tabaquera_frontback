"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, Clock, User } from "lucide-react"
import type { ProcessStage } from "@/lib/types"
import { LOT_STATUS_CONFIG } from "@/lib/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface LotTimelineProps {
  stages: ProcessStage[]
}

export function LotTimeline({ stages }: LotTimelineProps) {
  if (stages.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay etapas registradas para este lote
      </p>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const config = LOT_STATUS_CONFIG[stage.etapa]
          const isCompleted = !!stage.fechaFin
          const duration = stage.duracion 
            ? stage.duracion >= 60 
              ? `${Math.floor(stage.duracion / 60)}h ${stage.duracion % 60}m`
              : `${stage.duracion}m`
            : null

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 pl-12"
            >
              {/* Icon */}
              <div className={`
                absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background
                ${isCompleted 
                  ? "border-green-500 text-green-500" 
                  : "border-primary text-primary"
                }
              `}>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-semibold ${config.color}`}>
                        {config.label}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Inicio: {format(new Date(stage.fechaInicio), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                      {stage.fechaFin && (
                        <p className="text-sm text-muted-foreground">
                          Fin: {format(new Date(stage.fechaFin), "dd MMM yyyy, HH:mm", { locale: es })}
                        </p>
                      )}
                    </div>
                    {duration && (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          {duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {stage.usuario && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {stage.usuario.nombre.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{stage.usuario.nombre}</span>
                    </div>
                  )}

                  {stage.observaciones && (
                    <p className="mt-2 text-sm text-muted-foreground border-t pt-3">
                      {stage.observaciones}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
