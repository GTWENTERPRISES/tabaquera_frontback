import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DelayAlertCriticalRecommendationProps {
  criticalCount: number;
}

export function DelayAlertCriticalRecommendation({
  criticalCount,
}: DelayAlertCriticalRecommendationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-lg bg-red-500/5 border border-red-500/20"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-500 mb-1">
            Acción requerida: {criticalCount} alerta(s) crítica(s)
          </h4>
          <p className="text-sm text-muted-foreground">
            Se recomienda revisar inmediatamente los lotes con alertas críticas.
            Considere reasignar personal, revisar equipos o ajustar procesos.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
