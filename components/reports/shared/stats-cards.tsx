import { Package, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    lotesProcesados: number;
    produccionTotal: number;
    tasaAprobacion: number;
    tiempoPromedio: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.lotesProcesados}</p>
              <p className="text-sm text-muted-foreground">
                Lotes Procesados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.produccionTotal.toLocaleString()} kg</p>
              <p className="text-sm text-muted-foreground">
                Produccion Total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.tasaAprobacion.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">
                Tasa de Aprobacion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.tiempoPromedio.toFixed(1)} dias</p>
              <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
