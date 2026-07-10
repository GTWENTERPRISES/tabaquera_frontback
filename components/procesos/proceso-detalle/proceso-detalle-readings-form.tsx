"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Thermometer, Droplets, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { api } from "@/services/api";
import { toast } from "sonner";

const readingsSchema = z.object({
  temperature: z.coerce
    .number()
    .min(15, "Temperatura debe ser al menos 15°C")
    .max(35, "Temperatura debe ser maximo 35°C"),
  humidity: z.coerce
    .number()
    .min(40, "Humedad debe ser al menos 40%")
    .max(80, "Humedad debe ser maximo 80%"),
  notes: z.string().optional(),
});

type ReadingsFormValues = z.infer<typeof readingsSchema>;

interface ProcesoDetalleReadingsFormProps {
  /** ID of the lot these readings belong to */
  lotId?: string;
}

export function ProcesoDetalleReadingsForm({ lotId }: ProcesoDetalleReadingsFormProps) {
  const form = useForm<ReadingsFormValues>({
    resolver: zodResolver(readingsSchema),
    defaultValues: {
      temperature: 0,
      humidity: 0,
      notes: "",
    },
  });

  const onSubmit = async (data: ReadingsFormValues) => {
    if (!lotId) {
      toast.error("No se identificó el lote para guardar las lecturas");
      return;
    }

    try {
      // Persist the reading as an observation on the lot
      const contenido = [
        `Temperatura: ${data.temperature}°C`,
        `Humedad: ${data.humidity}%`,
        data.notes ? `Notas: ${data.notes}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      await api.createObservacion({
        lote: parseInt(lotId),
        tipo: "nota",
        contenido,
      });

      toast.success("Lectura guardada correctamente");
      form.reset();
    } catch (error) {
      console.error("Error guardando lectura:", error);
      toast.error("Error al guardar la lectura. Intente nuevamente.");
    }
  };

  return (
    <Card className="border-0 shadow-sm w-full">
      <CardHeader>
        <CardTitle>Registrar Lecturas</CardTitle>
        <CardDescription>Registre las condiciones actuales del proceso</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="space-y-2 w-full">
                  <FormLabel className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-destructive" />
                    Temperatura (C)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="15"
                      max="35"
                      placeholder="25.5"
                      {...field}
                      value={field.value || ""}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="humidity"
              render={({ field }) => (
                <FormItem className="space-y-2 w-full">
                  <FormLabel className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-chart-2" />
                    Humedad (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="40"
                      max="80"
                      placeholder="65"
                      {...field}
                      value={field.value || ""}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 space-y-2 w-full">
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el proceso..."
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2 w-full">
              <Button type="submit" className="w-full gap-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Guardar Lectura
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
