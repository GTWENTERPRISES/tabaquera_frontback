"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { toast } from "sonner";

type ViewMode = "login" | "request-reset" | "verify-code" | "reset-password";

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

  const { login, user } = useAuth();
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(identifier, password);
      // Wait a little to let the auth context update the user state
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (success) {
        // Re-get the user from auth context after login completes
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
        setError(
          "Credenciales inválidas. Usa tu usuario o correo y contraseña.",
        );
      }
    } catch {
      setError("Error al iniciar sesion");
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
    <form onSubmit={handleLoginSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Correo o usuario</Label>
        <Input
          id="email"
          type="text"
          placeholder="admin o admin@goldenleaf.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        className="w-full h-11"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setViewMode("request-reset")}
          className="text-sm text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className="mt-6">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Usa tus credenciales del sistema Golden Trace
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Usuarios: admin, supervisor, operario, calidad
          </p>
        </div>
      </div>
    </form>
  );

  const renderRequestResetForm = () => (
    <form onSubmit={handleRequestReset} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setViewMode("login");
            setError("");
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Recuperar contraseña</h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-email">Correo o usuario</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="text"
            placeholder="Tu correo o usuario"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="h-11 pl-10"
          />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        className="w-full h-11"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando código...
          </>
        ) : (
          "Enviar código de recuperación"
        )}
      </Button>
    </form>
  );

  const renderVerifyCodeForm = () => (
    <form onSubmit={handleVerifyCode} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setViewMode("request-reset");
            setError("");
            setResetCode("");
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Verificar código</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Hemos enviado un código de verificación a tu correo electrónico.
      </p>

      <div className="space-y-2">
        <Label htmlFor="code">Código de verificación</Label>
        <Input
          id="code"
          type="text"
          placeholder="123456"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
          className="h-11 text-center text-xl tracking-widest"
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        className="w-full h-11"
        disabled={isLoading || resetCode.length < 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          "Verificar código"
        )}
      </Button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setViewMode("verify-code");
            setError("");
            setNewPassword("");
            setConfirmNewPassword("");
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Establecer nueva contraseña</h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="********"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="h-11 pl-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirm-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="********"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="h-11 pl-10 pr-10"
          />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        className="w-full h-11"
        disabled={isLoading || !newPassword || !confirmNewPassword}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Restableciendo contraseña...
          </>
        ) : (
          "Restablecer contraseña"
        )}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Panel izquierdo - Información institucional */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-primary/5 p-8"
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary mb-6"
          >
            <Package className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Golden Trace
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Sistema de trazabilidad del tabaco.
          </p>
          <p className="text-muted-foreground">
            Control productivo mediante QR.
          </p>
        </div>
      </motion.div>

      {/* Panel derecho - Formulario */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8">
            {/* Logo para mobile */}
            <div className="md:hidden text-center mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
                <Package className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Golden Trace
              </h2>
            </div>

            {viewMode === "login" && renderLoginForm()}
            {viewMode === "request-reset" && renderRequestResetForm()}
            {viewMode === "verify-code" && renderVerifyCodeForm()}
            {viewMode === "reset-password" && renderResetPasswordForm()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
