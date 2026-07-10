"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, Package, Weight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Lot } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LoteQRProps {
  lot: Lot;
  size?: number;
}

export function LoteQR({ lot, size = 180 }: LoteQRProps) {
  const { hasPermission } = useAuth();

  const canDownload = hasPermission(["administrador", "supervisor"]);
  const canPrint = hasPermission(["administrador", "supervisor"]);

  // Campos normalizados — nunca undefined
  const lotCode = lot.codigo || lot.code || "–";
  const supplier = lot.proveedor || lot.supplier || "–";
  const weight = lot.peso ?? lot.currentWeight ?? 0;
  const origin = lot.origin || "–";
  const entryDate = lot.fechaIngreso || lot.entryDate;
  const statusKey = lot.estado || lot.status || "pending";
  const statusConfig =
    LOT_STATUS_CONFIG[statusKey as keyof typeof LOT_STATUS_CONFIG] ||
    LOT_STATUS_CONFIG["pending"];

  // URL de verificación
  const getVerifyUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/verify/${lotCode}`;
    }
    return `https://goldenleaf.com/verify/${lotCode}`;
  };

  const verifyUrl = getVerifyUrl();

  const handleDownloadPNG = () => {
    const svg = document.getElementById(`qr-code-${lot.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, size, size);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${lotCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = document.getElementById(`qr-code-${lot.id}`);
    if (!svg) return;

    const formattedDate = entryDate
      ? format(new Date(entryDate), "dd 'de' MMMM, yyyy", { locale: es })
      : "–";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>QR – ${lotCode}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 32px;
            }
            .card {
              width: 320px;
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #16a34a, #15803d);
              color: white;
              padding: 20px 24px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .header-icon {
              width: 40px; height: 40px;
              background: rgba(255,255,255,0.2);
              border-radius: 10px;
              display: flex; align-items: center; justify-content: center;
              font-size: 20px;
            }
            .header-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
            .header-sub { font-size: 11px; opacity: 0.8; margin-top: 2px; }
            .qr-section {
              background: #f9fafb;
              padding: 28px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }
            .qr-wrapper {
              background: white;
              padding: 16px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            .qr-wrapper svg { display: block; }
            .lot-code {
              font-family: 'Courier New', monospace;
              font-size: 20px;
              font-weight: 700;
              color: #111827;
              letter-spacing: 1px;
            }
            .badge {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              background: #dcfce7;
              color: #16a34a;
            }
            .info-section {
              padding: 20px 24px;
              border-top: 1px solid #f3f4f6;
            }
            .info-row {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 6px 0;
              font-size: 13px;
              color: #374151;
            }
            .info-label {
              color: #9ca3af;
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              min-width: 80px;
            }
            .info-value { font-weight: 600; }
            .footer {
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
              padding: 12px 24px;
              text-align: center;
              font-size: 10px;
              color: #9ca3af;
            }
            @media print {
              body { padding: 0; }
              .card { box-shadow: none; border-color: #d1d5db; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="header-icon">🌿</div>
              <div>
                <div class="header-title">Golden Trace</div>
                <div class="header-sub">Sistema de Trazabilidad</div>
              </div>
            </div>
            <div class="qr-section">
              <div class="qr-wrapper">
                ${svg.outerHTML}
              </div>
              <div class="lot-code">${lotCode}</div>
              <span class="badge">${statusConfig.label}</span>
            </div>
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Proveedor</span>
                <span class="info-value">${supplier}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Peso</span>
                <span class="info-value">${weight} kg</span>
              </div>
              <div class="info-row">
                <span class="info-label">Origen</span>
                <span class="info-value">${origin}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ingreso</span>
                <span class="info-value">${formattedDate}</span>
              </div>
            </div>
            <div class="footer">
              Escanea el código QR para ver la trazabilidad completa
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const formattedDate = entryDate
    ? format(new Date(entryDate), "dd MMM yyyy", { locale: es })
    : "–";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* QR Code */}
      <div className="relative">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-border">
          <QRCodeSVG
            id={`qr-code-${lot.id}`}
            value={verifyUrl}
            size={size}
            level="H"
            includeMargin={false}
          />
        </div>
        {/* Overlay badge en esquina */}
        <div className="absolute -top-2 -right-2">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <span className="text-[9px] text-primary-foreground font-bold">QR</span>
          </div>
        </div>
      </div>

      {/* Código del lote */}
      <div className="text-center">
        <p className="font-mono font-bold text-base text-foreground tracking-wide">
          {lotCode}
        </p>
        <Badge
          className={`${statusConfig.bgColor} ${statusConfig.color} border-0 text-xs mt-1`}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Info compacta */}
      <div className="w-full rounded-xl bg-muted/40 border border-border divide-y divide-border/60">
        <div className="flex items-center gap-2 px-3 py-2">
          <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground min-w-[60px]">Proveedor</span>
          <span className="text-xs font-medium text-foreground truncate">{supplier}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <Weight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground min-w-[60px]">Peso</span>
          <span className="text-xs font-medium text-foreground">{weight} kg</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground min-w-[60px]">Origen</span>
          <span className="text-xs font-medium text-foreground truncate">{origin}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground min-w-[60px]">Ingreso</span>
          <span className="text-xs font-medium text-foreground">{formattedDate}</span>
        </div>
      </div>

      <Separator />

      {/* Acciones */}
      <div className="flex gap-2 w-full">
        {canDownload && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 h-9"
            onClick={handleDownloadPNG}
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        )}
        {canPrint && (
          <Button
            variant="default"
            size="sm"
            className={`${canDownload ? "flex-1" : "w-full"} gap-2 h-9`}
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        )}
      </div>

      {/* URL de verificación */}
      <p className="text-[10px] text-muted-foreground text-center break-all px-2">
        {verifyUrl}
      </p>
    </div>
  );
}
