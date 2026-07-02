"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerIdleStateProps {
  isMobile: boolean;
  libraryLoaded: boolean;
  onStartScanner: () => void;
}

export function ScannerIdleState({ isMobile, libraryLoaded, onStartScanner }: ScannerIdleStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm">
      <div className="text-center space-y-4 p-6">
        <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Escanear Código QR
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {isMobile
              ? "Usa la cámara trasera para escanear"
              : "Permite el acceso a la cámara para escanear"}
          </p>
        </div>
        <Button size="lg" onClick={onStartScanner} className="gap-2" disabled={!libraryLoaded}>
          <Camera className="h-4 w-4" />
          {libraryLoaded ? "Iniciar Escaneo" : "Cargando..."}
        </Button>
      </div>
    </div>
  );
}
