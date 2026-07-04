"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import type { Lot } from "@/lib/types";
import { SUPPLIERS, VARIETIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scrollPositions } from "@/components/ScrollRestoration";
import { api } from "@/services/api";
import { toast } from "sonner";

const lotSchema = z.object({
  code: z
    .string()
    .min(6, "El código debe tener al menos 6 caracteres")
    .regex(/^LT-\d{4}-\d{3,}$/, "Formato inválido. Ejemplo: LT-2026-001"),
  supplier: z.string().min(1, "Selecciona un proveedor"),
  entryDate: z.string().min(1, "Selecciona una fecha de ingreso"),
  currentWeight: z.coerce
    .number({ invalid_type_error: "Ingresa un peso válido" })
    .min(1, "El peso debe ser mayor a 0 kg")
    .max(100000, "El peso no puede superar 100,000 kg"),
  quantityBales: z.coerce
    .number({ invalid_type_error: "Ingresa una cantidad válida" })
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad de bultos debe ser al menos 1")
    .max(10000, "La cantidad no puede superar 10,000 bultos"),
  variety: z.string().min(1, "Selecciona el tipo de tabaco"),
  notes: z
    .string()
    .max(500, "Las observaciones no pueden superar 500 caracteres")
    .optional(),
});

type LotFormValues = z.infer<typeof lotSchema>;

interface LotFormProps {
  initialValues?: Partial<Lot>;
  submitLabel?: string;
}

export function LotForm({
  initialValues,
  submitLabel = "Guardar Lote",
}: LotFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const defaultValues = useMemo<LotFormValues>(
    () => ({
      code: initialValues?.code ?? "LT-2026-009",
      supplier: initialValues?.supplier ?? "",
      entryDate:
        initialValues?.entryDate ?? new Date().toISOString().slice(0, 10),
      currentWeight: initialValues?.currentWeight ?? 0,
      quantityBales: initialValues?.quantityBales ?? 1,
      variety: initialValues?.variety ?? "",
      notes: initialValues?.notes ?? "",
    }),
    [initialValues],
  );

  const handleCancel = () => {
    // Save scroll position before navigating back
    scrollPositions.set(currentUrl, window.scrollY);
    router.back();
  };

  const form = useForm<LotFormValues>({
    resolver: zodResolver(lotSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;
  const currentCode = form.watch("code");

  const onSubmit = async (data: LotFormValues) => {
    try {
      if (initialValues?.id) {
        // Actualizar lote existente
        const proveedores = await api.getProveedores();
        const variedades = await api.getVariedadesTabaco();

        const proveedor = proveedores.results.find(p => p.nombre === data.supplier);
        const variedad = variedades.results.find(v => v.nombre === data.variety);

        if (!proveedor || !variedad) {
          toast.error("Error: Proveedor o variedad no encontrados");
          return;
        }

        await api.updateLote(parseInt(initialValues.id), {
          proveedor_id: proveedor.id,
          variedad_id: variedad.id,
          peso_actual_kg: data.currentWeight,
          cantidad_bultos: data.quantityBales,
          fecha_ingreso: data.entryDate,
          observaciones_iniciales: data.notes || '',
        });
        toast.success("Lote actualizado exitosamente");
      }
      router.push("/dashboard/lotes");
    } catch (error) {
      console.error("Error al guardar lote:", error);
      toast.error("Error al guardar el lote. Por favor, intente nuevamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codigo del lote</FormLabel>
                <FormControl>
                  <Input placeholder="LT-2026-001" {...field} disabled={!!initialValues?.id} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Codigo QR generado</FormLabel>
            <Input value={`QR-${currentCode || "LT-2026-001"}`} readOnly />
          </div>
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUPPLIERS.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="entryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de ingreso</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="1500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantityBales"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad de bultos</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="variety"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de tabaco</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de tabaco" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VARIETIES.map((variety) => (
                      <SelectItem key={variety} value={variety}>
                        {variety}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-28 resize-none"
                  placeholder="Notas del lote..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
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
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
