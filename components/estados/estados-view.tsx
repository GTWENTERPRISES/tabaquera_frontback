"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEstadosView } from "./estados-view/use-estados-view";
import { LotList } from "./estados-view/lot-list";
import { SideCards } from "./estados-view/side-cards";

export function EstadosView() {
  const {
    lots,
    search,
    setSearch,
    selectedLot,
    setSelectedLot,
    filteredLots,
  } = useEstadosView();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Estados de Lotes
          </h1>
          <p className="text-muted-foreground">
            Consulta la ubicación y estado actual de cualquier lote
          </p>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por código de lote, origen o variedad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LotList
            lots={filteredLots}
            selectedLot={selectedLot}
            setSelectedLot={setSelectedLot}
          />
        </div>
        <div>
          <SideCards lots={lots} />
        </div>
      </div>
    </div>
  );
}
