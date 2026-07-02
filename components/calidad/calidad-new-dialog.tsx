"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQualityCheckForm } from "./calidad-new-dialog/use-quality-check-form";
import { TabDatos } from "./calidad-new-dialog/tab-datos";
import { TabChecklist } from "./calidad-new-dialog/tab-checklist";
import { TabEvidencias } from "./calidad-new-dialog/tab-evidencias";
import { TabDecision } from "./calidad-new-dialog/tab-decision";

interface CalidadNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalidadNewDialog({
  open,
  onOpenChange,
}: CalidadNewDialogProps) {
  const {
    form,
    watchStatus,
    checklist,
    evidence,
    inspectionStartTime,
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
  } = useQualityCheckForm();

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nueva Inspección de Calidad</DialogTitle>
          <DialogDescription>
            Registre los resultados de una nueva inspección de calidad
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                // Validar formulario antes de enviar
                const isValid = await form.trigger();
                if (!isValid) {
                  navigateToTabWithErrors();
                  return;
                }

                await onSubmit(data);
                handleClose();
              },
              (errors) => {
                console.log("Validation errors:", errors);
                navigateToTabWithErrors();
              },
            )}
            id="quality-check-form"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mx-4 mt-4 flex overflow-x-auto min-w-max">
                  <TabsTrigger value="datos">Datos Básicos</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="evidencias">Evidencias</TabsTrigger>
                  <TabsTrigger value="decision">Decisión Final</TabsTrigger>
                </TabsList>

                <div className="px-4 pb-4">
                  <TabsContent value="datos" className="mt-4">
                    <TabDatos
                      form={form}
                      lots={lots}
                      inspectionStartTime={inspectionStartTime}
                    />
                  </TabsContent>

                  <TabsContent value="checklist" className="mt-4">
                    <TabChecklist
                      checklist={checklist}
                      onToggleChecklist={handleChecklistToggle}
                    />
                  </TabsContent>

                  <TabsContent value="evidencias" className="mt-4">
                    <TabEvidencias
                      evidence={evidence}
                      uploadingFiles={uploadingFiles}
                      onUploadEvidence={handleEvidenceUpload}
                      onRemoveEvidence={removeEvidence}
                    />
                  </TabsContent>

                  <TabsContent value="decision" className="mt-4">
                    <TabDecision
                      form={form}
                      watchStatus={watchStatus}
                      onToggleRejectionReason={handleRejectionReasonToggle}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <DialogFooter className="flex-shrink-0 p-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="quality-check-form"
                className="gap-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {form.formState.isSubmitting
                  ? "Procesando..."
                  : "Guardar Inspección"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
