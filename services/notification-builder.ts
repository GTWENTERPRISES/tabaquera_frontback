import type {
  Notification,
  NotificationType,
  NotificationCategory,
  User,
  Stage,
  Lot,
} from "@/lib/types";
import { STAGE_LABELS, ROLE_LABELS } from "@/lib/constants";

export class NotificationBuilder {
  static createBaseNotification(params: {
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    lotId?: string;
    lotCode?: string;
    targetUserId?: string;
    actionUrl?: string;
  }): Omit<Notification, "id" | "createdAt" | "isRead" | "userId"> {
    return {
      type: params.type,
      category: params.category,
      title: params.title,
      message: params.message,
      lotId: params.lotId,
      lotCode: params.lotCode,
      targetUserId: params.targetUserId,
      actionUrl: params.actionUrl,
    };
  }

  static createLotCreatedNotification(lot: Lot, actor: User) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "admin",
      title: "Nuevo lote registrado",
      message: `${actor.nombre || actor.name} creó el lote ${lotCode}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createLotAssignedOperatorNotification(
    lot: Lot,
    stage: Stage,
    targetUser: User,
  ) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "production",
      title: "Nuevo lote asignado",
      message: `Se te asignó ${lotCode} para ${STAGE_LABELS[stage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createLotReassignedAdminNotification(
    lot: Lot,
    fromUser: User,
    toUser: User,
  ) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "admin",
      title: "Lote reasignado",
      message: `${lotCode} fue reasignado de ${fromUser.nombre || fromUser.name} a ${toUser.nombre || toUser.name}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createLotReassignedOperatorNotification(lot: Lot, toUser: User) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "production",
      title: "Lote reasignado",
      message: `Ahora eres responsable del lote ${lotCode}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createStageStartedNotification(lot: Lot, actor: User, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "production",
      title: "Trabajo iniciado",
      message: `${actor.nombre || actor.name} inició la etapa de ${STAGE_LABELS[stage]} para ${lotCode}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createStagePausedNotification(lot: Lot, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "warning",
      category: "production",
      title: "Trabajo pausado",
      message: `El proceso ${lotCode} fue pausado en ${STAGE_LABELS[stage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createStageResumedNotification(lot: Lot, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "production",
      title: "Trabajo reanudado",
      message: `El proceso ${lotCode} fue reanudado en ${STAGE_LABELS[stage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createStageCompletedNotification(lot: Lot, actor: User, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "production",
      title: "Etapa completada",
      message: `${actor.nombre || actor.name} completó ${STAGE_LABELS[stage]} en ${lotCode}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createQualityPendingNotification(lot: Lot) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "warning",
      category: "quality",
      title: "Inspección pendiente",
      message: `${lotCode} requiere inspección de calidad.`,
      lotId: lot.id,
      lotCode,
      actionUrl: "/dashboard/calidad",
    });
  }

  static createQualityApprovedOperatorNotification(lot: Lot) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "quality",
      title: "Calidad aprobada",
      message: `${lotCode} fue aprobado por Control de Calidad.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createQualityApprovedNextOperatorNotification(
    lot: Lot,
    nextStage: Stage,
  ) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "quality",
      title: "Nuevo lote disponible",
      message: `${lotCode} fue aprobado y está listo para ${STAGE_LABELS[nextStage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createQualityApprovedAdminNotification(lot: Lot, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "info",
      category: "quality",
      title: "Lote aprobado",
      message: `${lotCode} aprobó el control de calidad en ${STAGE_LABELS[stage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: "/dashboard/calidad",
    });
  }

  static createQualityRejectedOperatorNotification(lot: Lot, reason: string) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "critical",
      category: "quality",
      title: "Calidad rechazada",
      message: `${lotCode} fue rechazado. Revisar observaciones: ${reason}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: "/dashboard/calidad",
    });
  }

  static createQualityRejectedAdminNotification(lot: Lot, reason: string) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "critical",
      category: "quality",
      title: "Lote rechazado",
      message: `${lotCode} fue rechazado por ${reason}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: "/dashboard/calidad",
    });
  }

  static createLotNearDelayNotification(lot: Lot, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "warning",
      category: "alert",
      title: "Próximo retraso",
      message: `${lotCode} está próximo a exceder el tiempo permitido en ${STAGE_LABELS[stage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createLotDelayedNotification(lot: Lot, stage: Stage) {
    const lotCode = lot.code || lot.codigo;
    return this.createBaseNotification({
      type: "critical",
      category: "alert",
      title: "Retraso crítico",
      message: `${lotCode} supera el tiempo máximo permitido en ${STAGE_LABELS[stage]}.`,
      lotId: lot.id,
      lotCode,
      actionUrl: `/dashboard/lotes/${lot.id}`,
    });
  }

  static createUserCreatedNotification(actor: User, newUser: User) {
    return this.createBaseNotification({
      type: "info",
      category: "user",
      title: "Usuario creado",
      message: `${newUser.nombre || newUser.name} fue registrado como ${ROLE_LABELS[newUser.role]}.`,
      targetUserId: newUser.id,
      actionUrl: "/dashboard/usuarios",
    });
  }

  static createUserDeactivatedNotification(
    actor: User,
    deactivatedUser: User,
  ) {
    return this.createBaseNotification({
      type: "info",
      category: "user",
      title: "Usuario desactivado",
      message: `${deactivatedUser.nombre || deactivatedUser.name} fue desactivado del sistema.`,
      targetUserId: deactivatedUser.id,
      actionUrl: "/dashboard/usuarios",
    });
  }
}
