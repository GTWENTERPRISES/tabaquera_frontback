"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useLots } from "@/contexts/lot-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotForm } from "@/components/lots/lot-form";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import BackButton from "@/components/BackButton";

interface EditLotPageProps {
  params: Promise<{ id: string }>;
}

export default function EditLotPage({ params }: EditLotPageProps) {
  const { id } = React.use(params);
  const { getLotById, loading } = useLots();
  const lot = getLotById(id);
  const { hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission(["administrador", "supervisor"])) {
      router.push("/dashboard/lotes");
    }
  }, [hasPermission, router]);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!lot) {
    notFound();
  }

  if (!hasPermission(["administrador", "supervisor"])) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <BackButton label="Cancelar" />
        <h1 className="text-2xl font-bold text-foreground">Editar Lote</h1>
        <p className="text-muted-foreground">
          Actualizar informacion del lote {lot.code}
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Datos del lote</CardTitle>
        </CardHeader>
        <CardContent>
          <LotForm initialValues={lot} submitLabel="Actualizar Lote" />
        </CardContent>
      </Card>
    </div>
  );
}
