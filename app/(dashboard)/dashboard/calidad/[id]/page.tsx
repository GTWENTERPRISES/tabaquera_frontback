import { CalidadDetalleView } from "@/components/calidad/calidad-detalle-view"
import * as React from "react"

export default function CalidadDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  return <CalidadDetalleView id={id} />
}
