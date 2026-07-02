interface SystemActivityStatsProps {
  eventStats: {
    today: number;
    byType: Record<string, number>;
  };
}

export function SystemActivityStats({ eventStats }: SystemActivityStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Hoy</div>
        <div className="text-2xl font-bold">{eventStats.today}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Lotes</div>
        <div className="text-2xl font-bold">{eventStats.byType.lot || 0}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Etapas</div>
        <div className="text-2xl font-bold">{eventStats.byType.stage || 0}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Alertas</div>
        <div className="text-2xl font-bold">{eventStats.byType.alert || 0}</div>
      </div>
    </div>
  );
}
