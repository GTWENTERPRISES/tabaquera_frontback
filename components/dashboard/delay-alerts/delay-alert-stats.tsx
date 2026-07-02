import { AlertTriangle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DelayAlertStatsProps {
  alertStats: {
    total: number;
    unacknowledged: number;
    critical: number;
    byType: {
      delay: number;
      bottleneck: number;
      quality: number;
    };
  };
  showAcknowledged: boolean;
  setShowAcknowledged: (show: boolean) => void;
}

export function DelayAlertStats({
  alertStats,
  showAcknowledged,
  setShowAcknowledged,
}: DelayAlertStatsProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Detección de Retrasos y Alertas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                alertStats.unacknowledged > 0 ? "destructive" : "outline"
              }
            >
              {alertStats.unacknowledged} pendientes
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              {showAcknowledged ? "Ocultar reconocidas" : "Mostrar todas"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{alertStats.total}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Críticas</div>
            <div className="text-2xl font-bold text-red-500">
              {alertStats.critical}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Retrasos</div>
            <div className="text-2xl font-bold">{alertStats.byType.delay}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Cuellos</div>
            <div className="text-2xl font-bold">
              {alertStats.byType.bottleneck}
            </div>
          </div>
        </div>
        <Separator className="mb-4" />
      </CardContent>
    </>
  );
}
