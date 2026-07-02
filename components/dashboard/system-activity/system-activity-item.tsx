"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Package,
  CheckCircle,
  AlertTriangle,
  User,
  FileText,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SystemEvent } from "@/lib/types";
import {
  getEventColor,
  getEventTypeLabel,
  formatEventDate,
  isImportantEvent,
} from "./use-system-activity";
import { useLots } from "@/contexts/lot-context";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { scrollPositions } from "@/components/ScrollRestoration";

interface SystemActivityItemProps {
  event: SystemEvent;
  index: number;
}

const getIconComponent = (type: string) => {
  const icons = {
    lot: Package,
    quality: CheckCircle,
    stage: Clock,
    user: User,
    observation: FileText,
    alert: Bell,
  };
  return icons[type as keyof typeof icons] || Package;
};

export function SystemActivityItem({ event, index }: SystemActivityItemProps) {
  const Icon = getIconComponent(event.type);
  const important = isImportantEvent(event);
  const { lots, qualityChecks } = useLots();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const handleClick = () => {
    if (event.lotCode) {
      const lot = lots.find(
        (l) => l.codigo === event.lotCode || l.code === event.lotCode,
      );
      if (lot) {
        // Save scroll position before navigating
        scrollPositions.set(currentUrl, window.scrollY);
        router.push(`/dashboard/lotes/${lot.id}`);
      }
    }
  };

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className={`p-3 rounded-lg border cursor-pointer ${important ? "border-warning/20 bg-warning/5" : "hover:bg-accent/50 transition-colors"}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{event.action}</span>
              <Badge
                variant="outline"
                className={`text-xs ${getEventColor(event.type)} border-transparent shrink-0`}
              >
                {getEventTypeLabel(event.type)}
              </Badge>
              {important && (
                <Badge variant="warning" className="text-xs shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Importante
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {formatEventDate(event.date)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2 break-words">
            {event.detail}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{event.userName}</span>
            </div>
            {event.lotCode && (
              <>
                <div className="w-1 h-1 rounded-full bg-muted" />
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>{event.lotCode}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
