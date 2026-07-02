import { ProcesoDetalleView } from "@/components/procesos/proceso-detalle-view"
import * as React from "react"

export default function ProcesoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  return <ProcesoDetalleView id={id} />
}
