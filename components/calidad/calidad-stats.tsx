"use client";

import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CalidadStatsProps {
  total: number;
  pending: number;
  inProgress: number;
  passed: number;
  passedWithNotes: number;
  failed: number;
}

export function CalidadStats({
  total,
  pending,
  inProgress,
  passed,
  passedWithNotes,
  failed,
}: CalidadStatsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Inspecciones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{pending}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{inProgress}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">En Inspección</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{passed}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Aprobadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {passedWithNotes}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Aprobadas con Obs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{failed}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Rechazadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
