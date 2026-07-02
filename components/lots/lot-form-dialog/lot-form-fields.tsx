"use client";

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
import type { UseFormReturn } from "react-hook-form";
import type { LotFormData } from "./constants";

interface LotFormFieldsProps {
  form: UseFormReturn<LotFormData>;
  proveedores: string[];
  variedades: string[];
  origenes: string[];
  isOptionsLoading: boolean;
}

export function LotFormFields({
  form,
  proveedores,
  variedades,
  origenes,
  isOptionsLoading,
}: LotFormFieldsProps) {
  return (
    <div className="space-y-3 py-2">
      {/* Proveedor */}
      <FormField
        control={form.control}
        name="proveedor"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm">Proveedor</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isOptionsLoading || proveedores.length === 0}
            >
              <FormControl>
                <SelectTrigger className="h-9 text-xs sm:text-sm">
                  <SelectValue
                    placeholder={
                      isOptionsLoading
                        ? "Cargando proveedores..."
                        : "Seleccionar proveedor"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {proveedores.map((proveedor) => (
                  <SelectItem
                    key={proveedor}
                    value={proveedor}
                    className="text-xs sm:text-sm"
                  >
                    {proveedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Origen */}
      <FormField
        control={form.control}
        name="origen"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm">Origen</FormLabel>
            <FormControl>
              <Input
                list="lotes-origenes"
                placeholder="Escribe o selecciona un origen"
                className="h-9 text-xs sm:text-sm"
                {...field}
              />
            </FormControl>
            <datalist id="lotes-origenes">
              {origenes.map((origen) => (
                <option key={origen} value={origen} />
              ))}
            </datalist>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Variedad */}
      <FormField
        control={form.control}
        name="variedad"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm">Variedad</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isOptionsLoading || variedades.length === 0}
            >
              <FormControl>
                <SelectTrigger className="h-9 text-xs sm:text-sm">
                  <SelectValue
                    placeholder={
                      isOptionsLoading
                        ? "Cargando variedades..."
                        : "Seleccionar variedad"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {variedades.map((variedad) => (
                  <SelectItem
                    key={variedad}
                    value={variedad}
                    className="text-xs sm:text-sm"
                  >
                    {variedad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Peso + Cantidad — columna en móvil, 2 cols en sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="peso"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm">Peso (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cantidadBultos"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm">
                Cantidad de Bultos
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Calidad */}
      <FormField
        control={form.control}
        name="calidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm">Calidad</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Seleccionar calidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="A" className="text-xs sm:text-sm">
                  A
                </SelectItem>
                <SelectItem value="B" className="text-xs sm:text-sm">
                  B
                </SelectItem>
                <SelectItem value="C" className="text-xs sm:text-sm">
                  C
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Observaciones */}
      <FormField
        control={form.control}
        name="observaciones"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm">
              Observaciones (opcional)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas adicionales sobre el lote..."
                className="resize-none text-xs sm:text-sm min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
