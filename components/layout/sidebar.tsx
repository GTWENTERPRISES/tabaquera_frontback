"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ScanLine,
  ClipboardCheck,
  History,
  FileText,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  QrCode,
  Kanban,
  Activity,
  Factory,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const navItems = [
  {
    titulo: "Dashboard",
    href: "/dashboard",
    icono: LayoutDashboard,
    roles: ["administrador", "supervisor", "operario", "calidad"],
  },
  {
    titulo: "Lotes",
    href: "/dashboard/lotes",
    icono: Package,
    roles: ["administrador", "supervisor", "operario", "calidad"],
  },
  {
    titulo: "Notificaciones",
    href: "/dashboard/notificaciones",
    icono: Bell,
    roles: ["administrador", "supervisor", "operario", "calidad"],
  },
  {
    titulo: "Producción",
    href: "/dashboard/produccion",
    icono: Factory,
    roles: ["administrador", "supervisor", "operario", "calidad"],
  },
  {
    titulo: "Procesos",
    href: "/dashboard/procesos",
    icono: Kanban,
    roles: ["administrador", "supervisor"],
  },
  {
    titulo: "Estados",
    href: "/dashboard/estados",
    icono: Activity,
    roles: ["administrador", "supervisor", "operario", "calidad"],
  },
  {
    titulo: "Escaner QR",
    href: "/dashboard/scanner",
    icono: ScanLine,
    roles: ["administrador", "supervisor", "operario", "calidad"],
  },
  {
    titulo: "Gestión QR",
    href: "/dashboard/qr",
    icono: QrCode,
    roles: ["administrador", "supervisor"],
  },
  {
    titulo: "Calidad",
    href: "/dashboard/calidad",
    icono: ClipboardCheck,
    roles: ["administrador", "supervisor", "calidad"],
  },
  {
    titulo: "Trazabilidad",
    href: "/dashboard/trazabilidad",
    icono: History,
    roles: ["administrador", "supervisor", "calidad"],
  },
  {
    titulo: "Reportes",
    href: "/dashboard/reportes",
    icono: FileText,
    roles: ["administrador", "supervisor"],
  },
  {
    titulo: "Usuarios",
    href: "/dashboard/usuarios",
    icono: Users,
    roles: ["administrador"],
  },
  {
    titulo: "Configuracion",
    href: "/dashboard/configuracion",
    icono: Settings,
    roles: ["administrador"],
  },
];

function NavContent({
  collapsed,
  onItemClick,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();

  const filteredItems = navItems.filter((item) =>
    hasPermission(
      item.roles as ("administrador" | "supervisor" | "operario" | "calidad")[],
    ),
  );

  return (
    <nav className="flex flex-col gap-1 px-2">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icono;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  {item.titulo}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && !collapsed && (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-16 items-center border-b px-4">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-lg font-bold text-foreground">
                Golden Trace
              </span>
              <span className="text-xs text-muted-foreground">
                Trazabilidad
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="border-t p-4">
      <div
        className={cn("flex items-center gap-3", collapsed && "justify-center")}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {(user.nombre || user.name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 overflow-hidden"
            >
              <p className="truncate text-sm font-medium text-foreground">
                {user.nombre}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user.rol}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      className="hidden lg:flex h-screen flex-col border-r bg-card overflow-hidden"
    >
      <SidebarHeader collapsed={collapsed} />
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full py-4">
          <NavContent collapsed={collapsed} />
        </ScrollArea>
      </div>
      <SidebarFooter collapsed={collapsed} />
      <div className="border-t p-2">...</div>
    </motion.aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-0 border-b">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        </SheetHeader>
        <SidebarHeader collapsed={false} />
        <ScrollArea className="flex-1 py-4">
          <NavContent collapsed={false} onItemClick={() => setOpen(false)} />
        </ScrollArea>
        <SidebarFooter collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
