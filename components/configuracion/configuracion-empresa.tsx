"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building, Mail, Phone, MapPin, Database, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import type { AppSettings } from "@/hooks/use-settings";

interface ConfiguracionEmpresaProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
}

export function ConfiguracionEmpresa({
  settings,
  updateSetting,
}: ConfiguracionEmpresaProps) {
  const { saveSettings, saving } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const updateCompanySetting = (
    field: keyof AppSettings["companySettings"],
    value: string | number,
  ) => {
    updateSetting("companySettings", {
      ...settings.companySettings,
      [field]: value,
    });
  };

  const updateProductionParam = (
    field: keyof AppSettings["productionParams"],
    value: number,
  ) => {
    updateSetting("productionParams", {
      ...settings.productionParams,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveSettings(settings);
    setIsSaving(false);
    if (result.success) {
      toast.success("Configuración guardada", {
        description: "Los datos de la empresa se han guardado correctamente",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>Datos generales de la organización</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la Empresa</Label>
              <Input
                value={settings.companySettings.companyName}
                onChange={(e) =>
                  updateCompanySetting("companyName", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>RUC / NIT</Label>
              <Input
                value={settings.companySettings.taxId}
                onChange={(e) => updateCompanySetting("taxId", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección
            </Label>
            <Textarea
              value={settings.companySettings.address}
              onChange={(e) => updateCompanySetting("address", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                value={settings.companySettings.phone}
                onChange={(e) => updateCompanySetting("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Corporativo
              </Label>
              <Input
                value={settings.companySettings.email}
                onChange={(e) => updateCompanySetting("email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Parámetros de Producción
          </CardTitle>
          <CardDescription>
            Configure los parámetros por defecto del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Temperatura Mínima (°C)</Label>
              <Input
                type="number"
                value={settings.productionParams.minTemp}
                onChange={(e) =>
                  updateProductionParam("minTemp", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Temperatura Máxima (°C)</Label>
              <Input
                type="number"
                value={settings.productionParams.maxTemp}
                onChange={(e) =>
                  updateProductionParam("maxTemp", Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Humedad Mínima (%)</Label>
              <Input
                type="number"
                value={settings.productionParams.minHumidity}
                onChange={(e) =>
                  updateProductionParam("minHumidity", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Humedad Máxima (%)</Label>
              <Input
                type="number"
                value={settings.productionParams.maxHumidity}
                onChange={(e) =>
                  updateProductionParam("maxHumidity", Number(e.target.value))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || saving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving || saving ? "Guardando..." : "Guardar Datos"}
        </Button>
      </div>
    </motion.div>
  );
}
