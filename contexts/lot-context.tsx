"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
  useCallback,
} from "react";
import type {
  Lot,
  LotFilters,
  LotStatus,
  Stage,
  QualityCheck,
  Movement,
  ProcessStage,
  Observation,
  SystemEvent,
} from "@/lib/types";
import { api } from "@/services/api";
import type {
  Estadisticas,
  InspeccionCalidad,
  Lote as ApiLote,
  MovimientoLote,
  Alerta,
} from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { useError } from "@/contexts/error-context";

interface LotContextType {
  lots: Lot[];
  filters: LotFilters;
  setFilters: (filters: LotFilters) => void;
  filteredLots: Lot[];
  isLoading: boolean;
  updateLotStatus: (lotId: string, status: LotStatus) => Promise<void>;
  getLotById: (id: string) => Promise<Lot | undefined>;
  moveLotToStage: (
    lotId: string,
    newStage: Stage,
    observation?: string,
    quantityReceived?: number,
    delayReason?: string,
  ) => Promise<void>;
  completeLot: (lotId: string, observation?: string) => Promise<void>;
  iniciarTrabajo: (lotId: string) => Promise<void>;
  pausarTrabajo: (lotId: string) => Promise<void>;
  reanudarTrabajo: (lotId: string) => Promise<void>;
  reasignarLote: (lotId: string, responsable: { nombre: string, id?: number }) => Promise<void>;
  qualityChecks: QualityCheck[];
  addQualityCheck: (check: Partial<InspeccionCalidad>) => Promise<QualityCheck>;
  createQualityCheck: (data: Partial<InspeccionCalidad>) => Promise<QualityCheck>;
  updateQualityCheck: (id: string, data: Partial<InspeccionCalidad>) => Promise<QualityCheck>;
  refreshQualityChecks: () => Promise<void>;
  getQualityChecksByLotId: (lotId: string) => QualityCheck[];
  movements: Movement[];
  getMovementsByLotId: (lotId: string) => Movement[];
  processStages: Record<string, ProcessStage[]>;
  getProcessStagesByLotId: (lotId: string) => ProcessStage[];
  addLot: (lotData: any) => Promise<void>;
  observations: Observation[];
  addObservation: (obs: Omit<Observation, "id" | "date">) => Promise<void>;
  getObservationsByLotId: (lotId: string) => Observation[];
  systemEvents: SystemEvent[];
  alertas: Alerta[];
  stats: Estadisticas | null;
  refreshLots: () => Promise<void>;
  inspecciones: InspeccionCalidad[];
  movimientos: MovimientoLote[];
}

const LotContext = createContext<LotContextType | undefined>(undefined);

// Mapeo de etapas API a frontend — incluye variantes sin tilde por robustez
const stageMap: Record<string, Stage> = {
  "Recepción":     "reception",
  "Recepcion":     "reception",
  "Clasificación": "classification",
  "Clasificacion": "classification",
  "Selección":     "selection",
  "Seleccion":     "selection",
  "Empaque":       "packaging",
  "Distribución":  "distribution",
  "Distribucion":  "distribution",
};

const reverseStageMap: Record<Stage, string> = {
  reception: "Recepción",
  classification: "Clasificación",
  selection: "Selección",
  packaging: "Empaque",
  distribution: "Distribución",
};

const mapApiMovimientoToLotMovement = (apiLoteId: number, mov: MovimientoLote) => ({
  id: mov.id.toString(),
  lotId: apiLoteId.toString(),
  fromStage: mov.etapa_origen_nombre
    ? stageMap[mov.etapa_origen_nombre]
    : undefined,
  toStage: mov.etapa_destino_nombre
    ? stageMap[mov.etapa_destino_nombre]
    : "reception",
  userId: mov.usuario?.toString() || "",
  userName: mov.usuario_nombre || "Sistema",
  userRole: "",
  startedAt:
    mov.tipo_movimiento === "inicio" || mov.tipo_movimiento === "reanudacion"
      ? mov.fecha_hora
      : undefined,
  pausedAt: mov.tipo_movimiento === "pausa" ? mov.fecha_hora : undefined,
  resumedAt: mov.tipo_movimiento === "reanudacion" ? mov.fecha_hora : undefined,
  completedAt:
    mov.tipo_movimiento === "finalizacion" ? mov.fecha_hora : undefined,
  totalPausedMinutes: mov.tiempo_pausa_minutos || 0,
  durationMinutes: mov.tiempo_trabajo_minutos || 0,
  observations: mov.observaciones || "",
  quantityReceived: mov.cantidad_procesada_kg,
  createdAt: mov.fecha_hora,
  movementType: mov.tipo_movimiento,
});

