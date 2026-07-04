"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Package, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLots } from "@/contexts/lot-context";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STAGE_LABELS } from "@/lib/constants";
import { scrollPositions } from "@/components/ScrollRestoration";

export function CriticalLots() {
  const { lots } = useLots();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  // Lotes retrasados: en producción y sin cambios en más de 24h
  const delayedLots = lots
    .filter((lot) => {
      const isActive =
        lot.status === "in_production" ||
        lot.status === "active" ||
        lot.status === "waiting";
      if (!isActive) return false;
      const lastUpdate = new Date(lot.lastUpdatedAt || lot.fechaIngreso || Date.now());
      const hours = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return hours > 24;
    })
    .map((lot) => {
      const lastUpdate = new Date(lot.lastUpdatedAt || lot.fechaIngreso || Date.now());
      const hours = Math.round((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60));
      return { ...lot, hours };
    });

  const handleViewLot = (lotId: string) => {
    // Save scroll position before navigating
    scrollPositions.set(currentUrl, window.scrollY);
    router.push(`/dashboard/lotes/${lotId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Lotes con Retraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {delayedLots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No hay lotes retrasados
            </p>
          ) : (
            <div className="space-y-3">
              {delayedLots.slice(0, 5).map((lot) => (
                <div
                  key={lot.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                      <Package className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{lot.codigo || lot.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {STAGE_LABELS[lot.currentStage || "reception"]}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                    <div className="text-right">
                      <p className="font-medium text-red-600 dark:text-red-400">
                        {lot.hours}h
                      </p>
                      <p className="text-xs text-muted-foreground">En etapa</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewLot(lot.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
