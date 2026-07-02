"use client";

import { CheckCircle, XCircle, AlertTriangle, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QualityKpisProps {
  approvedChecks: number;
  rejectedChecks: number;
  warningChecks: number;
  approvalRate: number;
}

export function QualityKpis({
  approvedChecks,
  rejectedChecks,
  warningChecks,
  approvalRate,
}: QualityKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {approvedChecks}
              </p>
              <p className="text-sm text-muted-foreground">Aprobados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {rejectedChecks}
              </p>
              <p className="text-sm text-muted-foreground">Rechazados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {warningChecks}
              </p>
              <p className="text-sm text-muted-foreground">Con Observaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <PieChart className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {approvalRate}%
              </p>
              <p className="text-sm text-muted-foreground">
                Tasa de Aprobación
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
