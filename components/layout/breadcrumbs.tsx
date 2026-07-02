"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const pathNames: Record<string, string> = {
  dashboard: "Dashboard",
  lotes: "Lotes",
  procesos: "Procesos",
  scanner: "Escaner QR",
  qr: "Generar QR",
  calidad: "Calidad",
  trazabilidad: "Trazabilidad",
  reportes: "Reportes",
  usuarios: "Usuarios",
  configuracion: "Configuracion",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) {
    return (
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span className="font-medium text-foreground">Dashboard</span>
      </div>
    )
  }

  return (
    <nav className="hidden md:flex items-center gap-2 text-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/")
        const isLast = index === segments.length - 2
        const name = pathNames[segment] || segment

        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{name}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
