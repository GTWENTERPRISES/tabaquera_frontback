"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDelayAlerts } from "./use-delay-alerts";
import { DelayAlertStats } from "./delay-alert-stats";
import { DelayAlertItem } from "./delay-alert-item";
import { DelayAlertCriticalRecommendation } from "./delay-alert-critical-recommendation";

export function DelayDetectionAlerts() {
  const {
    showAcknowledged,
    setShowAcknowledged,
    acknowledgingIds,
    successIds,
    acknowledgeAlert,
    filteredAlerts,
    alertStats,
  } = useDelayAlerts();

  return (
    <Card>
      <DelayAlertStats
        alertStats={alertStats}
        showAcknowledged={showAcknowledged}
        setShowAcknowledged={setShowAcknowledged}
      />
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No hay alertas activas</p>
                <p className="text-sm">
                  El sistema está funcionando normalmente
                </p>
              </motion.div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <DelayAlertItem
                  key={alert.id}
                  alert={alert}
                  index={index}
                  isAcknowledging={acknowledgingIds.includes(alert.id)}
                  showSuccess={successIds.includes(alert.id)}
                  onAcknowledge={acknowledgeAlert}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {alertStats.critical > 0 && (
          <DelayAlertCriticalRecommendation
            criticalCount={alertStats.critical}
          />
        )}
      </CardContent>
    </Card>
  );
}
