import type {
  Lot,
  Process,
  QualityCheck,
  Activity,
  Movement,
  ProcessStage,
  LegacyLotState,
  LegacyUserRole,
  User,
  LotStageHistory,
  Stage,
  LotMovement,
} from "./types";
import { STAGES, ORIGINS, VARIETIES, SUPPLIERS } from "./constants";

const roleMap: Record<User["role"], LegacyUserRole> = {
  admin: "administrador",
  supervisor: "supervisor",
  operator: "operario",
  quality: "calidad",
};

export const mockUsers: User[] = [
  {
    id: "usr-001",
    name: "Carlos Martinez",
    nombre: "Carlos Martinez",
    username: "carlos.martinez",
    email: "admin@goldenleaf.com",
    phone: "+505 8888-1001",
    role: "admin",
    rol: "administrador",
    department: "Gerencia",
    status: "active",
    active: true,
    createdAt: new Date("2024-01-15"),
    lastAccess: new Date(),
  },
  {
    id: "usr-002",
    name: "Maria Lopez",
    nombre: "Maria Lopez",
    username: "maria.lopez",
    email: "supervisor@goldenleaf.com",
    phone: "+505 8888-1002",
    role: "supervisor",
    rol: "supervisor",
    department: "Produccion",
    status: "active",
    active: true,
    createdAt: new Date("2024-02-20"),
    lastAccess: new Date(),
  },
  {
    id: "usr-003",
    name: "Juan Garcia",
    nombre: "Juan Garcia",
    username: "juan.garcia",
    email: "operator@goldenleaf.com",
    phone: "+505 8888-1003",
    role: "operator",
    rol: "operario",
    department: "Curado",
    status: "active",
    active: true,
    createdAt: new Date("2024-03-10"),
    lastAccess: new Date(),
  },
  {
    id: "usr-004",
    name: "Ana Rodriguez",
    nombre: "Ana Rodriguez",
    username: "ana.rodriguez",
    email: "quality@goldenleaf.com",
    phone: "+505 8888-1004",
    role: "quality",
    rol: "calidad",
    department: "Calidad",
    status: "active",
    active: true,
    createdAt: new Date("2024-04-01"),
    lastAccess: new Date(),
  },
];

const getLegacyLotState = (lot: Lot): LegacyLotState => {
  if (lot.status === "completed") return "completado";
  if (lot.status === "rejected") return "rechazado";
  return lot.currentStage;
};

const getUserSummary = (userId: string) => {
  const user = mockUsers.find((item) => item.id === userId);
  return {
    nombre: user?.name ?? "Sistema",
  };
};

const enrichLot = (lot: Lot): Lot => ({
  ...lot,
  codigo: lot.code,
  proveedor: lot.supplier,
  fechaIngreso: lot.entryDate,
  peso: lot.currentWeight,
  estado: getLegacyLotState(lot),
  observaciones: lot.notes,
  responsable: getUserSummary(lot.responsibleId),
  stageHistory: lot.stageHistory,
  movements: lot.movements,
  lastUpdatedAt: lot.lastUpdatedAt,
  totalTimeMinutes: lot.totalTimeMinutes,
});

const enrichQualityCheck = (qualityCheck: QualityCheck): QualityCheck => ({
  ...qualityCheck,
  resultado:
    qualityCheck.status === "passed"
      ? "aprobado"
      : qualityCheck.status === "passed_with_notes"
        ? "aprobado_con_observaciones"
        : qualityCheck.status === "failed"
          ? "rechazado"
          : qualityCheck.status === "in_progress"
            ? "en_inspeccion"
            : "pendiente",
  fechaInspeccion: qualityCheck.date,
  inspectorData: { nombre: qualityCheck.inspector },
  observaciones: qualityCheck.notes,
});

