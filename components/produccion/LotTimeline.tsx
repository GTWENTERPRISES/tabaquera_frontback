"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import { STAGE_LABELS, STAGES } from "@/lib/constants";
import type { Lot, Stage } from "@/lib/types";

interface LotTimelineProps {
  lot: Lot;
}

export function LotTimeline({ lot }: LotTimelineProps) {
  const currentStageIndex = STAGES.indexOf(lot.currentStage);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Timeline</h3>
      <div className="relative">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 pb-8 last:pb-0 relative"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: idx * 0.1 }}
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : isCurrent
                      ? "border-primary bg-primary text-white"
                      : "border-muted bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </motion.div>
                {idx < STAGES.length - 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
                    className={`absolute left-[19px] top-10 w-0.5 ${
                      isCompleted ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`font-medium ${
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {STAGE_LABELS[stage]}
                </p>
                {isCompleted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.5 }}
                    className="text-xs text-green-600"
                  >
                    Completado
                  </motion.p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
