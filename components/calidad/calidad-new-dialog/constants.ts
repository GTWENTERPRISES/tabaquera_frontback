import type {
  QualityStatus,
  RejectionReason,
  FinalDecision,
} from "@/lib/types";

export const STATUS_LABELS: Record<QualityStatus, string> = {
  pending: "Pendiente",
  in_progress: "En Inspección",
  passed: "Aprobado",
  passed_with_notes: "Aprobado con Observaciones",
  failed: "Rechazado",
};

export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  humedad_excesiva: "Humedad excesiva",
  dano_fisico: "Daño físico",
  peso_incorrecto: "Peso incorrecto",
  contaminacion: "Contaminación",
  mala_clasificacion: "Mala clasificación",
  otro: "Otro",
};

export const FINAL_DECISION_LABELS: Record<FinalDecision, string> = {
  aprobar_lote: "Aprobar lote",
  rechazar_lote: "Rechazar lote",
  solicitar_correccion: "Solicitar corrección",
  solicitar_reinspeccion: "Solicitar reinspección",
};

export const DEFAULT_CHECKLIST = [
  { id: "1", label: "Humedad correcta", passed: true },
  { id: "2", label: "Temperatura correcta", passed: true },
  { id: "3", label: "Peso correcto", passed: true },
  { id: "4", label: "Embalaje correcto", passed: true },
  { id: "5", label: "Etiquetado correcto", passed: true },
  { id: "6", label: "QR legible", passed: true },
];
