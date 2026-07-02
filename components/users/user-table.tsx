"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MoreHorizontal, Pencil, Shield, Trash2 } from "lucide-react"
import type { User } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface UserTableProps {
  users: User[]
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operator: "Operario",
  quality: "Control de Calidad",
}

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  supervisor: "bg-accent/10 text-accent border-accent/20",
  operator: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  quality: "bg-chart-4/10 text-chart-4 border-chart-4/20",
}

export function UserTable({ users }: UserTableProps) {
  const { updateUser, deleteUser } = useAuth()

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id, {
        status: user.active ? "inactive" : "active",
        active: !user.active,
      })
      toast.success(`Usuario ${user.active ? "bloqueado" : "desbloqueado"}`)
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error("Error al cambiar estado del usuario")
    }
  }

  const handleDelete = async (user: User) => {
    if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
      try {
        await deleteUser(user.id)
        toast.success("Usuario eliminado")
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error("Error al eliminar el usuario")
      }
    }
  }

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex flex-col gap-4 rounded-xl border border-border p-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name.split(" ").map(part => part[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <Badge variant="outline" className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                  <Badge variant={!user.active ? "outline" : "secondary"}>
                    {!user.active ? "Inactivo" : "Activo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{user.department}</span>
                  <span>@{user.username}</span>
                  {user.lastAccess && (
                    <span>Último acceso: {new Date(user.lastAccess).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="self-end md:self-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/usuarios/editar?id=${user.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                  <Shield className="mr-2 h-4 w-4" />
                  {user.active ? "Bloquear" : "Desbloquear"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