// Helper function to generate lot movements
const generateLotMovements = (
  lotId: string,
  currentStage: Stage,
  entryDate: string,
): LotMovement[] => {
  const movements: LotMovement[] = [];
  const baseDate = new Date(entryDate);
  let hour = 8; // 8:00 AM
  const stageUsers: {
    stage: Stage;
    userId: string;
    userName: string;
    userRole: string;
  }[] = [
    {
      stage: "reception",
      userId: "usr-003",
      userName: "Juan Garcia",
      userRole: "operario",
    },
    {
      stage: "classification",
      userId: "usr-002",
      userName: "Maria Lopez",
      userRole: "supervisor",
    },
    {
      stage: "selection",
      userId: "usr-001",
      userName: "Carlos Martinez",
      userRole: "administrador",
    },
    {
      stage: "packaging",
      userId: "usr-003",
      userName: "Juan Garcia",
      userRole: "operario",
    },
    {
      stage: "distribution",
      userId: "usr-002",
      userName: "Maria Lopez",
      userRole: "supervisor",
    },
  ];

  const getRandomDuration = () => Math.floor(Math.random() * 240) + 60; // 1-4 hours
  let previousStage: Stage | undefined = undefined;

  for (const stageConfig of stageUsers) {
    const isCurrentStage = stageConfig.stage === currentStage;
    const startTime = new Date(baseDate);
    startTime.setHours(hour, 0, 0, 0);

    const duration = getRandomDuration();
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + duration);

    if (isCurrentStage) {
      // Movimiento de inicio de etapa actual (sin finalizar)
      movements.push({
        id: `mov-${lotId}-${stageConfig.stage}`,
        lotId,
        fromStage: previousStage,
        toStage: stageConfig.stage,
        userId: stageConfig.userId,
        userName: stageConfig.userName,
        userRole: stageConfig.userRole,
        startedAt: startTime.toISOString(),
        observations: ["Proceso normal", undefined, "Carga extra"][
          Math.floor(Math.random() * 3)
        ],
        quantityReceived: previousStage === undefined ? 1850 : undefined, // initial weight
      });
      break;
    } else {
      // Movimiento de etapa completada
      movements.push({
        id: `mov-${lotId}-${stageConfig.stage}`,
        lotId,
        fromStage: previousStage,
        toStage: stageConfig.stage,
        userId: stageConfig.userId,
        userName: stageConfig.userName,
        userRole: stageConfig.userRole,
        startedAt: startTime.toISOString(),
        completedAt: endTime.toISOString(),
        durationMinutes: duration,
        observations: [
          undefined,
          "Calidad excelente",
          "Pequeños ajustes realizados",
        ][Math.floor(Math.random() * 3)],
      });
      previousStage = stageConfig.stage;
      hour += Math.floor(duration / 60) + 1;
    }
  }

  return movements;
};

// Helper function to generate stage history (deprecated but kept for compatibility)
const generateStageHistory = (
  lotId: string,
  currentStage: Stage,
  entryDate: string,
): LotStageHistory[] => {
  const history: LotStageHistory[] = [];
  const baseDate = new Date(entryDate);
  let hour = 8; // 8:00 AM
  const stageUsers: { stage: Stage; userId: string; userName: string }[] = [
    { stage: "reception", userId: "usr-003", userName: "Juan Garcia" },
    { stage: "classification", userId: "usr-002", userName: "Maria Lopez" },
    { stage: "selection", userId: "usr-001", userName: "Carlos Martinez" },
    { stage: "packaging", userId: "usr-003", userName: "Juan Garcia" },
    { stage: "distribution", userId: "usr-002", userName: "Maria Lopez" },
  ];

  const getRandomDuration = () => Math.floor(Math.random() * 240) + 60; // 1-4 hours

  for (const stageConfig of stageUsers) {
    const isCurrentStage = stageConfig.stage === currentStage;
    const startTime = new Date(baseDate);
    startTime.setHours(hour, 0, 0, 0);

    const duration = getRandomDuration();
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + duration);

    if (isCurrentStage) {
      // Etapa actual - no tiene fecha de fin
      history.push({
        id: `hist-${lotId}-${stageConfig.stage}`,
        lotId,
        stage: stageConfig.stage,
        startTime: startTime.toISOString(),
        responsibleUserId: stageConfig.userId,
        responsibleUserName: stageConfig.userName,
        observations: ["Proceso normal", undefined, "Carga extra"][
          Math.floor(Math.random() * 3)
        ],
      });
      break;
    } else {
      // Etapas pasadas - tienen fecha de fin
      history.push({
        id: `hist-${lotId}-${stageConfig.stage}`,
        lotId,
        stage: stageConfig.stage,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes: duration,
        responsibleUserId: stageConfig.userId,
        responsibleUserName: stageConfig.userName,
        observations: [
          undefined,
          "Calidad excelente",
          "Pequeños ajustes realizados",
        ][Math.floor(Math.random() * 3)],
      });
      hour += Math.floor(duration / 60) + 1;
    }
  }

  return history;
};

