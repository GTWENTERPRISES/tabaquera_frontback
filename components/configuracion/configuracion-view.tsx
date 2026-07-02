"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { ConfiguracionGeneral } from "./configuracion-general";
import { ConfiguracionSeguridad } from "./configuracion-seguridad";
import { ConfiguracionEmpresa } from "./configuracion-empresa";

export function ConfiguracionView() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Administre las preferencias y configuración del sistema
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full max-w-lg overflow-x-auto flex">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <ConfiguracionGeneral
            settings={settings}
            updateSetting={updateSetting}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <ConfiguracionSeguridad />
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <ConfiguracionEmpresa
            settings={settings}
            updateSetting={updateSetting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
