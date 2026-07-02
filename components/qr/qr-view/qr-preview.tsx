"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, ImageIcon, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Lot } from "@/lib/types";

interface QrPreviewProps {
  selectedLot: Lot | null;
  origin: string;
  canDownload: boolean;
  canPrint: boolean;
  handleDownloadPNG: () => void;
  handleDownloadSVG: () => void;
  handlePrint: () => void;
}

export function QrPreview({
  selectedLot,
  origin,
  canDownload,
  canPrint,
  handleDownloadPNG,
  handleDownloadSVG,
  handlePrint,
}: QrPreviewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {selectedLot ? (
            <>
              <div className="p-6 bg-white rounded-xl shadow-inner">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`${origin}/verify/${selectedLot.codigo || selectedLot.code}`}
                  size={280}
                  level="H"
                  includeMargin={true}
                  marginSize={4}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <p className="mt-4 font-mono text-xl font-semibold">{selectedLot.codigo}</p>
              <p className="text-sm text-muted-foreground">{selectedLot.qrCode}</p>

              <div className="flex flex-wrap gap-3 mt-6 w-full">
                {canDownload && (
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadPNG}>
                    <Download className="h-4 w-4" />
                    PNG
                  </Button>
                )}
                {canDownload && (
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadSVG}>
                    <ImageIcon className="h-4 w-4" />
                    SVG
                  </Button>
                )}
                {canPrint && (
                  <Button className={canDownload ? "flex-1 gap-2" : "w-full gap-2"} onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Selecciona un lote para generar su codigo QR</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
