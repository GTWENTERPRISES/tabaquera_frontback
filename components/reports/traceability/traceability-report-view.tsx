"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTraceabilityReport } from "./use-traceability-report";
import BackButton from "@/components/BackButton";
import { LotSearchCard } from "./lot-search-card";
import { TimelineTab } from "./timeline-tab";
import { StagesTab } from "./stages-tab";
import { EventsTab } from "./events-tab";
import { EventFilterCard } from "./event-filter-card";

export function TraceabilityReportView() {
  const searchParams = useSearchParams();
  const {
    searchTerm,
    setSearchTerm,
    selectedLot,
    setSelectedLot,
    eventTypeFilter,
    setEventTypeFilter,
    searchResults,
    selectedLotData,
    filteredEvents,
    totalHours,
    totalMinutes,
    stageHistory,
    totalEvents,
    stageChanges,
    qualityChecks,
    lotObservations,
    handleExport,
    isMovement,
    isObservation,
    isSystemEvent,
  } = useTraceabilityReport();

  const [exporting, setExporting] = useState(false);

  // Set lot from URL parameter if present
  useEffect(() => {
    const lotId = searchParams.get("lot");
    if (lotId && lotId !== selectedLot) {
      setSelectedLot(lotId);
    }
  }, [searchParams, selectedLot, setSelectedLot]);

  return (
    <div className="space-y-6">
      <BackButton />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reporte de Trazabilidad
          </h1>
          <p className="text-muted-foreground">
            Auditoría completa de movimientos y seguimiento por lote
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setExporting(true); handleExport().finally(() => setExporting(false)); }}
            className="gap-2"
            disabled={!selectedLotData || exporting}
          >
            <FileText className="h-4 w-4" />
            {exporting ? "Generando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {/* Buscador de lotes */}
      <LotSearchCard
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLot={selectedLot}
        setSelectedLot={setSelectedLot}
        searchResults={searchResults}
        selectedLotData={selectedLotData}
        totalHours={totalHours}
        totalMinutes={totalMinutes}
        totalEvents={totalEvents}
      />

      {selectedLotData && (
        <>
          {/* Tabs para diferentes vistas */}
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
              <TabsTrigger value="stages">Etapas</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
            </TabsList>

            {/* Línea de tiempo */}
            <TabsContent value="timeline">
              <TimelineTab
                filteredEvents={filteredEvents}
                isMovement={isMovement}
                isObservation={isObservation}
                isSystemEvent={isSystemEvent}
              />
            </TabsContent>

            {/* Etapas */}
            <TabsContent value="stages">
              <StagesTab stageHistory={stageHistory} />
            </TabsContent>

            {/* Eventos */}
            <TabsContent value="events">
              <EventsTab
                stageChanges={stageChanges}
                qualityChecks={qualityChecks}
                lotObservations={lotObservations}
                totalEvents={totalEvents}
              />
            </TabsContent>
          </Tabs>

          {/* Filtros de eventos */}
          <EventFilterCard
            eventTypeFilter={eventTypeFilter}
            setEventTypeFilter={setEventTypeFilter}
          />
        </>
      )}
    </div>
  );
}
