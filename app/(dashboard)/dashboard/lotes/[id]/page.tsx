import { LoteDetalleView } from "@/components/lots/lote-detalle-view"

export default function LoteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  return <LoteDetalleView params={params} />
}
