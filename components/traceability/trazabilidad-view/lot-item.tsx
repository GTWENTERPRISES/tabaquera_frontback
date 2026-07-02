"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import type { Stage } from "@/lib/types";

export function LotItem({
  lot,
  selected,
  onClick,
}: {
  lot: any;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      style={{ originX: 0.5, originY: 0.5 }}
      className="overflow-hidden"
    >
      <button
        onClick={onClick}
        className={`w-full p-3 rounded-xl border text-left transition-all duration-200 ${
          selected
            ? "border-primary bg-primary/8 shadow-sm"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-mono font-semibold text-sm text-foreground">
            {lot.codigo ?? lot.code}
          </span>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${STAGE_COLORS[lot.currentStage as Stage]}`}
          >
            {STAGE_LABELS[lot.currentStage as Stage]}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{lot.origin}</span>
        </div>
      </button>
    </motion.div>
  );
}
