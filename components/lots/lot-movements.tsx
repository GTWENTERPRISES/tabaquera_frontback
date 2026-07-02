"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRight, ClipboardCheck, MessageSquare, AlertCircle } from "lucide-react"
import type { Movement } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface LotMovementsProps {
  movements: Movement[]
}

const getMovementIcon = (tipo: string) => {
  switch (tipo) {
    case "etapa":
      return ArrowRight
    case "calidad":
      return ClipboardCheck
    case "observacion":
      return MessageSquare
    case "incidencia":
      return AlertCircle
    default:
      return ArrowRight
  }
}

const getMovementColor = (tipo: string) => {
  switch (tipo) {
    case "etapa":
      return "bg-blue-500/10 text-blue-500"
    case "calidad":
      return "bg-green-500/10 text-green-500"
    case "observacion":
      return "bg-amber-500/10 text-amber-500"
    case "incidencia":
      return "bg-red-500/10 text-red-500"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function LotMovements({ movements }: LotMovementsProps) {
  if (movements.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay movimientos registrados
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {movements.slice(0, 15).map((movement, index) => {
        const Icon = getMovementIcon(movement.tipo || "etapa")
        const colorClass = getMovementColor(movement.tipo || "etapa")

        return (
          <motion.div
            key={movement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{movement.descripcion || movement.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {movement.usuario && (
                  <>
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-muted">
                        {(movement.usuario.nombre || movement.userName || "U").split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{movement.usuario.nombre || movement.userName}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">
                  {movement.fecha ? formatDistanceToNow(movement.fecha, { addSuffix: true, locale: es }) : ""}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
