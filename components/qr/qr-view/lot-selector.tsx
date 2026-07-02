"use client";

import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOT_STATUS_CONFIG } from "@/lib/constants";
import type { Lot } from "@/lib/types";

interface LotSelectorProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLotId: string;
  setSelectedLotId: (value: string) => void;
  filteredLots: Lot[];
  selectedLot: Lot | null;
}

export function LotSelector({
  searchTerm,
  setSearchTerm,
  selectedLotId,
  setSelectedLotId,
  filteredLots,
  selectedLot,
}: LotSelectorProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Seleccionar Lote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar lote..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedLotId} onValueChange={setSelectedLotId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar un lote" />
            </SelectTrigger>
            <SelectContent>
              {filteredLots.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{lot.codigo || lot.code}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-muted-foreground text-sm">{lot.proveedor || lot.supplier}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedLot && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-lg bg-muted/50 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono font-semibold">{selectedLot.codigo || selectedLot.code}</p>
                  <p className="text-sm text-muted-foreground">{selectedLot.proveedor || selectedLot.supplier}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Peso</p>
                  <p className="font-semibold">{selectedLot.peso || selectedLot.currentWeight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  {selectedLot.estado && (
                    <Badge
                      className={`${LOT_STATUS_CONFIG[selectedLot.estado as keyof typeof LOT_STATUS_CONFIG].bgColor} ${LOT_STATUS_CONFIG[selectedLot.estado as keyof typeof LOT_STATUS_CONFIG].color} border-0`}
                    >
                      {LOT_STATUS_CONFIG[selectedLot.estado as keyof typeof LOT_STATUS_CONFIG].label}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
