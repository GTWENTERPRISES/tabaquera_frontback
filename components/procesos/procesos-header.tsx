"use client";

import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcesosHeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ProcesosHeader({ onRefresh, isLoading }: ProcesosHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Control de Procesos
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Panel de monitoreo operativo · Vista Kanban del flujo productivo
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>En tiempo real</span>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        )}
      </div>
    </motion.div>
  );
}