// Convertir lote de API a formato frontend
const apiLoteToLot = (apiLote: ApiLote): Lot => {
  // etapa_actual puede llegar como objeto (detail) o como null/undefined (list)
  // etapa_actual_nombre llega en list; en detail viene dentro del objeto
  const etapaNombre =
    (typeof apiLote.etapa_actual === 'object' && apiLote.etapa_actual !== null)
      ? (apiLote.etapa_actual as any).nombre
      : apiLote.etapa_actual_nombre;

  const currentStage = etapaNombre
    ? stageMap[etapaNombre] || "reception"
    : "reception";

  const mappedMovements = (apiLote.movimientos || []).map((mov) =>
    mapApiMovimientoToLotMovement(apiLote.id, mov),
  );

  // Mapeo completo de estados del backend al frontend
  const statusMap: Record<string, LotStatus> = {
    'pendiente':     'waiting',      // pendiente = esperando inicio
    'en_espera':     'on_hold',
    'en_produccion': 'in_production',
    'finalizado':    'completed',
    'rechazado':     'rejected',
  };

  // variedad puede llegar como objeto (detail) o como número (list)
  // variedad_nombre siempre viene en list
  const varietyName =
    (typeof apiLote.variedad === 'object' && apiLote.variedad !== null)
      ? (apiLote.variedad as any).nombre
      : apiLote.variedad_nombre || '';

  // proveedor puede llegar como objeto (detail) o como número (list)
  const supplierName =
    (typeof apiLote.proveedor === 'object' && apiLote.proveedor !== null)
      ? (apiLote.proveedor as any).nombre
      : apiLote.proveedor_nombre || '';
  
  return {
    id: apiLote.id.toString(),
    codigo: apiLote.codigo,
    code: apiLote.codigo,
    qrCode: apiLote.codigo_qr,
    origin: apiLote.origen,
    variety: varietyName,
    supplier: supplierName,
    proveedor: supplierName,
    entryDate: apiLote.fecha_ingreso,
    fechaIngreso: apiLote.fecha_ingreso,
    initialWeight: typeof apiLote.peso_inicial_kg === 'string' ? parseFloat(apiLote.peso_inicial_kg) : apiLote.peso_inicial_kg,
    currentWeight: typeof apiLote.peso_actual_kg === 'string' ? parseFloat(apiLote.peso_actual_kg) : apiLote.peso_actual_kg,
    quantityBales: apiLote.cantidad_bultos,
    currentStage,
    estado: apiLote.estado,
    status: statusMap[apiLote.estado] || 'active',
    quality: 'A',
    responsibleId: apiLote.responsable_actual ? apiLote.responsable_actual.toString() : undefined,
    responsable: apiLote.responsable_nombre ? { nombre: apiLote.responsable_nombre } : undefined,
    stageHistory: [],
    movements: mappedMovements,
    lastUpdatedAt: apiLote.fecha_actualizacion || new Date().toISOString(),
  };
};

