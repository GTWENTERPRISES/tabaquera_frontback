"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Moon, Sun, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "./sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { Breadcrumbs } from "./breadcrumbs";
import { useLots } from "@/contexts/lot-context";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Topbar() {
  const { setTheme, theme } = useTheme();
  const { lots } = useLots();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLots = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return lots.filter((lot) =>
      (lot.code || lot.codigo || "").toLowerCase().includes(term),
    );
  }, [lots, searchTerm]);

  // Close desktop search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDesktopSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLot = (lotId: string) => {
    router.push(`/dashboard/lotes/${lotId}`);
    setSearchTerm("");
    setIsDesktopSearchOpen(false);
    setIsMobileSearchOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 lg:px-6">
        <MobileSidebar />
        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden md:block w-64 h-9 bg-muted/50 rounded-md" />
          <div className="md:hidden w-9 h-9 bg-muted/50 rounded-md" />
          <div className="w-9 h-9 bg-muted/50 rounded-md" />
          <div className="w-9 h-9 bg-muted/50 rounded-md" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 lg:px-6">
      <MobileSidebar />

      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Desktop search - SOLO visible en desktop */}
        <div ref={searchContainerRef} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar lote..."
            className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDesktopSearchOpen(true)}
          />

          {/* Desktop search results dropdown */}
          {isDesktopSearchOpen && searchTerm && filteredLots.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
              {filteredLots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectLot(lot.id)}
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">
                    {lot.code || lot.codigo}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {lot.proveedor || lot.supplier}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile search - SOLO visible en mobile */}
        <div className="md:hidden">
          <Popover
            open={isMobileSearchOpen}
            onOpenChange={setIsMobileSearchOpen}
          >
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="end">
              <div className="space-y-4">
                <Input
                  placeholder="Buscar lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchTerm && filteredLots.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredLots.map((lot) => (
                      <div
                        key={lot.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => handleSelectLot(lot.id)}
                      >
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-mono text-sm">
                            {lot.code || lot.codigo}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {lot.proveedor || lot.supplier}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchTerm && filteredLots.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No se encontraron lotes
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Notificaciones */}
        <NotificationBell />

        {/* Botón tema - estilo minimalista y sutil */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative transition-all duration-300 hover:bg-muted"
          title={
            theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
          }
        >
          <Sun
            className={cn(
              "h-5 w-5 transition-all duration-300",
              theme === "dark"
                ? "rotate-90 scale-0 opacity-0 absolute"
                : "rotate-0 scale-100 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "h-5 w-5 transition-all duration-300",
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0 absolute",
            )}
          />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>
    </header>
  );
}
