// Stage Types
export type Stage =
  | "reception"
  | "classification"
  | "selection"
  | "packaging"
  | "distribution";

export type LotStatus =
  | "active"
  | "completed"
  | "on_hold"
  | "rejected"
  | "in_production"
  | "waiting";

export type ProcessStatus = "pending" | "in_progress" | "completed" | "paused";

export type QualityStatus =
  | "pending"
  | "in_progress"
  | "passed"
  | "passed_with_notes"
  | "failed";

export type QualityLevel = "A" | "B" | "C" | "D";

export type FinalDecision =
  | "aprobar_lote"
  | "rechazar_lote"
  | "solicitar_correccion"
  | "solicitar_reinspeccion";

export interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
}

export type UserRole = "admin" | "supervisor" | "operator" | "quality";
export type LegacyUserRole =
  | "administrador"
  | "supervisor"
  | "operario"
  | "calidad";
export type LegacyLotState =
  | Stage
  | "completado"
  | "rechazado"
  | "en_espera"
  | "en_produccion";

// User Types
export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  nombre?: string;
  username?: string;
  email: string;
  phone?: string;
  role: UserRole;
  rol?: LegacyUserRole;
  avatar?: string;
  department: string;
  status?: "active" | "inactive";
  active: boolean;
  createdAt: Date | string;
  lastAccess?: Date | string;
}

// Lot Movement - MOVIMIENTO PRINCIPAL (corazón del sistema)
export interface LotMovement {
  id: string;
  lotId: string;
  fromStage?: Stage;
  toStage?: Stage;
  userId: string;
  userName: string;
  userRole?: string;
  startedAt?: string;
  completedAt?: string;
  // Pausas
  pausedAt?: string;
  resumedAt?: string;
  totalPausedMinutes?: number;
  // Tiempo real
  durationMinutes?: number;
  // Retraso
  isDelayed?: boolean;
  delayReason?: DelayReason;
  // Observaciones y cantidad
  observations?: string;
  quantityReceived?: number;
  // Evidencia
  evidence?: Evidence[];
  createdAt?: string;
}

// Lot Stage History - Registro completo de cada etapa
export interface LotStageHistory {
  id: string;
  lotId: string;
  stage: Stage;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  responsibleUserId: string;
  responsibleUserName: string;
  observations?: string;
  observaciones?: string;
}

// Lot Types
export interface Lot {
  id: string;
  code: string;
  codigo?: string;
  qrCode: string;
  origin: string;
  variety: string;
  supplier: string;
  proveedor?: string;
  entryDate: string;
  fechaIngreso?: string;
  initialWeight: number;
  currentWeight: number;
  peso?: number;
  quantityBales: number;
  currentStage: Stage;
  status: LotStatus;
  estado?: LegacyLotState;
  quality: string;
  notes?: string;
  observaciones?: string;
  responsibleId: string;
  responsable?: {
    nombre: string;
  };
  // Nuevos campos para trazabilidad avanzada
  stageHistory: LotStageHistory[];
  movements: LotMovement[];
  lastUpdatedAt: string;
  totalTimeMinutes?: number;
}

// Process Types
export interface Process {
  id: string;
  lotId: string;
  lotCode: string;
  stage: Stage;
  status: ProcessStatus;
  progress: number;
  operator: string;
  startDate: string;
  endDate?: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
}

// Rejection Reasons - Tipos de motivos de rechazo
export type RejectionReason =
  | "humedad_excesiva"
  | "dano_fisico"
  | "peso_incorrecto"
  | "contaminacion"
  | "mala_clasificacion"
  | "otro";

// Delay Reason - Tipos de motivos de retraso
export type DelayReason =
  | "machinery"
  | "personnel"
  | "raw_material"
  | "quality"
  | "other";

// Evidence Type - Tipo de evidencia (fotos/documentos
export interface Evidence {
  id: string;
  lotId?: string;
  movementId?: string;
  type: "photo" | "document";
  url: string;
  name?: string;
  fileName?: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileSize?: number;
  mimeType?: string;
}

// Quality Check Types
export interface QualityCheck {
  id: string;
  lotId: string;
  lotCode: string;
  stage: string;
  grade: QualityLevel;
  temperature: number;
  humidity: number;
  weight?: number;
  status: QualityStatus;
  resultado?:
    | "pendiente"
    | "en_inspeccion"
    | "aprobado"
    | "aprobado_con_observaciones"
    | "rechazado";
  date: string;
  fechaInspeccion?: string;
  inspector: string;
  inspectorData?: {
    nombre: string;
  };
  notes?: string;
  observaciones?: string;
  // New fields
  inspectionStartTime?: string;
  inspectionEndTime?: string;
  durationMinutes?: number;
  rejectionReasons?: RejectionReason[];
  evidence?: Evidence[];
  checklist?: ChecklistItem[];
  qrVerified?: boolean;
  finalDecision?: FinalDecision;
}

// Movement Types
export interface Movement {
  id: string;
  lotId: string;
  type: "stage_change" | "quality_check" | "observation" | "incident";
  tipo?: "etapa" | "calidad" | "observacion" | "incidencia";
  description: string;
  descripcion?: string;
  date: string;
  fecha?: Date;
  userId: string;
  userName: string;
  usuario?: {
    nombre: string;
  };
  fromStage?: Stage;
  toStage?: Stage;
  details?: Record<string, unknown>;
}

export interface ProcessStage {
  id: string;
  etapa: Stage;
  fechaInicio: string;
  fechaFin?: string;
  duracion?: number;
  usuario?: {
    nombre: string;
  };
  observaciones?: string;
}

// Observation Types - Comentarios por movimiento
export interface Observation {
  id: string;
  lotId: string;
  lotCode: string;
  stage: Stage;
  text: string;
  date: string;
  userId: string;
  userName: string;
}

// System Event - Registro global de actividad del sistema
export interface SystemEvent {
  id: string;
  lotId?: string;
  lotCode?: string;
  action: string;
  detail: string;
  date: string;
  userId: string;
  userName: string;
  type: "lot" | "quality" | "stage" | "user" | "observation" | "alert";
}

// Activity Types
export interface Activity {
  id: string;
  type: "lot" | "quality" | "process" | "user" | "alert";
  title: string;
  description: string;
  date: string;
  user: string;
  lotCode?: string;
}

// Dashboard Stats
export interface DashboardStats {
  activeLots: number;
  processedLots: number;
  pendingLots: number;
  rejectedLots: number;
  incidents: number;
  qualityApproved: number;
  weeklyProduction: number[];
  monthlyProduction: number[];
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: NavItem[];
}

// Filter Types
export interface LotFilters {
  status?: LotStatus[];
  stage?: Stage[];
  origin?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  estado?: LegacyLotState[];
  proveedor?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}

export interface QualityFilters {
  status?: QualityStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  inspector?: string;
}

// Notification Types
export type NotificationType = "info" | "warning" | "critical";
export type NotificationCategory = "lot" | "quality" | "user" | "alert" | "production" | "admin";

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  userId: string;
  lotId?: string;
  lotCode?: string;
  targetUserId?: string;
  actionUrl?: string;
  meta?: Record<string, unknown>;
}
