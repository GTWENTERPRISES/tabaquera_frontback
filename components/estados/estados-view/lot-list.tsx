"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import type { Lot } from "@/lib/types";
import { LotDetailDialog } from "./lot-detail-dialog";

// Helper para obtener tiempo en etapa actual
const getTimeInCurrentStage = (lot: Lot) => {
  const currentMovement = lot.movements?.find(
    (m: any) => m.toStage === lot.currentStage && !m.completedAt,
  );
  if (!currentMovement?.startedAt) return null;

  const startDate = new Date(currentMovement.startedAt);
  const endDate = new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
  return `${diffHours}h`;
};

interface LotListProps {
  lots: Lot[];
  selectedLot: Lot | null;
  setSelectedLot: (lot: Lot | null) => void;
}

export function LotList({ lots, selectedLot, setSelectedLot }: LotListProps) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {lots.map((lot, index) => {
          const timeInStage = getTimeInCurrentStage(lot);

          return (
            <motion.div
              key={lot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg font-mono">
                            {lot.codigo || lot.code}
                          </h3>
                          <Badge className={STAGE_COLORS[lot.currentStage]}>
                            {STAGE_LABELS[lot.currentStage]}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {lot.variety} • {lot.origin} • {lot.quantityBales}{" "}
                          bultos
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Tiempo en etapa: {timeInStage || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Dialog
                      open={openDialog && selectedLot?.id === lot.id}
                      onOpenChange={(open) => {
                        setOpenDialog(open);
                        if (!open) setSelectedLot(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSelectedLot(lot);
                            setOpenDialog(true);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col mt-8">
                        <DialogHeader>
                          <DialogTitle className="text-xl">
                            {lot.codigo || lot.code || "Detalle del Lote"}
                          </DialogTitle>
                          <DialogDescription>
                            Historial completo del lote
                          </DialogDescription>
                        </DialogHeader>
                        {selectedLot && selectedLot.id === lot.id && (
                          <div className="flex-1 overflow-y-auto">
                            <LotDetailDialog lot={selectedLot} />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
