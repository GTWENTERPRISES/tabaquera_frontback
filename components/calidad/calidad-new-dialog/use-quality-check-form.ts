import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLots } from "@/contexts/lot-context";
import { useAuth } from "@/contexts/auth-context";
import type {
  QualityLevel,
  QualityStatus,
  FinalDecision,
  RejectionReason,
  ChecklistItem,
  Evidence,
} from "@/lib/types";
import { DEFAULT_CHECKLIST } from "./constants";

// Schema de validación
export const qualityCheckSchema = z.object({
  lotId: z.string().min(1, "Selecciona un lote"),
  stage: z.string().min(1, "Selecciona una etapa de inspección"),
  temperature: z.coerce
    .number()
    .min(-50, "Temperatura inválida")
    .max(100, "Temperatura inválida"),
  humidity: z.coerce
    .number()
    .min(0, "La humedad debe ser mayor a 0")
    .max(100, "La humedad no puede superar 100%"),
  weight: z.coerce.number().min(0.1, "El peso debe ser mayor a 0"),
  grade: z.string().min(1, "Selecciona un grado de calidad"),
  status: z.string().min(1, "Selecciona un estado de calidad"),
  notes: z.string().optional(),
  rejectionReasons: z.array(z.string()).optional(),
  qrVerified: z.boolean(),
  finalDecision: z.string().min(1, "Selecciona una decisión final"),
});

export type QualityCheckFormData = z.infer<typeof qualityCheckSchema>;

export function useQualityCheckForm() {
  const { lots, addQualityCheck } = useLots();
  const { user } = useAuth();

  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [inspectionStartTime, setInspectionStartTime] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("datos");
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const form = useForm<QualityCheckFormData>({
    resolver: zodResolver(qualityCheckSchema),
    defaultValues: {
      lotId: "",
      stage: "",
      temperature: 0,
      humidity: 0,
      weight: 0,
      grade: "A",
      status: "pending",
      notes: "",
      rejectionReasons: [],
      qrVerified: true,
      finalDecision: "aprobar_lote",
    },
  });

  // Observar cambios en el estado para mostrar/ocultar motivos de rechazo
  const watchStatus = form.watch("status");

  const resetForm = useCallback(() => {
    setInspectionStartTime(new Date().toISOString());
    form.reset();
    setChecklist(DEFAULT_CHECKLIST);
    setEvidence([]);
    setActiveTab("datos");
  }, [form]);

  const handleChecklistToggle = useCallback((id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, passed: !item.passed } : item,
      ),
    );
  }, []);

  const handleRejectionReasonToggle = useCallback(
    (reason: RejectionReason) => {
      const currentReasons = form.getValues("rejectionReasons") || [];
      const newReasons = currentReasons.includes(reason)
        ? currentReasons.filter((r) => r !== reason)
        : [...currentReasons, reason];
      form.setValue("rejectionReasons", newReasons);
    },
    [form],
  );

  const handleEvidenceUpload = useCallback(
    async (files: FileList | null, type: "photo" | "document") => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const fileId = `evidence-${Date.now()}`;

      // Mark as uploading
      setUploadingFiles((prev) => new Set([...prev, fileId]));

      try {
        // Simular upload a backend (en producción reemplazar por llamada real)
        const formData = new FormData();
        formData.append("file", file);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Crear objeto evidence con datos reales del archivo
        const newEvidence: Evidence = {
          id: fileId,
          type,
          name: file.name,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
        };

        setEvidence((prev) => [...prev, newEvidence]);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        // Mark as done
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    },
    [],
  );

  const removeEvidence = useCallback((id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const onSubmit = async (data: QualityCheckFormData) => {
    const lot = lots.find((l) => l.id === data.lotId);
    if (!lot) return;

    const endTime = new Date();
    const durationMinutes = inspectionStartTime
      ? Math.round(
          (endTime.getTime() - new Date(inspectionStartTime).getTime()) / 60000,
        )
      : undefined;

    // Map frontend status to backend estado_calidad
    const statusMap: Record<QualityStatus, string> = {
      pending: 'pendiente',
      in_progress: 'en_inspeccion',
      passed: 'aprobado',
      passed_with_notes: 'aprobado_con_observaciones',
      failed: 'rechazado',
    };

    // Map rejection reason
    const rejectionReasonMap: Record<string, any> = {
      'humedad_excesiva': 'humedad_excesiva',
      'danos_fisicos': 'danos_fisicos',
      'peso_incorrecto': 'peso_incorrecto',
      'contaminacion': 'contaminacion',
      'mala_clasificacion': 'mala_clasificacion',
      'otro': 'otro',
    };

    await addQualityCheck({
      lote: parseInt(data.lotId),
      etapa: 1, // TODO: Map stage name to stage ID
      estado_calidad: statusMap[data.status as QualityStatus] as any,
      grado_calidad: data.grade as any,
      temperatura: data.temperature,
      humedad: data.humidity,
      peso_kg: data.weight,
      observaciones: data.notes,
      fecha_hora_inicio: inspectionStartTime || new Date().toISOString(),
      fecha_hora_fin: endTime.toISOString(),
      duracion_minutos: durationMinutes,
      qr_verificado: data.qrVerified,
      motivo_rechazo: data.rejectionReasons?.[0] ? rejectionReasonMap[data.rejectionReasons[0]] : 'ninguno',
      // TODO: Map checklist items to the boolean checks (temperatura_correcta, humedad_correcta, etc.)
      temperatura_correcta: checklist.find(c => c.id === 'temperature')?.passed ?? true,
      humedad_correcta: checklist.find(c => c.id === 'humidity')?.passed ?? true,
      peso_correcto: checklist.find(c => c.id === 'weight')?.passed ?? true,
      embalaje_correcto: checklist.find(c => c.id === 'packaging')?.passed ?? true,
      etiquetado_correcto: checklist.find(c => c.id === 'labeling')?.passed ?? true,
      qr_legible: checklist.find(c => c.id === 'qr')?.passed ?? true,
    });

    form.reset();
    setEvidence([]);
    setInspectionStartTime(null);
  };

  // Función para navegar a tab con error
  const navigateToTabWithErrors = () => {
    const errors = form.formState.errors;
    if (
      errors.lotId ||
      errors.stage ||
      errors.temperature ||
      errors.humidity ||
      errors.weight ||
      errors.grade ||
      errors.status ||
      errors.qrVerified
    ) {
      setActiveTab("datos");
      return "datos";
    }
    if (errors.finalDecision) {
      setActiveTab("decision");
      return "decision";
    }
    return null;
  };

  return {
    form,
    watchStatus,
    checklist,
    setChecklist,
    evidence,
    setEvidence,
    inspectionStartTime,
    setInspectionStartTime,
    activeTab,
    setActiveTab,
    lots,
    handleChecklistToggle,
    handleRejectionReasonToggle,
    handleEvidenceUpload,
    removeEvidence,
    onSubmit,
    resetForm,
    uploadingFiles,
    navigateToTabWithErrors,
  };
}
