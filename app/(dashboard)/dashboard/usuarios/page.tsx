"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { UsuariosView } from "@/components/users/usuarios-view";

export default function UsuariosPage() {
  return (
    <RouteGuard allowedRoles={["administrador"]} redirectTo="/dashboard">
      <UsuariosView />
    </RouteGuard>
  );
}
