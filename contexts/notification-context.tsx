"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import type { Notification, NotificationCategory, User } from "@/lib/types";
import { useAuth } from "./auth-context";
import { useNotificationActions } from "@/hooks/use-notification-actions";
import { api, type Alerta } from "@/services/api";
import { useError } from "@/contexts/error-context";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">,
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  filterNotifications: (
    category?: NotificationCategory,
    onlyUnread?: boolean,
  ) => Notification[];
  notifyLotCreated: (lot: any, actor: User) => void;
  notifyLotAssigned: (
    lot: any,
    actor: User,
    targetUser: User,
    stage: any,
  ) => void;
  notifyLotReassigned: (
    lot: any,
    actor: User,
    fromUser: User,
    toUser: User,
  ) => void;
  notifyStageStarted: (lot: any, actor: User, stage: any) => void;
  notifyStagePaused: (lot: any, actor: User, stage: any) => void;
  notifyStageResumed: (lot: any, actor: User, stage: any) => void;
  notifyStageCompleted: (lot: any, actor: User, stage: any) => void;
  notifyQualityPending: (lot: any) => void;
  notifyQualityApproved: (
    lot: any,
    inspector: User,
    stage: any,
    nextStage?: any,
    nextOperator?: User,
  ) => void;
  notifyQualityRejected: (lot: any, inspector: User, reason: string) => void;
  notifyLotDelayed: (lot: any, stage: any) => void;
  notifyLotNearDelay: (lot: any, stage: any) => void;
  notifyUserCreated: (actor: User, newUser: User) => void;
  notifyUserDeactivated: (actor: User, deactivatedUser: User) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const getStorageKey = (userId: string) =>
  `golden_trace_notifications_${userId}`;

const getBackendAlertId = (notificationId: string) => {
  if (!notificationId.startsWith("alerta-")) {
    return null;
  }

  const alertId = notificationId.replace("alerta-", "");
  return Number.parseInt(alertId, 10);
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showWarning } = useError();

  // Función para convertir Alerta del backend a Notification del frontend
  const convertAlertaToNotification = (alerta: Alerta): Notification => {
    const categoryMap: Record<string, NotificationCategory> = {
      retraso: "alert",
      cuello_botella: "production",
      calidad_rechazada: "quality",
      sistema: "admin",
    };

    const type =
      alerta.severidad === "critica" || alerta.severidad === "alta"
        ? "critical"
        : alerta.severidad === "media"
          ? "warning"
          : "info";

    return {
      id: `alerta-${alerta.id}`,
      userId: user?.id || "",
      type,
      title: alerta.titulo,
      message: alerta.descripcion,
      category: categoryMap[alerta.tipo] || "alert",
      isRead: alerta.estado !== "activa",
      createdAt: alerta.fecha_creacion,
      lotId: alerta.lote?.toString(),
      lotCode: alerta.lote_codigo,
      actionUrl: alerta.lote
        ? `/dashboard/lotes/${alerta.lote}`
        : "/dashboard/notificaciones",
      meta: {
        backendAlertId: alerta.id,
        severidad: alerta.severidad,
        estado: alerta.estado,
        tipo: alerta.tipo,
      },
    };
  };

  // Load notifications from backend when user is authenticated
  useEffect(() => {
    // Esperar a que auth termine de verificar el token
    if (authLoading) return;

    if (!user || !isAuthenticated) {
      setAllNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const alertas = await api.getAllAlertas();
        const backendNotifications = alertas.map(convertAlertaToNotification);
        const rawLocalNotifications = localStorage.getItem(getStorageKey(user.id));
        const localNotifications: Notification[] = rawLocalNotifications
          ? JSON.parse(rawLocalNotifications)
          : [];

        setAllNotifications(
          [...backendNotifications, ...localNotifications].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
        const msg = error instanceof Error ? error.message : String(error);
        // Token inválido o expirado — limpiar silenciosamente sin modal de error
        if (msg.toLowerCase().includes('token') || msg.includes('401') || msg.includes('credenciales')) {
          setAllNotifications([]);
        } else {
          showWarning(
            "Notificaciones no disponibles",
            "No se pudieron cargar las alertas del sistema.",
            msg,
          );
          const rawLocalNotifications = localStorage.getItem(getStorageKey(user.id));
          setAllNotifications(rawLocalNotifications ? JSON.parse(rawLocalNotifications) : []);
        }
      }
    };

    loadNotifications();

    // Recargar notificaciones cada 60 segundos
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.id, isAuthenticated, authLoading]);

  // Persist notifications changes to backend (for local notifications only)
  // Las alertas del backend se persisten automáticamente
  useEffect(() => {
    if (!user || allNotifications.length === 0) return;
    
    // Solo persistir notificaciones locales (las que no vienen del backend)
    const localNotifications = allNotifications.filter(n => !n.id.startsWith('alerta-'));
    if (localNotifications.length > 0) {
      localStorage.setItem(
        getStorageKey(user.id),
        JSON.stringify(localNotifications),
      );
    }
  }, [allNotifications, user?.id]);

  const addNotificationForUsers = (
    baseNotif: Omit<Notification, "id" | "createdAt" | "userId" | "isRead">,
    recipientUserIds: string[],
  ) => {
    const newNotifications: Notification[] = recipientUserIds.map((userId) => ({
      ...baseNotif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${userId}`,
      userId,
      createdAt: new Date().toISOString(),
      isRead: false,
    }));

    setAllNotifications((prev) => [...newNotifications, ...prev]);
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setAllNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    const backendAlertId = getBackendAlertId(notificationId);

    setAllNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    if (backendAlertId !== null) {
      void api.resolverAlerta(backendAlertId).catch((error) => {
        console.error("Error marcando alerta como leída:", error);
      });
    }
  };

  const markAllAsRead = () => {
    if (!user) return;

    const unreadBackendAlertIds = allNotifications
      .filter((n) => n.userId === user.id && !n.isRead)
      .map((n) => getBackendAlertId(n.id))
      .filter((id): id is number => id !== null);

    setAllNotifications((prev) =>
      prev.map((n) =>
        n.userId === user.id && !n.isRead ? { ...n, isRead: true } : n,
      ),
    );

    unreadBackendAlertIds.forEach((alertId) => {
      void api.resolverAlerta(alertId).catch((error) => {
        console.error("Error marcando alertas como leídas:", error);
      });
    });
  };

  const deleteNotification = (notificationId: string) => {
    const backendAlertId = getBackendAlertId(notificationId);
    setAllNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    if (backendAlertId !== null) {
      void api.resolverAlerta(backendAlertId).catch((error) => {
        console.error("Error resolviendo alerta al eliminar:", error);
      });
    }
  };

  const notifications = useMemo(
    () => (user ? allNotifications.filter((n) => n.userId === user.id) : []),
    [allNotifications, user],
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filterNotifications = (
    category?: NotificationCategory,
    onlyUnread?: boolean,
  ) => {
    let filtered = [...notifications];
    if (category) {
      filtered = filtered.filter((n) => n.category === category);
    }
    if (onlyUnread) {
      filtered = filtered.filter((n) => !n.isRead);
    }
    return filtered;
  };

  const notificationActions = useNotificationActions(
    addNotification,
    addNotificationForUsers,
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        filterNotifications,
        ...notificationActions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
