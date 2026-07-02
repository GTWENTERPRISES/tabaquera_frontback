import { motion } from "framer-motion";
import {
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STAGE_LABELS } from "@/lib/constants";

interface DelayAlertItemProps {
  alert: {
    id: string;
    type: "delay" | "bottleneck" | "quality" | "system";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    lotId?: string;
    lotCode?: string;
    stage?: keyof typeof STAGE_LABELS;
    durationHours: number;
    thresholdHours: number;
    date: string;
    acknowledged: boolean;
  };
  index: number;
  isAcknowledging: boolean;
  showSuccess: boolean;
  onAcknowledge: (alertId: string) => void;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case "delay":
      return Clock;
    case "bottleneck":
      return TrendingDown;
    case "quality":
      return XCircle;
    case "system":
      return Bell;
    default:
      return AlertTriangle;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "high":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "medium":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    case "low":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    default:
      return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case "critical":
      return "Crítico";
    case "high":
      return "Alto";
    case "medium":
      return "Medio";
    case "low":
      return "Bajo";
    default:
      return severity;
  }
};

export function DelayAlertItem({
  alert,
  index,
  isAcknowledging,
  showSuccess,
  onAcknowledge,
}: DelayAlertItemProps) {
  const Icon = getAlertIcon(alert.type);

  return (
    <motion.div
      key={alert.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${alert.acknowledged ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-medium">{alert.title}</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${getSeverityColor(alert.severity)} border-transparent`}
                >
                  {getSeverityLabel(alert.severity)}
                </Badge>
                {alert.acknowledged && (
                  <Badge variant="outline" className="text-xs">
                    Reconocida
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {alert.description}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {alert.lotCode && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{alert.lotCode}</span>
                  </div>
                )}
                {alert.stage && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{STAGE_LABELS[alert.stage] || alert.stage}</span>
                  </div>
                )}
                {alert.durationHours > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{alert.durationHours.toFixed(1)} horas</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {!alert.acknowledged && (
            <Button
              variant="ghost"
              disabled={isAcknowledging}
              size="sm"
              onClick={() => onAcknowledge(alert.id)}
            >
              {isAcknowledging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reconociendo...
                </>
              ) : (
                "Reconocer"
              )}
            </Button>
          )}
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Alerta reconocida</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
