"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSystemActivity } from "./use-system-activity";
import { SystemActivityHeader } from "./system-activity-header";
import { SystemActivityStats } from "./system-activity-stats";
import { SystemActivityItem } from "./system-activity-item";
import { SystemActivityFooter } from "./system-activity-footer";

interface EnhancedSystemActivityProps {
  maxItems?: number;
}

export function EnhancedSystemActivity({
  maxItems = 20,
}: EnhancedSystemActivityProps) {
  const {
    searchTerm,
    setSearchTerm,
    eventTypeFilter,
    setEventTypeFilter,
    dateFilter,
    setDateFilter,
    filteredEvents,
    eventStats,
    clearFilters,
    systemEvents,
  } = useSystemActivity(maxItems);

  return (
    <Card className="h-full">
      <SystemActivityHeader
        eventStats={eventStats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        eventTypeFilter={eventTypeFilter}
        setEventTypeFilter={setEventTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
      <CardContent>
        <SystemActivityStats eventStats={eventStats} />
        <Separator className="mb-4" />
        <div className="space-y-4">
          <AnimatePresence>
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No hay eventos registrados</p>
                <p className="text-sm">
                  Los eventos aparecerán aquí cuando ocurran
                </p>
              </motion.div>
            ) : (
              filteredEvents.map((event, index) => (
                <SystemActivityItem
                  key={event.id}
                  event={event}
                  index={index}
                />
              ))
            )}
          </AnimatePresence>
        </div>
        {filteredEvents.length > 0 && (
          <SystemActivityFooter
            filteredCount={filteredEvents.length}
            totalCount={systemEvents.length}
            onClearFilters={clearFilters}
          />
        )}
      </CardContent>
    </Card>
  );
}
