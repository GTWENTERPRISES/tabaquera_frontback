"use client";

import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerErrorStateProps {
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

export function ScannerErrorState({ error, onClose, onRetry }: ScannerErrorStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 backdrop-blur-sm">
      <div className="text-center space-y-4 p-6">
        <div className="h-20 w-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Error al acceder a la cámara
          </h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            {error}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
}
