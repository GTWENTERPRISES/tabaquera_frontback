"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLots } from "@/contexts/lot-context";
import { useAuth } from "@/contexts/auth-context";

export function useQrView() {
  const searchParams = useSearchParams();
  const lotIdParam = searchParams.get("lot");
  const { lots, getLotById } = useLots();
  const { hasPermission } = useAuth();

  const [selectedLotId, setSelectedLotId] = useState<string>(lotIdParam || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [origin, setOrigin] = useState("https://goldenleaf.com");

  // Get the actual origin from the browser when available
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const selectedLot = selectedLotId
    ? (getLotById(selectedLotId) ?? null)
    : null;

  const filteredLots = lots
    .filter(
      (lot) =>
        (lot.codigo || lot.code || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (lot.proveedor || lot.supplier || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    )
    .slice(0, 20);

  const canDownload = hasPermission(["administrador", "supervisor"]);
  const canPrint = hasPermission(["administrador", "supervisor"]);

  const handleDownloadPNG = () => {
    if (!selectedLot) return;

    const svg = document.getElementById("qr-code-svg");
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
      downloadLink.download = `QR-${selectedLot.codigo || selectedLot.code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleDownloadSVG = () => {
    if (!selectedLot) return;

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.download = `QR-${selectedLot.codigo || selectedLot.code}.svg`;
    downloadLink.href = url;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!selectedLot) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR - ${selectedLot.codigo || selectedLot.code}</title>
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
          <div class="code">${selectedLot.codigo || selectedLot.code}</div>
          <div class="info">${selectedLot.proveedor || selectedLot.supplier} - ${selectedLot.peso || selectedLot.currentWeight} kg</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return {
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
  };
}
