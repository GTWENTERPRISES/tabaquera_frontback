"use client";

import { Thermometer, Droplets, Scale, Clock } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_LABELS } from "./constants";
import type { UseFormReturn } from "react-hook-form";
import type { QualityCheckFormData } from "./use-quality-check-form";
import type { Lot } from "@/lib/types";

interface TabDatosProps {
  form: UseFormReturn<QualityCheckFormData>;
  lots: Lot[];
  inspectionStartTime: string | null;
}

export function TabDatos({ form, lots, inspectionStartTime }: TabDatosProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="lotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lote *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar lote" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.code}
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
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etapa de Inspección *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="recepcion">Recepcion</SelectItem>
                  <SelectItem value="clasificacion">Clasificacion</SelectItem>
                  <SelectItem value="seleccion">Seleccion</SelectItem>
                  <SelectItem value="empaque">Empaque</SelectItem>
                  <SelectItem value="distribucion">Distribucion</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-destructive" />
                Temperatura (C) *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="25.5"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="humidity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-chart-2" />
                Humedad (%) *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="65"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                Peso (kg) *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grado de Calidad *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">Grado A - Excelente</SelectItem>
                  <SelectItem value="B">Grado B - Bueno</SelectItem>
                  <SelectItem value="C">Grado C - Aceptable</SelectItem>
                  <SelectItem value="D">Grado D - Deficiente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de Calidad *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
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
        name="qrVerified"
        render={({ field }) => (
          <FormItem className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1">
              <FormLabel>Validación QR</FormLabel>
              <p className="text-sm text-muted-foreground">
                Verificar que el QR del lote sea legible
              </p>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <Badge variant={field.value ? "default" : "destructive"}>
              {field.value ? "Verificado" : "No verificado"}
            </Badge>
          </FormItem>
        )}
      />

      {inspectionStartTime && (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium">
              Inicio de inspección:{" "}
              {new Date(inspectionStartTime).toLocaleTimeString("es-ES")}
            </p>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas y observaciones de la inspección..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