// Mock Lots
const baseMockLots = [
  {
    id: "lot-001",
    code: "LT-2026-001",
    qrCode: "QR-LT-2026-001",
    origin: "Esteli",
    variety: "Corojo",
    supplier: "Tabacalera del Norte",
    entryDate: "2026-05-15",
    initialWeight: 1850,
    currentWeight: 1720,
    quantityBales: 25,
    currentStage: "selection",
    status: "active",
    quality: "A",
    responsibleId: "usr-001",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-002",
    code: "LT-2026-002",
    qrCode: "QR-LT-2026-002",
    origin: "Jalapa",
    variety: "Habano",
    supplier: "Hojas Selectas S.A.",
    entryDate: "2026-05-18",
    initialWeight: 2100,
    currentWeight: 2050,
    quantityBales: 30,
    currentStage: "classification",
    status: "active",
    quality: "A",
    responsibleId: "usr-002",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-003",
    code: "LT-2026-003",
    qrCode: "QR-LT-2026-003",
    origin: "Condega",
    variety: "Connecticut",
    supplier: "Tabacos Premium",
    entryDate: "2026-05-20",
    initialWeight: 1650,
    currentWeight: 1600,
    quantityBales: 20,
    currentStage: "reception",
    status: "active",
    quality: "B",
    responsibleId: "usr-003",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-004",
    code: "LT-2026-004",
    qrCode: "QR-LT-2026-004",
    origin: "Ometepe",
    variety: "Criollo",
    supplier: "Cultivos del Valle",
    entryDate: "2026-05-10",
    initialWeight: 1920,
    currentWeight: 1750,
    quantityBales: 28,
    currentStage: "classification",
    status: "active",
    quality: "A",
    responsibleId: "usr-001",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-005",
    code: "LT-2026-005",
    qrCode: "QR-LT-2026-005",
    origin: "Nueva Segovia",
    variety: "Maduro",
    supplier: "Golden Fields",
    entryDate: "2026-05-05",
    initialWeight: 2200,
    currentWeight: 1980,
    quantityBales: 32,
    currentStage: "packaging",
    status: "active",
    quality: "A",
    responsibleId: "usr-002",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-006",
    code: "LT-2026-006",
    qrCode: "QR-LT-2026-006",
    origin: "Matagalpa",
    variety: "Sumatra",
    supplier: "Plantaciones del Sur",
    entryDate: "2026-04-28",
    initialWeight: 1780,
    currentWeight: 1520,
    quantityBales: 22,
    currentStage: "distribution",
    status: "active",
    quality: "B",
    responsibleId: "usr-003",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-007",
    code: "LT-2026-007",
    qrCode: "QR-LT-2026-007",
    origin: "Esteli",
    variety: "Habano",
    supplier: "Tabacalera del Norte",
    entryDate: "2026-04-20",
    initialWeight: 2050,
    currentWeight: 1720,
    quantityBales: 26,
    currentStage: "distribution",
    status: "completed",
    quality: "A",
    responsibleId: "usr-001",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: "lot-008",
    code: "LT-2026-008",
    qrCode: "QR-LT-2026-008",
    origin: "Jalapa",
    variety: "Corojo",
    supplier: "Hojas Selectas S.A.",
    entryDate: "2026-05-22",
    initialWeight: 1550,
    currentWeight: 1550,
    quantityBales: 18,
    currentStage: "reception",
    status: "active",
    quality: "B",
    responsibleId: "usr-002",
    stageHistory: [],
    lastUpdatedAt: new Date().toISOString(),
  },
];

// Generate stage history and movements for all lots
const lotsWithHistory = baseMockLots.map((lot) => ({
  ...lot,
  stageHistory: generateStageHistory(
    lot.id,
    lot.currentStage as Stage,
    lot.entryDate,
  ),
  movements: generateLotMovements(
    lot.id,
    lot.currentStage as Stage,
    lot.entryDate,
  ),
}));

export const mockLots: Lot[] = lotsWithHistory.map((lot) =>
  enrichLot(lot as Lot),
);

