"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Package, CheckCircle, ArrowRight, User, AlertTriangle, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useLots } from "@/contexts/lot-context"
import { STAGE_LABELS } from "@/lib/constants"
import type { Movement } from "@/lib/types"

const getMovementIcon = (type: Movement["type"]) => {
  switch (type) {
    case "stage_change":
      return ArrowRight
    case "quality_check":
      return CheckCircle
    case "observation":
      return Activity
    case "incident":
      return AlertTriangle
    default:
      return Package
  }
}

const getMovementColor = (type: Movement["type"]) => {
  switch (type) {
    case "stage_change":
      return "bg-blue-500/10 text-blue-500"
    case "quality_check":
      return "bg-green-500/10 text-green-500"
    case "observation":
      return "bg-purple-500/10 text-purple-500"
    case "incident":
      return "bg-red-500/10 text-red-500"
    default:
      return "bg-gray-500/10 text-gray-500"
  }
}

const getMovementLabel = (type: Movement["type"]) => {
  switch (type) {
    case "stage_change": return "Cambio etapa"
    case "quality_check": return "Calidad"
    case "observation": return "Observación"
    case "incident": return "Incidencia"
    default: return "Evento"
  }
}

export function ActivityFeed() {
  const { movements, lots } = useLots()

  // Sort movements by date descending, take last 15
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)

  const getLotCode = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId)
    return lot?.codigo || lot?.code || lotId
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-0 shadow-sm h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            <Badge variant="secondary" className="text-xs">{movements.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[320px] px-6">
            <div className="space-y-4 pb-4">
              {recentMovements.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Sin actividad reciente</p>
              )}
              {recentMovements.map((movement, index) => {
                const Icon = getMovementIcon(movement.type)
                const colorClass = getMovementColor(movement.type)
                const lotCode = getLotCode(movement.lotId)

                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex items-start gap-3"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-primary">{lotCode}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">{getMovementLabel(movement.type)}</Badge>
                      </div>
                      <p className="text-sm text-foreground leading-tight">{movement.description || movement.descripcion}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] bg-muted">
                            {(movement.userName || movement.usuario?.nombre || "S").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{movement.userName || movement.usuario?.nombre || "Sistema"}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(movement.date), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}
