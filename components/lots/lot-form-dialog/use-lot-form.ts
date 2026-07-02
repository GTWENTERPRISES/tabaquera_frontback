"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLots } from "@/contexts/lot-context";
import { useAuth } from "@/contexts/auth-context";
import { lotSchema, type LotFormData } from "./constants";
import { api } from "@/services/api";
import { toast } from "sonner";

export function useLotForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [proveedores, setProveedores] = useState<string[]>([]);
  const [variedades, setVariedades] = useState<string[]>([]);
  const { addLot, lots } = useLots();
  const { user } = useAuth();

  const form = useForm<LotFormData>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      proveedor: "",
      peso: 0,
      origen: "",
      variedad: "",
      cantidadBultos: 0,
      calidad: "A",
      observaciones: "",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      setIsOptionsLoading(true);
      try {
        const [apiProveedores, apiVariedades] = await Promise.all([
          api.getAllProveedores(),
          api.getAllVariedadesTabaco(),
        ]);

        setProveedores(
          apiProveedores.map((proveedor) => proveedor.nombre).filter(Boolean),
        );
        setVariedades(
          apiVariedades.map((variedad) => variedad.nombre).filter(Boolean),
        );
      } catch (error) {
        console.error("Error al cargar catálogos del lote:", error);
        toast.error("No se pudieron cargar proveedores y variedades.");
        setProveedores([]);
        setVariedades([]);
      } finally {
        setIsOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

  const origenes = useMemo(
    () =>
      Array.from(
        new Set(lots.map((lot) => lot.origin).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [lots],
  );

  const onSubmit = async (data: LotFormData) => {
    setIsLoading(true);
    try {
      await addLot({
        supplier: data.proveedor,
        proveedor: data.proveedor,
        currentWeight: data.peso,
        peso: data.peso,
        initialWeight: data.peso,
        origin: data.origen,
        variety: data.variedad,
        quantityBales: data.cantidadBultos,
        quality: data.calidad,
        responsibleId: user?.id || "system",
        entryDate: new Date().toISOString(),
        notes: data.observaciones,
        observaciones: data.observaciones,
      });
      toast.success("Lote registrado exitosamente");
      return true;
    } catch (error) {
      console.error("Error al crear lote:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error al registrar el lote. Por favor, intente nuevamente.";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isOptionsLoading,
    proveedores,
    variedades,
    origenes,
    onSubmit,
  };
}