// Mock Processes
export const mockProcesses: Process[] = [
  {
    id: "proc-001",
    lotId: "lot-001",
    lotCode: "LT-2026-001",
    stage: "selection",
    status: "in_progress",
    progress: 65,
    operator: "Juan Garcia",
    startDate: "2026-05-28",
    temperature: 28.5,
    humidity: 68,
  },
  {
    id: "proc-002",
    lotId: "lot-002",
    lotCode: "LT-2026-002",
    stage: "classification",
    status: "in_progress",
    progress: 40,
    operator: "Maria Lopez",
    startDate: "2026-05-25",
    temperature: 32.0,
    humidity: 55,
  },
  {
    id: "proc-003",
    lotId: "lot-003",
    lotCode: "LT-2026-003",
    stage: "reception",
    status: "pending",
    progress: 0,
    operator: "Carlos Rodriguez",
    startDate: "2026-06-01",
  },
  {
    id: "proc-004",
    lotId: "lot-004",
    lotCode: "LT-2026-004",
    stage: "classification",
    status: "in_progress",
    progress: 80,
    operator: "Ana Martinez",
    startDate: "2026-05-30",
    temperature: 24.0,
    humidity: 62,
  },
  {
    id: "proc-005",
    lotId: "lot-005",
    lotCode: "LT-2026-005",
    stage: "packaging",
    status: "in_progress",
    progress: 30,
    operator: "Pedro Sanchez",
    startDate: "2026-06-01",
    temperature: 22.0,
    humidity: 58,
  },
];

// Mock Quality Checks
const baseMockQualityChecks: QualityCheck[] = [
  {
    id: "qc-001",
    lotId: "lot-001",
    lotCode: "LT-2026-001",
    stage: "Seleccion",
    grade: "A",
    temperature: 28.5,
    humidity: 68,
    weight: 1720,
    status: "passed",
    date: "2026-06-01",
    inspector: "Fernando Aguilar",
    inspectionStartTime: "2026-06-01T09:00:00",
    inspectionEndTime: "2026-06-01T09:15:00",
    durationMinutes: 15,
    qrVerified: true,
    finalDecision: "aprobar_lote",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: true },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
    evidence: [
      {
        id: "1",
        type: "photo",
        name: "lote_seleccion.jpg",
        url: "https://images.unsplash.com/photo-1598228725387-d4a628003205?w=800",
        uploadedAt: "2026-06-01T09:10:00",
        fileSize: 125000,
        mimeType: "image/jpeg",
      },
      {
        id: "2",
        type: "photo",
        name: "detalle_tabla.jpg",
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
        uploadedAt: "2026-06-01T09:12:00",
        fileSize: 98000,
        mimeType: "image/jpeg",
      },
    ],
  },
  {
    id: "qc-002",
    lotId: "lot-002",
    lotCode: "LT-2026-002",
    stage: "Clasificacion",
    grade: "A",
    temperature: 32.0,
    humidity: 55,
    weight: 2050,
    status: "passed",
    date: "2026-05-31",
    inspector: "Lucia Medina",
    inspectionStartTime: "2026-05-31T10:30:00",
    inspectionEndTime: "2026-05-31T10:48:00",
    durationMinutes: 18,
    qrVerified: true,
    finalDecision: "aprobar_lote",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: true },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
  },
  {
    id: "qc-003",
    lotId: "lot-004",
    lotCode: "LT-2026-004",
    stage: "Clasificacion",
    grade: "B",
    temperature: 24.0,
    humidity: 62,
    weight: 1750,
    status: "passed_with_notes",
    date: "2026-05-30",
    inspector: "Andres Herrera",
    notes: "Humedad ligeramente por encima del rango optimo",
    inspectionStartTime: "2026-05-30T14:15:00",
    inspectionEndTime: "2026-05-30T14:32:00",
    durationMinutes: 17,
    qrVerified: true,
    finalDecision: "aprobar_lote",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: false },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
  },
  {
    id: "qc-004",
    lotId: "lot-005",
    lotCode: "LT-2026-005",
    stage: "Empaque",
    grade: "A",
    temperature: 22.0,
    humidity: 58,
    weight: 1980,
    status: "passed",
    date: "2026-05-29",
    inspector: "Beatriz Rojas",
    inspectionStartTime: "2026-05-29T08:45:00",
    inspectionEndTime: "2026-05-29T09:02:00",
    durationMinutes: 17,
    qrVerified: true,
    finalDecision: "aprobar_lote",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: true },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
  },
  {
    id: "qc-005",
    lotId: "lot-006",
    lotCode: "LT-2026-006",
    stage: "Distribucion",
    grade: "B",
    temperature: 20.5,
    humidity: 60,
    weight: 1520,
    status: "passed",
    date: "2026-05-28",
    inspector: "Fernando Aguilar",
    inspectionStartTime: "2026-05-28T16:20:00",
    inspectionEndTime: "2026-05-28T16:38:00",
    durationMinutes: 18,
    qrVerified: true,
    finalDecision: "aprobar_lote",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: true },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
  },
  {
    id: "qc-006",
    lotId: "lot-007",
    lotCode: "LT-2026-007",
    stage: "Distribucion",
    grade: "A",
    temperature: 21.0,
    humidity: 55,
    weight: 1720,
    status: "passed",
    date: "2026-05-27",
    inspector: "Lucia Medina",
    inspectionStartTime: "2026-05-27T11:00:00",
    inspectionEndTime: "2026-05-27T11:18:00",
    durationMinutes: 18,
    qrVerified: true,
    finalDecision: "aprobar_lote",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: true },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
  },
  {
    id: "qc-007",
    lotId: "lot-003",
    lotCode: "LT-2026-003",
    stage: "Recepcion",
    grade: "C",
    temperature: 26.0,
    humidity: 72,
    weight: 1600,
    status: "failed",
    date: "2026-05-26",
    inspector: "Andres Herrera",
    notes: "Humedad excesiva, requiere secado adicional",
    inspectionStartTime: "2026-05-26T13:30:00",
    inspectionEndTime: "2026-05-26T13:50:00",
    durationMinutes: 20,
    rejectionReasons: ["humedad_excesiva"],
    qrVerified: true,
    finalDecision: "solicitar_correccion",
    checklist: [
      { id: "1", label: "Humedad correcta", passed: false },
      { id: "2", label: "Temperatura correcta", passed: true },
      { id: "3", label: "Peso correcto", passed: true },
      { id: "4", label: "Embalaje correcto", passed: true },
      { id: "5", label: "Etiquetado correcto", passed: true },
      { id: "6", label: "QR legible", passed: true },
    ],
    evidence: [
      {
        id: "1",
        type: "photo",
        name: "lote_humedad.jpg",
        url: "/evidence/lote_humedad.jpg",
        uploadedAt: "2026-05-26T13:45:00",
      },
    ],
  },
];

