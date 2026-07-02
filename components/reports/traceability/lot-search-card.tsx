"use client";

import { motion } from "framer-motion";
import { Search, FileText, User, Clock, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lot } from "@/lib/types";

interface LotSearchCardProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLot: string;
  setSelectedLot: (value: string) => void;
  searchResults: Lot[];
  selectedLotData: Lot | null;
  totalHours: number;
  totalMinutes: number;
  totalEvents: number;
}

export function LotSearchCard({
  searchTerm,
  setSearchTerm,
  selectedLot,
  setSelectedLot,
  searchResults,
  selectedLotData,
  totalHours,
  totalMinutes,
  totalEvents,
}: LotSearchCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4" />
          Buscar Lote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por código de lote o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedLot} onValueChange={setSelectedLot}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar lote" />
              </SelectTrigger>
              <SelectContent>
                {searchResults.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.codigo || lot.code} - {lot.proveedor || lot.supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLotData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 md:grid-cols-4"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {selectedLotData.codigo || selectedLotData.code}
                      </p>
                      <p className="text-sm text-muted-foreground">Código</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {selectedLotData.proveedor ||
                          selectedLotData.supplier}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Proveedor
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totalHours}h {totalMinutes}m
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tiempo Total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <History className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totalEvents}
                      </p>
                      <p className="text-sm text-muted-foreground">Eventos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
