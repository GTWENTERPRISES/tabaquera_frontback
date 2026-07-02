import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemActivityFooterProps {
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export function SystemActivityFooter({
  filteredCount,
  totalCount,
  onClearFilters,
}: SystemActivityFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6 pt-4 border-t"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Mostrando {filteredCount} de {totalCount} eventos
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </motion.div>
  );
}
