"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultErrorProps {
  error: string;
  onRetry: () => void;
}

export function ResultError({ error, onRetry }: ResultErrorProps) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-center"
    >
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 dark:text-red-400 font-medium">
        {error}
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={onRetry}
      >
        Intentar de nuevo
      </Button>
    </motion.div>
  );
}
