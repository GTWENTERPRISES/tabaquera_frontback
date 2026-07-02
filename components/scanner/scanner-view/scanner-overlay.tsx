"use client";

import { motion } from "framer-motion";

interface ScannerOverlayProps {
  isScanning: boolean;
}

export function ScannerOverlay({ isScanning }: ScannerOverlayProps) {
  if (!isScanning) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0"
    >
      {/* Corner markers */}
      <div className="absolute inset-8">
        <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg" />
      </div>

      {/* Center guide text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white text-sm font-medium drop-shadow-lg">
          Coloca el código QR dentro del área
        </p>
      </div>
    </motion.div>
  );
}
