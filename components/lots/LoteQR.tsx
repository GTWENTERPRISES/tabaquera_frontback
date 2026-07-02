"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Lot } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

interface LoteQRProps {
  lot: Lot;
  size?: number;
}

export function LoteQR({ lot, size = 180 }: LoteQRProps) {
  const { user, hasPermission } = useAuth();

  const canDownload = hasPermission(["administrador", "supervisor"]);
  const canPrint = hasPermission(["administrador", "supervisor"]);

  // Generate verification URL - use current origin or default
  const getVerifyUrl = () => {
    const lotCode = lot.codigo || lot.code;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/verify/${lotCode}`;
    }
    // Fallback for server-side rendering
    return `https://goldenleaf.com/verify/${lotCode}`;
  };

  const verifyUrl = getVerifyUrl();

  const handleDownloadPNG = () => {
    const svg = document.getElementById(`qr-code-${lot.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${lot.codigo || lot.code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = document.getElementById(`qr-code-${lot.id}`);
    if (!svg) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR - ${lot.codigo || lot.code}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            .code { font-family: monospace; font-size: 24px; margin-top: 20px; }
            .info { color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${svg.outerHTML}
          <div class="code">${lot.codigo || lot.code}</div>
          <div class="info">${lot.proveedor || lot.supplier} - ${lot.peso || lot.currentWeight} kg</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 bg-white rounded-xl shadow-inner">
        <QRCodeSVG
          id={`qr-code-${lot.id}`}
          value={verifyUrl}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>
      <p className="mt-4 font-mono text-sm text-muted-foreground">
        {lot.qrCode}
      </p>
      <Separator className="my-4" />
      <div className="flex flex-wrap gap-2 w-full">
        {canDownload && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleDownloadPNG}
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        )}
        {canPrint && (
          <Button
            variant="outline"
            size="sm"
            className={canDownload ? "flex-1 gap-2" : "w-full gap-2"}
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        )}
      </div>
    </div>
  );
}
