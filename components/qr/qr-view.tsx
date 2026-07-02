"use client";

import { motion } from "framer-motion";
import { useLots } from "@/contexts/lot-context";
import { useQrView } from "./qr-view/use-qr-view";
import { LotSelector } from "./qr-view/lot-selector";
import { QrPreview } from "./qr-view/qr-preview";
import { RecentLots } from "./qr-view/recent-lots";

export function QrView() {
  const { lots } = useLots();
  const {
    selectedLotId,
    setSelectedLotId,
    searchTerm,
    setSearchTerm,
    origin,
    selectedLot,
    filteredLots,
    canDownload,
    canPrint,
    handleDownloadPNG,
    handleDownloadSVG,
    handlePrint,
  } = useQrView();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Gestión QR</h1>
        <p className="text-muted-foreground">Visualiza, descarga e imprime codigos QR para los lotes</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LotSelector
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLotId={selectedLotId}
          setSelectedLotId={setSelectedLotId}
          filteredLots={filteredLots}
          selectedLot={selectedLot}
        />
        <QrPreview
          selectedLot={selectedLot}
          origin={origin}
          canDownload={canDownload}
          canPrint={canPrint}
          handleDownloadPNG={handleDownloadPNG}
          handleDownloadSVG={handleDownloadSVG}
          handlePrint={handlePrint}
        />
      </div>

      <RecentLots lots={lots} setSelectedLotId={setSelectedLotId} />
    </div>
  );
}