export function LotProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [processStages, setProcessStages] = useState<Record<string, ProcessStage[]>>({});
  const [filters, setFilters] = useState<LotFilters>({});
  const [observations, setObservations] = useState<Observation[]>([]);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [inspecciones, setInspecciones] = useState<InspeccionCalidad[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoLote[]>([]);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showError, showWarning } = useError();

  // Cargar lotes desde el API
  const refreshLots = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apiLots, apiStats] = await Promise.all([
        api.getAllLotes(),
        api.getEstadisticas(),
      ]);

      const mappedLots = apiLots.map(apiLoteToLot);
      setLots(mappedLots);
      setStats(apiStats);
    } catch (error) {
      console.error("Error loading lots:", error);
      showError(
        "Error al cargar lotes",
        "No se pudieron obtener los lotes del servidor.",
        error instanceof Error ? error.message : String(error),
      );
      setLots([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshLots();
    } else if (!authLoading && !isAuthenticated) {
      setLots([]);
      setStats(null);
      setIsLoading(false);
    }
  }, [refreshLots, isAuthenticated, authLoading]);

  // Map API InspeccionCalidad to QualityCheck
  const apiInspeccionToQualityCheck = (insp: InspeccionCalidad, lot?: Lot): QualityCheck => {
    // Status map
    const statusMap: Record<string, QualityStatus> = {
      'pendiente': 'pending',
      'en_inspeccion': 'in_progress',
      'aprobado': 'passed',
      'aprobado_con_observaciones': 'passed_with_notes',
      'rechazado': 'failed',
    };

    return {
      id: insp.id.toString(),
      lotId: insp.lote.toString(),
      lotCode: lot?.code || lot?.codigo || `LT-${insp.lote}`,
      stage: insp.etapa_nombre || 'Recepción',
      grade: insp.grado_calidad || 'A',
      temperature: insp.temperatura || 0,
      humidity: insp.humedad || 0,
      weight: insp.peso_kg,
      status: statusMap[insp.estado_calidad] || 'pending',
      resultado: insp.estado_calidad,
      date: insp.fecha_hora_fin || insp.fecha_hora_inicio,
      fechaInspeccion: insp.fecha_hora_inicio,
      inspector: insp.inspector_nombre || 'Inspector',
      inspectorData: insp.inspector_nombre ? { nombre: insp.inspector_nombre } : undefined,
    };
  };

  // Refresh quality checks
  const refreshQualityChecks = useCallback(async () => {
    try {
      // Use getAllPaginated to fetch ALL inspections, not just first page
      const allInspecciones = await api.getAllPaginated<InspeccionCalidad>('/inspecciones-calidad/');
      setInspecciones(allInspecciones);
      const mapped = allInspecciones.map((insp: InspeccionCalidad) => {
        const lot = lots.find(l => parseInt(l.id) === insp.lote);
        return apiInspeccionToQualityCheck(insp, lot);
      });
      setQualityChecks(mapped);
    } catch (error) {
      console.error("Error loading quality checks:", error);
      showError(
        "Error al cargar inspecciones",
        "No se pudieron obtener las inspecciones de calidad.",
        error instanceof Error ? error.message : String(error),
      );
      setQualityChecks([]);
      setInspecciones([]);
    }
  }, [lots]);

  // Cargar inspecciones de calidad
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshQualityChecks();
    } else if (!authLoading && !isAuthenticated) {
      setQualityChecks([]);
    }
  }, [refreshQualityChecks, isAuthenticated, authLoading]);

  // Create quality check
  const createQualityCheck = useCallback(async (data: Partial<InspeccionCalidad>) => {
    try {
      const newInsp = await api.createInspeccionCalidad(data);
      const lot = lots.find(l => parseInt(l.id) === newInsp.lote);
      const newCheck = apiInspeccionToQualityCheck(newInsp, lot);
      setQualityChecks(prev => [...prev, newCheck]);
      return newCheck;
    } catch (error) {
      console.error("Error creating quality check:", error);
      throw error;
    }
  }, [lots]);

  // Update quality check
  const updateQualityCheck = useCallback(async (id: string, data: Partial<InspeccionCalidad>) => {
    try {
      const updatedInsp = await api.updateInspeccionCalidad(parseInt(id), data);
      const lot = lots.find(l => parseInt(l.id) === updatedInsp.lote);
      const updatedCheck = apiInspeccionToQualityCheck(updatedInsp, lot);
      setQualityChecks(prev => prev.map(qc => qc.id === id ? updatedCheck : qc));
      return updatedCheck;
    } catch (error) {
      console.error("Error updating quality check:", error);
      throw error;
    }
  }, [lots]);

  // Cargar movimientos
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      if (!authLoading) setMovements([]);
      return;
    }
    const fetchMovements = async () => {
      try {
        // Fetch ALL movements with pagination
        const allMovements = await api.getAllPaginated<MovimientoLote>('/movimientos/');
        setMovimientos(allMovements);
        const mapped = allMovements.map((mov: MovimientoLote) => ({
          id: mov.id.toString(),
          lotId: mov.lote.toString(),
          lotCode: `LT-${mov.lote}`,
          fromStage: mov.etapa_origen_nombre ? stageMap[mov.etapa_origen_nombre] : undefined,
          toStage: mov.etapa_destino_nombre ? stageMap[mov.etapa_destino_nombre] : 'reception',
          date: mov.fecha_hora,
          observation: mov.observaciones || '',
          quantityReceived: mov.cantidad_procesada_kg,
          userId: mov.usuario?.toString(),
          userName: mov.usuario_nombre || 'Sistema',
          durationMinutes: mov.tiempo_trabajo_minutos || 0,
          tipo_movimiento: mov.tipo_movimiento,
        }));
        setMovements(mapped);
      } catch (error) {
        console.error("Error loading movements:", error);
        showError(
          "Error al cargar movimientos",
          "No se pudieron obtener los movimientos del sistema.",
          error instanceof Error ? error.message : String(error),
        );
        setMovements([]);
        setMovimientos([]);
      }
    };
    
    fetchMovements();
  }, [isAuthenticated, authLoading]);

  // Cargar alertas activas del backend
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      if (!authLoading) setAlertas([]);
      return;
    }
    const fetchAlertas = async () => {
      try {
        const activas = await api.getAlertasActivas();
        setAlertas(activas);
      } catch (error) {
        console.error("Error loading alertas:", error);
        setAlertas([]);
      }
    };
    fetchAlertas();
  }, [isAuthenticated, authLoading]);

  // Cargar eventos del sistema
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      if (!authLoading) setSystemEvents([]);
      return;
    }
    const fetchEvents = async () => {
      try {
        const response = await api.getEventosRecientes();
        if (Array.isArray(response)) {
          // Map backend TipoEvento to frontend SystemEvent.type
          const eventTypeMap: Record<string, SystemEvent["type"]> = {
            creacion_lote: "lot",
            movimiento_etapa: "stage",
            inspeccion_calidad: "quality",
            cambio_estado_lote: "lot",
            creacion_usuario: "user",
            modificacion_usuario: "user",
            login: "user",
            logout: "user",
            alerta_generada: "alert",
          };

          const mapped = response.map((event) => ({
            id: event.id.toString(),
            lotId: event.lote?.toString(),
            lotCode: event.lote_codigo || "",
            action: event.tipo,
            detail: event.descripcion,
            date: event.fecha_hora,
            userId: event.usuario?.toString(),
            userName: event.usuario_nombre || "Sistema",
            type: eventTypeMap[event.tipo] ?? "lot",
          }));
          setSystemEvents(mapped);
        }
      } catch (error) {
        console.error("Error loading events:", error);
        showError(
          "Error al cargar eventos",
          "No se pudieron obtener los eventos del sistema.",
          error instanceof Error ? error.message : String(error),
        );
        setSystemEvents([]);
      }
    };
    
    fetchEvents();
  }, [isAuthenticated, authLoading]);

  const filteredLots = useMemo(
    () =>
      lots.filter((lot) => {
        if (
          filters.estado &&
          filters.estado.length > 0 &&
          lot.estado &&
          !filters.estado.includes(lot.estado as any)
        ) {
          return false;
        }
        if (
          filters.proveedor &&
          lot.proveedor &&
          lot.proveedor !== filters.proveedor
        ) {
          return false;
        }
        if (
          filters.fechaDesde &&
          lot.fechaIngreso &&
          new Date(lot.fechaIngreso) < filters.fechaDesde
        ) {
          return false;
        }
        if (
          filters.fechaHasta &&
          lot.fechaIngreso &&
          new Date(lot.fechaIngreso) > filters.fechaHasta
        ) {
          return false;
        }
        if (filters.busqueda) {
          const search = filters.busqueda.toLowerCase();
          return (
            (lot.codigo || lot.code || "").toLowerCase().includes(search) ||
            (lot.proveedor || lot.supplier || "")
              .toLowerCase()
              .includes(search) ||
            (lot.responsable?.nombre || "").toLowerCase().includes(search)
          );
        }
        return true;
      }),
    [lots, filters],
  );

  const getLotById = useCallback(async (id: string) => {
    let lot = lots.find((l) => l.id === id);
    
    // Si no existe o viene desde el listado sin relaciones, cargar detalle real.
    if (!lot || lot.movements.length === 0) {
      try {
        const apiLote = await api.getLote(parseInt(id));
        lot = apiLoteToLot(apiLote);
        setLots((prev) => {
          const index = prev.findIndex((l) => l.id === id);
          if (index !== -1) {
            const newLots = [...prev];
            newLots[index] = lot;
            return newLots;
          }
          return [...prev, lot];
        });
      } catch (error) {
        console.error("Error fetching lot details:", error);
      }
    }
    
    return lot;
  }, [lots]);

  const updateLotStatus = async (lotId: string, status: LotStatus) => {
    try {
      const estadoMap: Record<LotStatus, string> = {
        active: 'en_produccion',
        completed: 'finalizado',
        rejected: 'rechazado',
      };
      
      await api.updateLote(parseInt(lotId), {
        estado: estadoMap[status] as any,
      });
      
      await refreshLots();
    } catch (error) {
      console.error("Error updating lot status:", error);
      throw error;
    }
  };

  const moveLotToStage = async (
    lotId: string,
    newStage: Stage,
    observation?: string,
    quantityReceived?: number,
    delayReason?: string,
  ) => {
    try {
      // Obtener las etapas para encontrar el ID de la etapa destino
      const etapas = await api.getEtapasProductivas();
      const etapaDestino = etapas.results.find(
        (e) => e.nombre === reverseStageMap[newStage],
      );
      
      if (!etapaDestino) {
        console.error("Etapa no encontrada:", newStage);
        return;
      }

      await api.moverLoteEtapa(parseInt(lotId), {
        etapa_destino: etapaDestino.id,
        observaciones: observation,
        cantidad_procesada_kg: quantityReceived,
        incidencias: "ninguna",
        motivo_retraso: delayReason || "ninguno",
      });

      await refreshLots();
    } catch (error) {
      console.error("Error moving lot to stage:", error);
      throw error;
    }
  };

  const completeLot = async (lotId: string, observation?: string) => {
    try {
      await api.updateLote(parseInt(lotId), {
        estado: 'finalizado' as any,
      });

      if (observation) {
        await api.createObservacion({
          lote: parseInt(lotId),
          tipo: 'nota',
          contenido: observation,
        });
      }

      await refreshLots();
    } catch (error) {
      console.error("Error completing lot:", error);
      throw error;
    }
  };

  const iniciarTrabajo = async (lotId: string) => {
    try {
      const [apiLot, currentUser] = await Promise.all([
        api.getLote(parseInt(lotId)),
        api.getCurrentUser(),
      ]);
      const currentStageId =
        typeof apiLot.etapa_actual === "number"
          ? apiLot.etapa_actual
          : apiLot.etapa_actual?.id;

      if (!currentStageId) {
        throw new Error("El lote no tiene etapa actual asignada");
      }

      await api.createMovimiento({
        lote: parseInt(lotId),
        etapa_destino: currentStageId,
        usuario: currentUser.id,
        tipo_movimiento: "inicio",
        observaciones: `Inicio de ${apiLot.etapa_actual_nombre || "etapa"}`,
      });

      await getLotById(lotId);
    } catch (error) {
      console.error("Error starting work:", error);
      throw error;
    }
  };

  const pausarTrabajo = async (lotId: string) => {
    try {
      const [apiLot, currentUser] = await Promise.all([
        api.getLote(parseInt(lotId)),
        api.getCurrentUser(),
      ]);
      const currentStageId =
        typeof apiLot.etapa_actual === "number"
          ? apiLot.etapa_actual
          : apiLot.etapa_actual?.id;

      if (!currentStageId) {
        throw new Error("El lote no tiene etapa actual asignada");
      }

      await api.createMovimiento({
        lote: parseInt(lotId),
        etapa_destino: currentStageId,
        usuario: currentUser.id,
        tipo_movimiento: "pausa",
        observaciones: `Pausa en ${apiLot.etapa_actual_nombre || "etapa"}`,
      });

      await getLotById(lotId);
    } catch (error) {
      console.error("Error pausing work:", error);
      throw error;
    }
  };

  const reanudarTrabajo = async (lotId: string) => {
    try {
      const [apiLot, currentUser] = await Promise.all([
        api.getLote(parseInt(lotId)),
        api.getCurrentUser(),
      ]);
      const currentStageId =
        typeof apiLot.etapa_actual === "number"
          ? apiLot.etapa_actual
          : apiLot.etapa_actual?.id;

      if (!currentStageId) {
        throw new Error("El lote no tiene etapa actual asignada");
      }

      await api.createMovimiento({
        lote: parseInt(lotId),
        etapa_destino: currentStageId,
        usuario: currentUser.id,
        tipo_movimiento: "reanudacion",
        observaciones: `Reanudación en ${apiLot.etapa_actual_nombre || "etapa"}`,
      });

      await getLotById(lotId);
    } catch (error) {
      console.error("Error resuming work:", error);
      throw error;
    }
  };

  const reasignarLote = async (lotId: string, responsable: { nombre: string, id?: number }) => {
    try {
      if (responsable.id) {
        await api.asignarResponsable(parseInt(lotId), responsable.id);
        await refreshLots();
      }
    } catch (error) {
      console.error("Error reassigning lot:", error);
      throw error;
    }
  };

  // For backwards compatibility, alias addQualityCheck to createQualityCheck
  const addQualityCheck = createQualityCheck;

  const getQualityChecksByLotId = (lotId: string) => {
    return qualityChecks.filter((q) => q.lotId === lotId);
  };

  const getMovementsByLotId = (lotId: string) => {
    return movements.filter((m) => m.lotId === lotId);
  };

  const getProcessStagesByLotId = (lotId: string) => {
    return processStages[lotId] || [];
  };

  const addLot = async (lotData: any) => {
    try {
      // Obtener proveedores y variedades
      const proveedores = await api.getProveedores();
      const variedades = await api.getVariedadesTabaco();

      const proveedor = proveedores.results.find(p => p.nombre === lotData.supplier || p.nombre === lotData.proveedor);
      const variedad = variedades.results.find(v => v.nombre === lotData.variety);

      if (!proveedor || !variedad) {
        throw new Error("Proveedor o variedad no encontrados");
      }

      const newLot = await api.createLote({
        proveedor_id: proveedor.id,
        variedad_id: variedad.id,
        origen: lotData.origin,
        peso_inicial_kg: lotData.initialWeight,
        peso_actual_kg: lotData.currentWeight ?? lotData.initialWeight,
        cantidad_bultos: lotData.quantityBales,
        fecha_ingreso: lotData.entryDate || new Date().toISOString(),
        observaciones_iniciales: lotData.observations || '',
      });

      await refreshLots();
    } catch (error) {
      console.error("Error adding lot:", error);
      throw error;
    }
  };

  const addObservation = async (obs: Omit<Observation, "id" | "date">) => {
    try {
      await api.createObservacion({
        lote: parseInt(obs.lotId),
        tipo: "general",
        contenido: obs.text,
      });

      const newObs = {
        id: `obs-${Date.now()}`,
        ...obs,
        date: new Date().toISOString(),
      };

      setObservations((prev) => [...prev, newObs]);
    } catch (error) {
      console.error("Error adding observation:", error);
      throw error;
    }
  };

  const getObservationsByLotId = (lotId: string) => {
    return observations.filter((o) => o.lotId === lotId);
  };

  return (
    <LotContext.Provider
      value={{
        lots,
        filters,
        setFilters,
        filteredLots,
        isLoading,
        updateLotStatus,
        getLotById,
        moveLotToStage,
        completeLot,
        iniciarTrabajo,
        pausarTrabajo,
        reanudarTrabajo,
        reasignarLote,
        qualityChecks,
        addQualityCheck,
        createQualityCheck,
        updateQualityCheck,
        refreshQualityChecks,
        getQualityChecksByLotId,
        movements,
        getMovementsByLotId,
        processStages,
        getProcessStagesByLotId,
        addLot,
        observations,
        addObservation,
        getObservationsByLotId,
        systemEvents,
        alertas,
        stats,
        refreshLots,
        inspecciones,
        movimientos,
      }}
    >
      {children}
    </LotContext.Provider>
  );
}

export function useLots() {
  const context = useContext(LotContext);
  if (context === undefined) {
    throw new Error("useLots must be used within a LotProvider");
  }
  return context;
}
