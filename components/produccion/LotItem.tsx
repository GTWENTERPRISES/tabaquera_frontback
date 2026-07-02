import { motion } from "framer-motion";
import { Package, User, Clock, ArrowRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLiveStageTime } from "./hooks";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface LotItemProps {
  lot: Lot;
  index: number;
  isSupervisorOrAdmin: boolean;
  isCalidad: boolean;
  onProcess: (lot: Lot) => void;
  onReassign: (lot: Lot) => void;
}

export function LotItem({
  lot,
  index,
  isSupervisorOrAdmin,
  isCalidad,
  onProcess,
  onReassign,
}: LotItemProps) {
  const liveTime = useLiveStageTime(lot);
  return (
    <motion.div
      key={lot.id}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <p className="font-mono font-bold text-lg">
                    {lot.codigo || lot.code}
                  </p>
                  <Badge className={STAGE_COLORS[lot.currentStage as Stage]}>
                    {STAGE_LABELS[lot.currentStage as Stage]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{lot.responsable?.nombre || "Sin asignar"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Tiempo: {liveTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSupervisorOrAdmin && !isCalidad && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReassign(lot);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reasignar lote</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!isCalidad && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => onProcess(lot)}
                >
                  Procesar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {isCalidad && (
                <Button variant="outline" className="gap-2" disabled>
                  Ver
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
