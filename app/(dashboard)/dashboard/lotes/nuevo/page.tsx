"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotForm } from "@/components/lots/lot-form";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BackButton from "@/components/BackButton";

export default function NuevoLotePage() {
  const { hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission(["administrador", "supervisor"])) {
      router.push("/dashboard/lotes");
    }
  }, [hasPermission, router]);

  if (!hasPermission(["administrador", "supervisor"])) {
    return null;
  }

  return (
    <div className="space-y-6">
      <BackButton label="Cancelar" />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Lote</h1>
        <p className="text-muted-foreground">Registro del lote base para produccion, QR y trazabilidad</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Datos del lote</CardTitle>
        </CardHeader>
        <CardContent>
          <LotForm submitLabel="Registrar Lote" />
        </CardContent>
      </Card>
    </div>
  );
}