export const mockQualityChecks: QualityCheck[] =
  baseMockQualityChecks.map(enrichQualityCheck);
export const mockQualityControls = mockQualityChecks;

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: "act-001",
    type: "lot",
    title: "Nuevo lote registrado",
    description: "Se registro el lote LT-2026-008 proveniente de Jalapa",
    date: "2026-06-02T10:30:00",
    user: "Maria Lopez",
    lotCode: "LT-2026-008",
  },
  {
    id: "act-002",
    type: "quality",
    title: "Inspeccion completada",
    description: "Control de calidad aprobado para LT-2026-001",
    date: "2026-06-01T15:45:00",
    user: "Ana Rodriguez",
    lotCode: "LT-2026-001",
  },
  {
    id: "act-003",
    type: "process",
    title: "Proceso iniciado",
    description: "Inicio de empaque para LT-2026-005",
    date: "2026-06-01T09:00:00",
    user: "Juan Garcia",
    lotCode: "LT-2026-005",
  },
  {
    id: "act-004",
    type: "alert",
    title: "Alerta de calidad",
    description: "LT-2026-003 requiere revision - humedad fuera de rango",
    date: "2026-05-31T14:20:00",
    user: "Sistema",
    lotCode: "LT-2026-003",
  },
  {
    id: "act-005",
    type: "process",
    title: "Etapa completada",
    description: "LT-2026-007 completo el proceso de distribucion",
    date: "2026-05-30T16:30:00",
    user: "Carlos Martinez",
    lotCode: "LT-2026-007",
  },
  {
    id: "act-006",
    type: "process",
    title: "Cambio de etapa",
    description: "LT-2026-002 paso de Recepcion a Clasificacion",
    date: "2026-05-29T10:00:00",
    user: "Juan Garcia",
    lotCode: "LT-2026-002",
  },
  {
    id: "act-007",
    type: "quality",
    title: "Inspeccion completada",
    description: "Control de calidad para LT-2026-004 con observaciones",
    date: "2026-05-28T14:00:00",
    user: "Ana Rodriguez",
    lotCode: "LT-2026-004",
  },
];

