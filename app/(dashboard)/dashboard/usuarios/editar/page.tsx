"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/users/user-form";
import BackButton from "@/components/BackButton";

interface EditarUsuarioPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default function EditarUsuarioPage({
  searchParams,
}: EditarUsuarioPageProps) {
  const { id: resolvedId } = React.use(searchParams);
  const { users } = useAuth();
  const user = users.find((u) => u.id === resolvedId);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <BackButton label="Cancelar" />
        <h1 className="text-2xl font-bold text-foreground">Editar Usuario</h1>
        <p className="text-muted-foreground">
          Actualizacion de credenciales, rol y estado
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm initialValues={user} submitLabel="Actualizar Usuario" />
        </CardContent>
      </Card>
    </div>
  );
}
