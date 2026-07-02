"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

export function ResultEmpty() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
        <ScanLine className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        Escanea un codigo QR o ingresa el codigo manualmente
      </p>
    </motion.div>
  );
}
