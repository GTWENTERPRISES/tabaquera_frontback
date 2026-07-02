"use client";

import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TraceabilityView } from "@/components/traceability/traceability-view";
import * as React from "react";

interface TrazabilidadDetallePageProps {
  params: Promise<{ id: string }>;
}

export default function TrazabilidadDetallePage({
  params,
}: TrazabilidadDetallePageProps) {
  const { id } = React.use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/trazabilidad">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Trazabilidad del Lote
          </h1>
          <p className="text-muted-foreground">
            Auditoria completa de etapas, calidad y movimientos
          </p>
        </div>
      </div>

      <TraceabilityView lotId={id} />
    </div>
  );
}
