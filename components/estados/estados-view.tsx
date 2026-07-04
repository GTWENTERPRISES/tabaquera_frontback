"use client";

/**
 * EstadosView — Herramienta de consulta individual de lotes.
 *
 * Responde la pregunta: ¿Qué está pasando con ESTE lote?
 *
 * Características:
 * - Barra de búsqueda prominente (código, QR, proveedor, origen, variedad)
 * - Filtros por etapa, estado y responsable
 * - Tabla de resultados con información compacta pero útil
 * - Modal detallado con 4 pestañas: Información, Timeline, Historial, QR
 * - NO hay Kanban, columnas ni estadísticas globales (eso es de Procesos)
 */

import { motion } from "framer-motion";
import { EstadosHeader } from "./estados-header";
import { EstadosSearchBar } from "./estados-search-bar";
import { EstadosFilters } from "./estados-filters";
import { EstadosTable } from "./estados-table";
import { EstadosLotDetailModal } from "./estados-lot-detail-modal";
import { useEstadosView } from "./use-estados-view";

export function EstadosView() {
  const {
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
  } = useEstadosView();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <EstadosHeader />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <EstadosSearchBar value={search} onChange={setSearch} />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <EstadosFilters
          filters={filters}
          onChange={setFilters}
          responsables={responsables}
          total={lots.length}
          filtered={filteredLots.length}
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <EstadosTable
          lots={filteredLots}
          isLoading={isLoading}
          onSelectLot={openLotDetail}
        />
      </motion.div>

      {/* Lot detail modal */}
      <EstadosLotDetailModal
        lot={selectedLot}
        open={modalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
