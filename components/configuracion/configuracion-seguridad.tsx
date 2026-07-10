"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Shield, Smartphone, Eye, EyeOff, LogOut, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/services/api';
import type { Sesion } from '@/services/api';
import { SessionsDialog } from './sessions-dialog';

export function ConfiguracionSeguridad() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user's 2FA status
        const currentUser = await api.getCurrentUser();
        setTwoFactorEnabled(currentUser.two_factor_enabled);

        // Load sessions
        await loadSessions();
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getAllSesiones();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Error al cargar sesiones');
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      const response = await api.toggle2FA(enabled);
      setTwoFactorEnabled(response.two_factor_enabled);
      toast.success(
        enabled
          ? 'Autenticación de dos factores activada'
          : 'Autenticación de dos factores desactivada'
      );
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast.error('Error al cambiar la configuración de 2FA');
    }
  };

  const handleSend2FACode = async () => {
    try {
      await api.send2FACode();
      toast.success('Código de verificación enviado');
    } catch (error) {
      console.error('Error sending 2FA code:', error);
      toast.error('Error al enviar código');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!user) {
      toast.error('No se encontró el usuario autenticado');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Update password via the usuarios endpoint
      await api.updateUsuario(user.id, {
        password: passwordForm.newPassword,
      } as any);
      toast.success('Contraseña actualizada exitosamente');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error al actualizar la contraseña. Verifique su contraseña actual.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await api.terminarSesion(sessionId);
      await loadSessions();
      toast.success('Sesión terminada');
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Error al terminar sesión');
    }
  };

  const handleTerminateOtherSessions = async () => {
    try {
      await api.terminarOtrasSesiones();
      await loadSessions();
      toast.success('Todas las otras sesiones terminadas');
    } catch (error) {
      console.error('Error terminating other sessions:', error);
      toast.error('Error al terminar otras sesiones');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Seguridad</h3>
        <p className="text-sm text-gray-500">Gestiona la seguridad de tu cuenta</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña regularmente para mantener la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación de Dos Factores
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">2FA por Email</Label>
              <p className="text-sm text-gray-500">
                Recibe un código de verificación por correo electrónico
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle2FA}
            />
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    2FA está activado
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Recibirás un código de verificación en tu email al iniciar sesión.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={handleSend2FACode}
                  >
                    Enviar código de prueba
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Sesiones Activas
          </CardTitle>
          <CardDescription>
            Gestiona tus dispositivos conectados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {session.dispositivo}
                      {session.es_actual && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Actual
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{session.ip}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.ultima_actividad).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.es_actual && (
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Cerrar
                </Button>
                )}
              </div>
            ))}

            {sessions.length > 0 && (
              <>
                <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowSessionsDialog(true)}
              >
                Ver todas las sesiones
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
                onClick={handleTerminateOtherSessions}
              >
                Cerrar todas las otras sesiones
              </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <SessionsDialog
        open={showSessionsDialog}
        onOpenChange={setShowSessionsDialog}
        sessions={sessions}
        onTerminateSession={handleTerminateSession}
        onRefresh={loadSessions}
      />
    </div>
  );
}
