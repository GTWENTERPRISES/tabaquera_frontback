"use client";

import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";

interface RecentLotsProps {
  lots: Lot[];
  setSelectedLotId: (id: string) => void;
}

export function RecentLots({ lots, setSelectedLotId }: RecentLotsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Lotes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lots.slice(0, 8).map((lot) => (
              <motion.button
                key={lot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedLotId(lot.id)}
                className="flex items-center gap-3 p-3 rounded-lg border transition-colors text-left hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted shrink-0">
                  <QrCode className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium truncate">{lot.codigo || lot.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{lot.proveedor || lot.supplier}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
