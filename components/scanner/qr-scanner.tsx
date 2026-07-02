"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { useQrScanner } from "./scanner-view/use-qr-scanner";
import { ScannerOverlay } from "./scanner-view/scanner-overlay";
import { ScannerIdleState } from "./scanner-view/scanner-idle-state";
import { ScannerErrorState } from "./scanner-view/scanner-error-state";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QrScanner({ onScan, onError, className }: QrScannerProps) {
  const {
    videoRef,
    canvasRef,
    isScanning,
    error,
    setError,
    isMobile,
    libraryLoaded,
    startScanner,
    stopScanner,
    restartScanner,
  } = useQrScanner({ onScan });

  return (
    <div className={className}>
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Scanner Container */}
          <div className="relative aspect-square max-w-md mx-auto bg-black rounded-xl overflow-hidden">
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Hidden canvas for scanning */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan Overlay */}
            <AnimatePresence>
              <ScannerOverlay isScanning={isScanning} />
            </AnimatePresence>

            {/* Permission Prompt / Idle State */}
            {!isScanning && !error && (
              <ScannerIdleState
                isMobile={isMobile}
                libraryLoaded={libraryLoaded}
                onStartScanner={startScanner}
              />
            )}

            {/* Error State */}
            {error && (
              <ScannerErrorState
                error={error}
                onClose={() => {
                  setError(null);
                }}
                onRetry={restartScanner}
              />
            )}
          </div>

          {/* Controls */}
          {isScanning && (
            <div className="p-4 flex justify-center gap-2">
              <Button variant="outline" onClick={stopScanner} className="gap-2">
                <X className="h-4 w-4" />
                Detener
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
