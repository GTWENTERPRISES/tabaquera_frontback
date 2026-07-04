"use client";

import { motion } from "framer-motion";

export function EstadosHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
        Estados de Lotes
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
        Busca y consulta el estado detallado de cualquier lote
      </p>
    </motion.div>
  );
}
