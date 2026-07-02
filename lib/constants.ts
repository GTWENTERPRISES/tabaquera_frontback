import type {
  Stage,
  LotStatus,
  ProcessStatus,
  QualityStatus,
  UserRole,
} from "./types";

export const STAGES: Stage[] = [
  "reception",
  "classification",
  "selection",
  "packaging",
  "distribution",
];

export const STAGE_LABELS: Record<Stage, string> = {
  reception: "Recepción",
  classification: "Clasificación",
  selection: "Selección",
  packaging: "Empaque",
  distribution: "Distribución",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operator: "Operario",
  quality: "Control de Calidad",
};

export const STAGE_COLORS: Record<Stage, string> = {
  reception: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  classification: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  selection: "bg-accent/10 text-accent border-accent/20",
  packaging: "bg-primary/10 text-primary border-primary/20",
  distribution: "bg-success/10 text-success border-success/20",
};

export const LOT_STATUS_CONFIG: Record<
  | LotStatus
  | Stage
  | "completado"
  | "rechazado"
  | "en_espera"
  | "en_produccion"
  | "pending"
  | "finalizado",
  { label: string; color: string; bgColor: string }
> = {
  active: {
    label: "Activo",
    color: "text-primary border-primary/20",
    bgColor: "bg-primary/10",
  },
  completed: {
    label: "Completado",
    color: "text-success border-success/20",
    bgColor: "bg-success/10",
  },
  on_hold: {
    label: "En Espera",
    color: "text-accent border-accent/20",
    bgColor: "bg-accent/10",
  },
  rejected: {
    label: "Rechazado",
    color: "text-destructive border-destructive/20",
    bgColor: "bg-destructive/10",
  },
  in_production: {
    label: "En Producción",
    color: "text-chart-2 border-chart-2/20",
    bgColor: "bg-chart-2/10",
  },
  waiting: {
    label: "En Espera",
    color: "text-warning border-warning/20",
    bgColor: "bg-warning/10",
  },
  reception: {
    label: "Recepcion",
    color: "text-chart-1 border-chart-1/20",
    bgColor: "bg-chart-1/10",
  },
  classification: {
    label: "Clasificacion",
    color: "text-chart-4 border-chart-4/20",
    bgColor: "bg-chart-4/10",
  },
  selection: {
    label: "Seleccion",
    color: "text-accent border-accent/20",
    bgColor: "bg-accent/10",
  },
  packaging: {
    label: "Empaque",
    color: "text-primary border-primary/20",
    bgColor: "bg-primary/10",
  },
  distribution: {
    label: "Distribucion",
    color: "text-success border-success/20",
    bgColor: "bg-success/10",
  },
  completado: {
    label: "Completado",
    color: "text-success border-success/20",
    bgColor: "bg-success/10",
  },
  rechazado: {
    label: "Rechazado",
    color: "text-destructive border-destructive/20",
    bgColor: "bg-destructive/10",
  },
  en_espera: {
    label: "En Espera",
    color: "text-warning border-warning/20",
    bgColor: "bg-warning/10",
  },
  en_produccion: {
    label: "En Producción",
    color: "text-chart-2 border-chart-2/20",
    bgColor: "bg-chart-2/10",
  },
  // Estados del backend Django
  pending: {
    label: "Pendiente",
    color: "text-muted-foreground border-muted/20",
    bgColor: "bg-muted/10",
  },
  finalizado: {
    label: "Finalizado",
    color: "text-success border-success/20",
    bgColor: "bg-success/10",
  },
};

export const PROCESS_STATUS_CONFIG: Record<
  ProcessStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground" },
  in_progress: {
    label: "En Proceso",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  completed: {
    label: "Completado",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  paused: {
    label: "Pausado",
    color: "bg-warning/10 text-warning border-warning/20",
  },
};

export const QUALITY_STATUS_CONFIG: Record<
  QualityStatus,
  { label: string; color: string }
> = {
  passed: {
    label: "Aprobado",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  passed_with_notes: {
    label: "Observaciones",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  failed: {
    label: "Rechazado",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  pending: {
    label: "Pendiente",
    color: "bg-muted/50 text-muted-foreground border-muted/50",
  },
  in_progress: {
    label: "En Inspección",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export const USER_ROLES_CONFIG: Record<
  UserRole,
  { label: string; color: string; description: string }
> = {
  admin: {
    label: "Administrador",
    color: "text-primary",
    description: "Acceso total al sistema",
  },
  supervisor: {
    label: "Supervisor",
    color: "text-chart-2",
    description: "Seguimiento productivo",
  },
  operator: {
    label: "Operador",
    color: "text-accent",
    description: "Ejecucion de actividades",
  },
  quality: {
    label: "Control de Calidad",
    color: "text-chart-4",
    description: "Inspecciones de calidad",
  },
};

export const ORIGINS = [
  "Esteli",
  "Jalapa",
  "Condega",
  "Ometepe",
  "Nueva Segovia",
  "Matagalpa",
];

export const VARIETIES = [
  "Corojo",
  "Criollo",
  "Habano",
  "Connecticut",
  "Maduro",
  "Sumatra",
];

export const SUPPLIERS = [
  "Tabacalera del Norte",
  "Hojas Selectas S.A.",
  "Tabacos Premium",
  "Cultivos del Valle",
  "Golden Fields",
  "Plantaciones del Sur",
];

export const PRODUCTION_STAGES = STAGES;
export const PROVEEDORES = SUPPLIERS;

// Rejection Reasons Configuration
export const REJECTION_REASONS: Record<
  string,
  { label: string; color: string }
> = {
  humidity: { label: "Humedad", color: "text-destructive" },
  color: { label: "Color", color: "text-chart-4" },
  damage: { label: "Daños", color: "text-accent" },
  size: { label: "Tamaño", color: "text-chart-1" },
  odor: { label: "Olor", color: "text-chart-2" },
  other: { label: "Otros", color: "text-muted-foreground" },
};

export const APP_CONFIG = {
  name: "Golden Trace",
  description: "Sistema de Trazabilidad Industrial",
  company: "Golden Leaf",
  version: "2.0.0",
};
