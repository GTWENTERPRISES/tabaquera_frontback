"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { toast } from "sonner";

type ViewMode = "login" | "request-reset" | "verify-code" | "reset-password";

// Variantes reutilizables
const fadeSlide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fieldVariant = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function LoginView() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const success = await login(identifier, password);
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (success) {
        const storedUserStr = localStorage.getItem("golden_trace_user");
        const loggedInUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (loggedInUser?.role === "operator") {
          router.push("/dashboard/procesos");
        } else if (loggedInUser?.role === "quality") {
          router.push("/dashboard/calidad");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Credenciales inválidas. Usa tu usuario o correo y contraseña.");
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.requestResetPassword(identifier);
      toast.success("Si el usuario existe, se ha enviado un código a tu correo");
      setViewMode("verify-code");
    } catch (err: any) {
      setError(err.message || "Error al solicitar código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.verifyResetPasswordCode(identifier, resetCode);
      setViewMode("reset-password");
    } catch (err: any) {
      setError(err.message || "Código inválido o expirado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setIsLoading(true);
    try {
      await api.resetPassword(identifier, resetCode, newPassword);
      toast.success("Contraseña actualizada exitosamente!");
      setViewMode("login");
      setIdentifier("");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err.message || "Error al restablecer contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <motion.form
      key="login"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      onSubmit={handleLoginSubmit}
      className="space-y-5"
    >
      <motion.div variants={fieldVariant} className="space-y-2">
        <Label htmlFor="email">Correo o usuario</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="text"
            placeholder="admin o admin@goldenleaf.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoCapitalize="none"
            autoCorrect="off"
            className="h-11 pl-10 transition-shadow focus:shadow-md"
          />
        </div>
      </motion.div>

      <motion.div variants={fieldVariant} className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 pl-10 pr-11 transition-shadow focus:shadow-md"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            <motion.span
              key={showPassword ? "off" : "on"}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.span>
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-destructive text-center overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={fieldVariant}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={isLoading}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Iniciar sesión
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={fieldVariant} className="text-center">
        <button
          type="button"
          onClick={() => { setViewMode("request-reset"); setError(""); }}
          className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </motion.div>

      <motion.div variants={fieldVariant}>
        <div className="bg-muted/50 rounded-xl p-4 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Usa tus credenciales del sistema Golden Trace
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Usuarios: admin, supervisor, operario, calidad
          </p>
        </div>
      </motion.div>
    </motion.form>
  );

  const renderRequestResetForm = () => (
    <motion.form
      key="request-reset"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      onSubmit={handleRequestReset}
      className="space-y-5"
    >
      <motion.div variants={fieldVariant} className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { setViewMode("login"); setError(""); }}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Recuperar contraseña</h2>
      </motion.div>

      <motion.p variants={fieldVariant} className="text-sm text-muted-foreground">
        Ingresa tu correo o usuario y te enviaremos un código de recuperación.
      </motion.p>

      <motion.div variants={fieldVariant} className="space-y-2">
        <Label htmlFor="reset-email">Correo o usuario</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="reset-email"
            type="text"
            placeholder="Tu correo o usuario"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="h-11 pl-10 transition-shadow focus:shadow-md"
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="text-sm text-destructive text-center overflow-hidden"
          />
        )}
      </AnimatePresence>

      <motion.div variants={fieldVariant}>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando código...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Enviar código de recuperación
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );

  const renderVerifyCodeForm = () => (
    <motion.form
      key="verify-code"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      onSubmit={handleVerifyCode}
      className="space-y-5"
    >
      <motion.div variants={fieldVariant} className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { setViewMode("request-reset"); setError(""); setResetCode(""); }}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Verificar código</h2>
      </motion.div>

      <motion.p variants={fieldVariant} className="text-sm text-muted-foreground">
        Hemos enviado un código de verificación a tu correo electrónico.
      </motion.p>

      <motion.div variants={fieldVariant} className="space-y-2">
        <Label htmlFor="code">Código de verificación</Label>
        <Input
          id="code"
          type="text"
          placeholder="123456"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
          className="h-11 text-center text-2xl tracking-[0.5em] font-mono transition-shadow focus:shadow-md"
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="text-sm text-destructive text-center overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={fieldVariant}>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading || resetCode.length < 6}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Verificar código
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );

  const renderResetPasswordForm = () => (
    <motion.form
      key="reset-password"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      onSubmit={handleResetPassword}
      className="space-y-5"
    >
      <motion.div variants={fieldVariant} className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { setViewMode("verify-code"); setError(""); setNewPassword(""); setConfirmNewPassword(""); }}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Nueva contraseña</h2>
      </motion.div>

      <motion.div variants={fieldVariant} className="space-y-2">
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="h-11 pl-10 pr-11 transition-shadow focus:shadow-md"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            <motion.span
              key={showNewPassword ? "off" : "on"}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.span>
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fieldVariant} className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="confirm-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="h-11 pl-10 transition-shadow focus:shadow-md"
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="text-sm text-destructive text-center overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={fieldVariant}>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading || !newPassword || !confirmNewPassword}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restableciendo...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Restablecer contraseña
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Panel izquierdo */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-primary/5 p-8 relative overflow-hidden"
      >
        {/* Círculos decorativos de fondo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.06 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-primary rounded-full"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.04 }}
          transition={{ duration: 1.4, delay: 0.5 }}
          className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] bg-primary rounded-full"
        />

        <div className="max-w-md text-center relative z-10">
          {/* Icono con animación spring */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 14 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary mb-8 shadow-2xl"
          >
            <Package className="h-12 w-12 text-primary-foreground" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-bold text-foreground mb-4"
          >
            Golden Trace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="text-lg text-muted-foreground mb-2"
          >
            Sistema de trazabilidad del tabaco.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="text-muted-foreground"
          >
            Control productivo mediante QR.
          </motion.p>

          {/* Píldoras de características */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {["Trazabilidad", "Calidad", "Producción", "Reportes"].map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 300 }}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Panel derecho - Formulario */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Logo móvil */}
            <div className="md:hidden text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg"
              >
                <Package className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground"
              >
                Golden Trace
              </motion.h2>
            </div>

            {/* Transición suave entre formularios */}
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                variants={fadeSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {viewMode === "login" && renderLoginForm()}
                {viewMode === "request-reset" && renderRequestResetForm()}
                {viewMode === "verify-code" && renderVerifyCodeForm()}
                {viewMode === "reset-password" && renderResetPasswordForm()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
