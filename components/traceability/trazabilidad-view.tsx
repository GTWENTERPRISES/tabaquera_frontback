"use client";

import { AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  Package,
  Leaf,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useTrazabilidadView } from "./trazabilidad-view/use-trazabilidad-view";
import { LotItem } from "./trazabilidad-view/lot-item";
import { TimelineStep } from "./trazabilidad-view/timeline-step";
import { ProgressStats } from "./trazabilidad-view/progress-stats";

export function TrazabilidadView() {
  const {
    searchTerm,
    setSearchTerm,
    selectedLot,
    exporting,
    mobileView,
    setMobileView,
    filteredLots,
    selectedLotData,
    handleSelectLot,
    handleExportPDF,
  } = useTrazabilidadView();

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Trazabilidad
          </h1>
          <p className="text-sm text-muted-foreground">
            Seguimiento completo del recorrido de cada lote
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={!selectedLotData || exporting}
          className="self-start sm:self-auto"
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {exporting ? "Exportando…" : "Exportar Reporte"}
        </Button>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* ── Lot list — hidden on mobile when showing detail ── */}
        <div
          className={`lg:col-span-1 ${mobileView === "detail" ? "hidden lg:block" : "block"}`}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Seleccionar Lote
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Busque y seleccione un lote para ver su trazabilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código u origen…"
                  className="pl-9 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[380px] sm:max-h-[480px] overflow-y-auto overflow-x-hidden pr-1 -mr-1">
                <AnimatePresence>
                  {filteredLots.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 opacity-40" />
                      <p className="text-sm">Sin resultados</p>
                    </div>
                  ) : (
                    filteredLots.map((lot) => (
                      <LotItem
                        key={lot.id}
                        lot={lot}
                        selected={selectedLot === lot.id}
                        onClick={() => handleSelectLot(lot.id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Timeline / detail — hidden on mobile when showing list ── */}
        <div
          className={`lg:col-span-2 ${mobileView === "list" ? "hidden lg:block" : "block"}`}
        >
          <Card className="h-full">
            {/* Mobile back button */}
            <div className="flex items-center gap-2 px-4 pt-4 lg:hidden">
              <button
                onClick={() => setMobileView("list")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver a la lista
              </button>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Línea de Tiempo de Trazabilidad
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {selectedLotData
                  ? `Recorrido completo del lote ${selectedLotData.codigo ?? selectedLotData.code}`
                  : "Seleccione un lote para ver su trazabilidad"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {selectedLotData ? (
                <div className="space-y-5">
                  {/* Lot header card */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-muted/40 border border-border">
                    <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Leaf className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                        {selectedLotData.codigo ?? selectedLotData.code}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {selectedLotData.variety} | {selectedLotData.origin}
                      </p>
                    </div>
                    <Link href={`/dashboard/lotes/${selectedLotData.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Ver Detalle</span>
                        <span className="sm:hidden">Detalle</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Timeline */}
                  <div className="relative pt-1">
                    {selectedLotData.movements?.length > 0 ? (
                      selectedLotData.movements.map(
                        (movement: any, index: number) => (
                          <TimelineStep
                            key={movement.id ?? index}
                            movement={movement}
                            index={index}
                            isLast={
                              index === selectedLotData.movements.length - 1
                            }
                          />
                        ),
                      )
                    ) : (
                      <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 opacity-40" />
                        <p className="text-sm">Sin movimientos registrados</p>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <ProgressStats currentStage={selectedLotData.currentStage} />
                </div>
              ) : (
                /* Empty state — only shown on desktop (mobile hides this panel when no lot selected) */
                <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center gap-3">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm sm:text-base">
                      Ningún lote seleccionado
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[240px]">
                      Seleccione un lote de la lista para ver su trazabilidad
                      completa
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
