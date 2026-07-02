"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrScanner } from "./qr-scanner";
import { useScannerView } from "./scanner-view/use-scanner-view";
import { ManualInput } from "./scanner-view/manual-input";
import { ResultError } from "./scanner-view/result-error";
import { ResultEmpty } from "./scanner-view/result-empty";
import { ResultContent } from "./scanner-view/result-content";
import { MoveStageDialog } from "./scanner-view/move-stage-dialog";
import { RecentLots } from "./scanner-view/recent-lots";

export function ScannerView() {
  const {
    manualCode,
    setManualCode,
    scannedLot,
    setScannedLot,
    error,
    moveDialogOpen,
    selectedStage,
    setSelectedStage,
    observation,
    setObservation,
    lots,
    handleQrScan,
    handleScannerError,
    handleMoveLot,
    handleManualSearch,
    handleClear,
    handleOpenMoveDialog,
    handleCloseMoveDialog,
  } = useScannerView();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Escáner QR
        </h1>
        <p className="text-muted-foreground">
          Escanea el código QR de un lote para ver su información
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QrScanner onScan={handleQrScan} onError={handleScannerError} />

          {/* Manual Input */}
          <ManualInput
            manualCode={manualCode}
            setManualCode={setManualCode}
            onSubmit={handleManualSearch}
          />
        </motion.div>

        {/* Result Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {error ? (
                  <ResultError error={error} onRetry={handleClear} />
                ) : scannedLot ? (
                  <>
                    <ResultContent
                      scannedLot={scannedLot}
                      onClear={handleClear}
                      onOpenMoveDialog={handleOpenMoveDialog}
                    />
                    <MoveStageDialog
                      open={moveDialogOpen}
                      onOpenChange={handleCloseMoveDialog}
                      selectedStage={selectedStage}
                      setSelectedStage={setSelectedStage}
                      observation={observation}
                      setObservation={setObservation}
                      onMove={handleMoveLot}
                    />
                  </>
                ) : (
                  <ResultEmpty />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Access */}
      <RecentLots lots={lots} onSelectLot={setScannedLot} />
    </div>
  );
}
