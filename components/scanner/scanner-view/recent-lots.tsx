"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";

interface RecentLotsProps {
  lots: Lot[];
  onSelectLot: (lot: Lot) => void;
}

export function RecentLots({ lots, onSelectLot }: RecentLotsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Lotes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lots.slice(0, 4).map((lot) => (
              <motion.button
                key={lot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectLot(lot)}
                className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium">
                    {lot.codigo || lot.code}
                  </p>
                  {lot.estado && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${LOT_STATUS_CONFIG[lot.estado as keyof typeof LOT_STATUS_CONFIG]?.bgColor || ""} ${LOT_STATUS_CONFIG[lot.estado as keyof typeof LOT_STATUS_CONFIG]?.color || ""}`}
                    >
                      {LOT_STATUS_CONFIG[
                        lot.estado as keyof typeof LOT_STATUS_CONFIG
                      ]?.label || lot.estado}
                    </Badge>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
