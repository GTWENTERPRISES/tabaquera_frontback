"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/users/user-form";
import BackButton from "@/components/BackButton";

export default function NuevoUsuarioPage() {
  return (
    <RouteGuard allowedRoles={["administrador"]} redirectTo="/dashboard">
      <div className="space-y-6">
        <BackButton label="Cancelar" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Usuario</h1>
          <p className="text-muted-foreground">
            Registro de acceso y permisos del sistema
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Datos del usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm submitLabel="Crear Usuario" />
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
