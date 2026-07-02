"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_LABELS } from "@/lib/constants";
import type { Lot } from "@/lib/types";

interface TraceabilityLotSelectorProps {
  lots: Lot[];
  selectedLotId: string | null;
  setSelectedLotId: (id: string | null) => void;
}

export function TraceabilityLotSelector({
  lots,
  selectedLotId,
  setSelectedLotId,
}: TraceabilityLotSelectorProps) {
  return (
    <Card className="border-0 shadow-sm lg:col-span-1">
      <CardHeader>
        <CardTitle>Seleccionar Lote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lots.map((lot) => (
          <button
            key={lot.id}
            onClick={() => setSelectedLotId(lot.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedLotId === lot.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-medium">
                {lot.code || lot.codigo}
              </span>
              {selectedLotId === lot.id && (
                <ArrowRight className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {STAGE_LABELS[lot.currentStage as keyof typeof STAGE_LABELS] || lot.currentStage}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
