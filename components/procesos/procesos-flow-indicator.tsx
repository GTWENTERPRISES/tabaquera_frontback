"use client";

import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LOT_STATUS_CONFIG, PRODUCTION_STAGES } from "@/lib/constants";

export function ProcesosFlowIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="overflow-x-auto py-4 -mx-1 px-1"
    >
      <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 w-max sm:w-full mx-auto">
        {PRODUCTION_STAGES.map((stage, index) => (
          <div key={stage} className="flex items-center gap-1.5 sm:gap-2">
            <Badge
              variant="outline"
              className={`${LOT_STATUS_CONFIG[stage].color} text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 whitespace-nowrap`}
            >
              {LOT_STATUS_CONFIG[stage].label}
            </Badge>
            {index < PRODUCTION_STAGES.length - 1 && (
              <MoveRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
