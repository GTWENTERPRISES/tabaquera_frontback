"use client";

import { motion } from "framer-motion";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import type { AppSettings } from "@/hooks/use-settings";

interface ConfiguracionGeneralProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
}

export function ConfiguracionGeneral({ settings, updateSetting }: ConfiguracionGeneralProps) {
  const { setTheme, theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personalice la apariencia del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Tema</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", icon: Sun, label: "Claro" },
                { value: "dark", icon: Moon, label: "Oscuro" },
                { value: "system", icon: Monitor, label: "Sistema" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                    theme === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <t.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Animaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar animaciones de interfaz
                </p>
              </div>
              <Switch
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("animationsEnabled", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Reducir el espaciado de la interfaz
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) =>
                  updateSetting("compactMode", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
