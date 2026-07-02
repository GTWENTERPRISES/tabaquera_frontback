"use client";

import { motion } from "framer-motion";
import { ScanLine, Package, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLots } from "@/contexts/lot-context";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { scrollPositions } from "@/components/ScrollRestoration";

export function PendingInspections() {
  const { lots, qualityChecks } = useLots();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const pending = qualityChecks.filter((qc) => qc.status === "pending");

  const handleInspect = () => {
    // Save scroll position before navigating
    scrollPositions.set(currentUrl, window.scrollY);
    router.push("/dashboard/calidad");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-orange-500" />
            Pendientes de Calidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No hay inspecciones pendientes
            </p>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 5).map((qc) => {
                const lot = lots.find((l) => l.id === qc.lotId);
                return (
                  <div
                    key={qc.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                        <Package className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {lot?.codigo || lot?.code || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {qc.stage || "Sin etapa"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleInspect}
                    >
                      Inspeccionar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
