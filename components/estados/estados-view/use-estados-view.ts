"use client";

import { useState } from "react";
import { useLots } from "@/contexts/lot-context";
import type { Lot } from "@/lib/types";

export function useEstadosView() {
  const { lots } = useLots();
  const [search, setSearch] = useState("");
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  const filteredLots = lots.filter(
    (lot) =>
      lot.code.toLowerCase().includes(search.toLowerCase()) ||
      (lot.codigo && lot.codigo.toLowerCase().includes(search.toLowerCase())) ||
      lot.origin.toLowerCase().includes(search.toLowerCase()) ||
      lot.variety.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    lots,
    search,
    setSearch,
    selectedLot,
    setSelectedLot,
    filteredLots,
  };
}
