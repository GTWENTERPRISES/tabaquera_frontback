import type { Notification, User, Lot } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/constants";

export function getExampleNotifications(
  currentUser: User,
  availableLots: Lot[],
): Notification[] {
  const exampleNotifications: Notification[] = [];
  const currentUserId = currentUser.id;
  const currentUserRole = currentUser.role;

  if (currentUserRole === "admin" || currentUserRole === "supervisor") {
    availableLots.slice(0, 5).forEach((lot, index) => {
      const lotCode =
        lot.code ||
        lot.codigo ||
        `LT-${2026}-${String(index + 1).padStart(3, "0")}`;

      exampleNotifications.push({
        id: `admin-notif-${index}-1`,
        type: "info",
        category: "admin",
        title: "Nuevo lote registrado",
        message: `Carlos Martínez creó el lote ${lotCode}.`,
        userId: currentUserId,
        lotId: lot.id,
        lotCode,
        actionUrl: `/dashboard/lotes/${lot.id}`,
        createdAt: new Date(Date.now() - index * 1000 * 60 * 5).toISOString(),
        isRead: index > 2,
      });

      if (index < 2) {
        exampleNotifications.push({
          id: `admin-notif-${index}-2`,
          type: "critical",
          category: "quality",
          title: "Lote rechazado",
          message: `${lotCode} fue rechazado por humedad elevada.`,
          userId: currentUserId,
          lotId: lot.id,
          lotCode,
          actionUrl: "/dashboard/calidad",
          createdAt: new Date(
            Date.now() - index * 1000 * 60 * 30,
          ).toISOString(),
          isRead: index > 0,
        });
      }

      if (index < 1) {
        exampleNotifications.push({
          id: `admin-notif-${index}-3`,
          type: "critical",
          category: "alert",
          title: "Retraso crítico",
          message: `${lotCode} supera el tiempo máximo permitido.`,
          userId: currentUserId,
          lotId: lot.id,
          lotCode,
          actionUrl: `/dashboard/lotes/${lot.id}`,
          createdAt: new Date(
            Date.now() - index * 1000 * 60 * 60,
          ).toISOString(),
          isRead: true,
        });
      }
    });

    exampleNotifications.push({
      id: "admin-notif-user-4",
      type: "info",
      category: "user",
      title: "Usuario creado",
      message: "Pedro Sánchez fue registrado como Operario.",
      userId: currentUserId,
      targetUserId: "user-pedro",
      actionUrl: "/dashboard/usuarios",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      isRead: true,
    });
  } else if (currentUserRole === "operator") {
    availableLots.slice(0, 4).forEach((lot, index) => {
      const lotCode =
        lot.code ||
        lot.codigo ||
        `LT-${2026}-${String(index + 1).padStart(3, "0")}`;

      exampleNotifications.push({
        id: `operator-notif-${index}-1`,
        type: "info",
        category: "production",
        title: "Nuevo lote asignado",
        message: `Se te asignó ${lotCode} para Clasificación.`,
        userId: currentUserId,
        lotId: lot.id,
        lotCode,
        actionUrl: `/dashboard/lotes/${lot.id}`,
        createdAt: new Date(Date.now() - index * 1000 * 60 * 20).toISOString(),
        isRead: index > 1,
      });

      if (index === 0) {
        exampleNotifications.push({
          id: "operator-notif-0-2",
          type: "warning",
          category: "alert",
          title: "Próximo retraso",
          message: `${lotCode} está próximo a exceder el tiempo permitido.`,
          userId: currentUserId,
          lotId: lot.id,
          lotCode,
          actionUrl: `/dashboard/lotes/${lot.id}`,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          isRead: false,
        });
      }
    });
  } else if (currentUserRole === "quality") {
    availableLots.slice(0, 3).forEach((lot, index) => {
      const lotCode =
        lot.code ||
        lot.codigo ||
        `LT-${2026}-${String(index + 1).padStart(3, "0")}`;

      exampleNotifications.push({
        id: `quality-notif-${index}-1`,
        type: "warning",
        category: "quality",
        title: "Inspección pendiente",
        message: `${lotCode} requiere inspección de calidad.`,
        userId: currentUserId,
        lotId: lot.id,
        lotCode,
        actionUrl: "/dashboard/calidad",
        createdAt: new Date(Date.now() - index * 1000 * 60 * 25).toISOString(),
        isRead: index > 1,
      });
    });
  }

  return exampleNotifications;
}
