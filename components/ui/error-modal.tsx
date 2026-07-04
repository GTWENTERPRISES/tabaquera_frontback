"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  WifiOff,
  ServerCrash,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useError, type AppError, type ErrorSeverity } from "@/contexts/error-context";
import { useAuth } from "@/contexts/auth-context";

// ─── Severity config ─────────────────────────────────────────────────────────

const severityConfig: Record<
  ErrorSeverity,
  {
    icon: React.ElementType;
    iconClass: string;
    tagClass: string;
    glowClass: string;
    label: string;
  }
> = {
  error: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    tagClass:
      "bg-destructive/10 text-destructive border border-destructive/25 dark:bg-destructive/15",
    glowClass: "shadow-destructive/10",
    label: "Error",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    tagClass:
      "bg-amber-500/10 text-amber-600 border border-amber-500/25 dark:text-amber-400 dark:bg-amber-500/15",
    glowClass: "shadow-amber-500/10",
    label: "Advertencia",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    tagClass:
      "bg-blue-500/10 text-blue-600 border border-blue-500/25 dark:text-blue-400 dark:bg-blue-500/15",
    glowClass: "shadow-blue-500/10",
    label: "Información",
  },
};

// ─── Detects kind of error to show a contextual icon ─────────────────────────

function getContextIcon(message: string): React.ElementType {
  const msg = message.toLowerCase();
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch"))
    return WifiOff;
  if (msg.includes("credenciales") || msg.includes("autenticación") || msg.includes("sesión"))
    return ShieldAlert;
  if (msg.includes("servidor") || msg.includes("500") || msg.includes("503"))
    return ServerCrash;
  return null as unknown as React.ElementType;
}

// ─── Single error row ─────────────────────────────────────────────────────────

function ErrorRow({
  error,
  onDismiss,
  index,
}: {
  error: AppError;
  onDismiss: () => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[error.severity];
  const SeverityIcon = config.icon;
  const ContextIcon = getContextIcon(error.message);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-shadow hover:shadow-md",
        config.glowClass,
        error.severity === "error"
          ? "border-destructive/20 dark:border-destructive/30"
          : error.severity === "warning"
            ? "border-amber-500/20 dark:border-amber-500/30"
            : "border-blue-500/20 dark:border-blue-500/30",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Main icon */}
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            error.severity === "error"
              ? "bg-destructive/10"
              : error.severity === "warning"
                ? "bg-amber-500/10"
                : "bg-blue-500/10",
          )}
        >
          {ContextIcon ? (
            <ContextIcon className={cn("size-4", config.iconClass)} />
          ) : (
            <SeverityIcon className={cn("size-4", config.iconClass)} />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  config.tagClass,
                )}
              >
                {config.label}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {error.timestamp.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              aria-label="Descartar"
              className="ml-1 shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
            {error.title}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {error.message}
          </p>

          {/* Expandable technical details */}
          {error.details && (
            <div className="mt-2.5">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {expanded ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
                {expanded ? "Ocultar detalles técnicos" : "Ver detalles técnicos"}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <pre className="mt-2 rounded-lg bg-muted/60 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                      {error.details}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Floating panel (no modal overlay, not blocking) ─────────────────────────

export function ErrorModal() {
  const { errors, dismissError, clearAll } = useError();
  const { isAuthenticated } = useAuth();

  // Si el usuario no está autenticado, no mostrar errores de contexto
  // (los errores de login se manejan inline en el formulario)
  if (!isAuthenticated || errors.length === 0) return null;

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  const headerLabel =
    errorCount > 0
      ? `${errorCount} error${errorCount > 1 ? "es" : ""} del sistema`
      : warningCount > 0
        ? `${warningCount} advertencia${warningCount > 1 ? "s" : ""}`
        : `${errors.length} aviso${errors.length > 1 ? "s" : ""}`;

  const headerIcon =
    errorCount > 0 ? (
      <AlertCircle className="size-4 text-destructive" />
    ) : warningCount > 0 ? (
      <AlertTriangle className="size-4 text-amber-500" />
    ) : (
      <Info className="size-4 text-blue-500" />
    );

  return (
    <AnimatePresence>
      {errors.length > 0 && (
        <motion.div
          key="error-panel"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
        >
          <div className="rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                {headerIcon}
                <span className="text-sm font-semibold text-foreground">
                  {headerLabel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {errors.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpiar todo
                  </Button>
                )}
                <button
                  onClick={clearAll}
                  aria-label="Cerrar panel de errores"
                  className="rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Error list */}
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-3">
              <AnimatePresence initial={false}>
                {errors.map((error, i) => (
                  <ErrorRow
                    key={error.id}
                    error={error}
                    index={i}
                    onDismiss={() => dismissError(error.id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Footer hint */}
            <div className="border-t bg-muted/20 px-4 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <RefreshCw className="size-3" />
                Recargá la página si los problemas persisten.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
