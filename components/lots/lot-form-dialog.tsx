"use client";

import { Loader2 } from "lucide-react";
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
import { useLotForm } from "./lot-form-dialog/use-lot-form";
import { LotFormFields } from "./lot-form-dialog/lot-form-fields";

interface LotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LotFormDialog({ open, onOpenChange }: LotFormDialogProps) {
  const {
    form,
    isLoading,
    isOptionsLoading,
    proveedores,
    variedades,
    origenes,
    onSubmit,
  } = useLotForm();

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true);
          return;
        }

        handleClose();
      }}
    >
      {/* Modal más ancho en desktop, full-width menos margen en móvil */}
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            Registrar Nuevo Lote
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Ingresa los datos del nuevo lote de tabaco
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                const success = await onSubmit(data);
                if (success) {
                  handleClose();
                }
              })}
              id="lot-form"
            >
              <LotFormFields
                form={form}
                proveedores={proveedores}
                variedades={variedades}
                origenes={origenes}
                isOptionsLoading={isOptionsLoading}
              />
            </form>
          </Form>
        </div>

        {/* Footer siempre visible fuera del scroll */}
        <DialogFooter className="shrink-0 flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto text-xs sm:text-sm h-9"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="lot-form"
            disabled={isLoading || isOptionsLoading}
            className="w-full sm:w-auto text-xs sm:text-sm h-9"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Lote"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