// Dashboard Stats Data
export const dashboardStats = {
  activeLots: mockLots.filter((l) => l.status === "active").length,
  completedLots: mockLots.filter((l) => l.status === "completed").length,
  pendingProcesses: mockProcesses.filter((p) => p.status === "pending").length,
  qualityApproval: 87,
};

export const mockDashboardStats = {
  lotesActivos: dashboardStats.activeLots,
  lotesProcesados: dashboardStats.completedLots,
  lotesPendientes: dashboardStats.pendingProcesses,
  lotesRechazados: mockLots.filter((l) => l.status === "rejected").length,
  incidencias: mockQualityChecks.filter((q) => q.status === "failed").length,
  calidadAprobada: dashboardStats.qualityApproval,
  produccionSemanal: [12, 15, 18, 14, 20, 8, 11],
  produccionMensual: [48, 52, 57, 61, 66, 72, 75, 79, 84, 88, 93, 97],
};

// Production by stage
export const productionByStage = STAGES.map((stage) => ({
  stage,
  count: mockLots.filter((l) => l.currentStage === stage).length,
}));

// Weekly production data
export const weeklyProductionData = [
  { day: "Lun", value: 12 },
  { day: "Mar", value: 15 },
  { day: "Mie", value: 18 },
  { day: "Jue", value: 14 },
  { day: "Vie", value: 20 },
  { day: "Sab", value: 8 },
];

// Quality distribution
export const qualityDistribution = [
  { grade: "A", count: 45, percentage: 56 },
  { grade: "B", count: 28, percentage: 35 },
  { grade: "C", count: 7, percentage: 9 },
];

// Helper functions
export const getLotById = (id: string) => mockLots.find((l) => l.id === id);
export const getLotByCode = (code: string) =>
  mockLots.find((l) => l.code === code);
export const getProcessByLotId = (lotId: string) =>
  mockProcesses.find((p) => p.lotId === lotId);
export const getQualityChecksByLotId = (lotId: string) =>
  mockQualityChecks.filter((q) => q.lotId === lotId);

const getMovementType = (
  type: Movement["type"],
): NonNullable<Movement["tipo"]> => {
  switch (type) {
    case "stage_change":
      return "etapa";
    case "quality_check":
      return "calidad";
    case "observation":
      return "observacion";
    default:
      return "incidencia";
  }
};

export const mockMovements: Movement[] = mockActivities
  .filter((activity) => activity.lotCode)
  .map((activity) => {
    const lot = mockLots.find((item) => item.code === activity.lotCode);
    return {
      id: activity.id,
      lotId: lot?.id ?? "unknown",
      type:
        activity.type === "lot"
          ? "stage_change"
          : activity.type === "quality"
            ? "quality_check"
            : activity.type === "process"
              ? "stage_change"
              : "incident",
      tipo: getMovementType(
        activity.type === "lot"
          ? "stage_change"
          : activity.type === "quality"
            ? "quality_check"
            : activity.type === "process"
              ? "stage_change"
              : "incident",
      ),
      description: activity.description,
      descripcion: activity.description,
      date: activity.date,
      fecha: new Date(activity.date),
      userId: lot?.responsibleId ?? "system",
      userName: activity.user,
      usuario: { nombre: activity.user },
    };
  });

export const getMovementsByLotId = (lotId: string) =>
  mockMovements.filter((movement) => movement.lotId === lotId);

export const getQualityByLotId = (lotId: string) =>
  getQualityChecksByLotId(lotId);

export const getStagesByLotId = (lotId: string): ProcessStage[] => {
  const lot = getLotById(lotId);
  if (!lot) return [];

  const currentStageIndex = STAGES.indexOf(lot.currentStage);
  if (currentStageIndex === -1) return [];

  const startBase = new Date(lot.entryDate);

  return STAGES.slice(0, currentStageIndex + 1).map((stage, index) => {
    const fechaInicio = new Date(startBase);
    fechaInicio.setDate(startBase.getDate() + index);

    const isCurrentStage =
      index === currentStageIndex && lot.status === "active";
    const fechaFin = isCurrentStage
      ? undefined
      : new Date(fechaInicio.getTime() + 8 * 60 * 60 * 1000).toISOString();

    return {
      id: `${lotId}-${stage}`,
      etapa: stage,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin,
      duracion: fechaFin ? 480 : undefined,
      usuario: getUserSummary(lot.responsibleId),
      observaciones: stage === lot.currentStage ? lot.notes : undefined,
    };
  });
};
