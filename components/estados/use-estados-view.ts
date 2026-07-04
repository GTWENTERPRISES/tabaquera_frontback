"use client";

import { useState, useMemo } from "react";
import { useLots } from "@/contexts/lot-context";
import type { Lot, Stage } from "@/lib/types";
import type { EstadosFilterValues } from "./estados-filters";

export function useEstadosView() {
  const { lots, isLoading } = useLots();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<EstadosFilterValues>({
    stage: "all",
    estado: "all",
    responsable: "all",
  });
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /** Unique responsables for filter dropdown */
  const responsables = useMemo(() => {
    const names = lots
      .map((l) => l.responsable?.nombre)
      .filter((n): n is string => !!n);
    return Array.from(new Set(names)).sort();
  }, [lots]);

  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matches =
          (lot.codigo ?? lot.code ?? "").toLowerCase().includes(q) ||
          (lot.qrCode ?? "").toLowerCase().includes(q) ||
          (lot.proveedor ?? lot.supplier ?? "").toLowerCase().includes(q) ||
          (lot.origin ?? "").toLowerCase().includes(q) ||
          (lot.variety ?? "").toLowerCase().includes(q) ||
          (lot.responsable?.nombre ?? "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Stage filter
      if (filters.stage !== "all" && lot.currentStage !== filters.stage) {
        return false;
      }

      // Estado filter
      if (filters.estado !== "all" && lot.estado !== filters.estado) {
        return false;
      }

      // Responsable filter
      if (
        filters.responsable !== "all" &&
        lot.responsable?.nombre !== filters.responsable
      ) {
        return false;
      }

      return true;
    });
  }, [lots, search, filters]);

  const openLotDetail = (lot: Lot) => {
    setSelectedLot(lot);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLot(null);
  };

  return {
    lots,
    filteredLots,
    isLoading,
    search,
    setSearch,
    filters,
    setFilters,
    responsables,
    selectedLot,
    modalOpen,
    openLotDetail,
    closeModal,
  };
}
