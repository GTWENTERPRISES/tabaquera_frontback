"use client";

import { useCallback } from "react";
import type { User, UserRole, Stage, Lot } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { NotificationBuilder } from "@/services/notification-builder";

type AddNotificationFn = (
  notification: Omit<import("@/lib/types").Notification, "id" | "createdAt" | "isRead">,
) => void;

type AddNotificationForUsersFn = (
  baseNotif: Omit<import("@/lib/types").Notification, "id" | "createdAt" | "userId" | "isRead">,
  recipientUserIds: string[],
) => void;

export function useNotificationActions(
  addNotification: AddNotificationFn,
  addNotificationForUsers: AddNotificationForUsersFn,
) {
  const { users } = useAuth();

  const getUsersByRole = useCallback(
    (role: UserRole): User[] => {
      return users.filter((u) => u.role === role && u.active);
    },
    [users],
  );

  const notifyLotCreated = useCallback(
    (lot: Lot, actor: User) => {
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const notification = NotificationBuilder.createLotCreatedNotification(
        lot,
        actor,
      );
      addNotificationForUsers(notification, adminUserIds);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyLotAssigned = useCallback(
    (lot: Lot, actor: User, targetUser: User, stage: Stage) => {
      const operatorNotif =
        NotificationBuilder.createLotAssignedOperatorNotification(
          lot,
          stage,
          targetUser,
        );
      addNotification({ ...operatorNotif, userId: targetUser.id });

      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const lotCode = lot.code || lot.codigo;
      const adminNotif = NotificationBuilder.createBaseNotification({
        type: "info",
        category: "admin",
        title: "Lote reasignado",
        message: `${lotCode} fue reasignado a ${targetUser.nombre || targetUser.name}.`,
        lotId: lot.id,
        lotCode,
        actionUrl: `/dashboard/lotes/${lot.id}`,
      });
      addNotificationForUsers(adminNotif, adminUserIds);
    },
    [addNotification, addNotificationForUsers, getUsersByRole],
  );

  const notifyLotReassigned = useCallback(
    (lot: Lot, actor: User, fromUser: User, toUser: User) => {
      const operatorNotif =
        NotificationBuilder.createLotReassignedOperatorNotification(lot, toUser);
      addNotification({ ...operatorNotif, userId: toUser.id });

      const adminNotif =
        NotificationBuilder.createLotReassignedAdminNotification(
          lot,
          fromUser,
          toUser,
        );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(adminNotif, adminUserIds);
    },
    [addNotification, addNotificationForUsers, getUsersByRole],
  );

  const notifyStageStarted = useCallback(
    (lot: Lot, actor: User, stage: Stage) => {
      const notification = NotificationBuilder.createStageStartedNotification(
        lot,
        actor,
        stage,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const operatorUserIds = actor ? [actor.id] : [];
      addNotificationForUsers(notification, [
        ...adminUserIds,
        ...operatorUserIds,
      ]);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyStagePaused = useCallback(
    (lot: Lot, actor: User, stage: Stage) => {
      const notification = NotificationBuilder.createStagePausedNotification(
        lot,
        stage,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(notification, adminUserIds);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyStageResumed = useCallback(
    (lot: Lot, actor: User, stage: Stage) => {
      const notification = NotificationBuilder.createStageResumedNotification(
        lot,
        stage,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const operatorUserIds = actor ? [actor.id] : [];
      addNotificationForUsers(notification, [
        ...adminUserIds,
        ...operatorUserIds,
      ]);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyStageCompleted = useCallback(
    (lot: Lot, actor: User, stage: Stage) => {
      const notification = NotificationBuilder.createStageCompletedNotification(
        lot,
        actor,
        stage,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const operatorUserIds = actor ? [actor.id] : [];
      addNotificationForUsers(notification, [
        ...adminUserIds,
        ...operatorUserIds,
      ]);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyQualityPending = useCallback(
    (lot: Lot) => {
      const notification = NotificationBuilder.createQualityPendingNotification(
        lot,
      );
      const qualityUserIds = getUsersByRole("quality").map((u) => u.id);
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(notification, [
        ...qualityUserIds,
        ...adminUserIds,
      ]);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyQualityApproved = useCallback(
    (
      lot: Lot,
      inspector: User,
      stage: Stage,
      nextStage?: Stage,
      nextOperator?: User,
    ) => {
      if (lot.responsibleId) {
        const operatorNotif =
          NotificationBuilder.createQualityApprovedOperatorNotification(lot);
        addNotification({ ...operatorNotif, userId: lot.responsibleId });
      }

      if (nextOperator && nextStage) {
        const nextOpNotif =
          NotificationBuilder.createQualityApprovedNextOperatorNotification(
            lot,
            nextStage,
          );
        addNotification({ ...nextOpNotif, userId: nextOperator.id });
      }

      const adminNotif =
        NotificationBuilder.createQualityApprovedAdminNotification(lot, stage);
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(adminNotif, adminUserIds);
    },
    [addNotification, addNotificationForUsers, getUsersByRole],
  );

  const notifyQualityRejected = useCallback(
    (lot: Lot, inspector: User, reason: string) => {
      if (lot.responsibleId) {
        const operatorNotif =
          NotificationBuilder.createQualityRejectedOperatorNotification(
            lot,
            reason,
          );
        addNotification({ ...operatorNotif, userId: lot.responsibleId });
      }

      const adminNotif =
        NotificationBuilder.createQualityRejectedAdminNotification(lot, reason);
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(adminNotif, adminUserIds);
    },
    [addNotification, addNotificationForUsers, getUsersByRole],
  );

  const notifyLotNearDelay = useCallback(
    (lot: Lot, stage: Stage) => {
      const notification = NotificationBuilder.createLotNearDelayNotification(
        lot,
        stage,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const operatorId = lot.responsibleId ? [lot.responsibleId] : [];
      addNotificationForUsers(notification, [...adminUserIds, ...operatorId]);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyLotDelayed = useCallback(
    (lot: Lot, stage: Stage) => {
      const notification = NotificationBuilder.createLotDelayedNotification(
        lot,
        stage,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      const operatorId = lot.responsibleId ? [lot.responsibleId] : [];
      addNotificationForUsers(notification, [...adminUserIds, ...operatorId]);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyUserCreated = useCallback(
    (actor: User, newUser: User) => {
      const notification = NotificationBuilder.createUserCreatedNotification(
        actor,
        newUser,
      );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(notification, adminUserIds);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  const notifyUserDeactivated = useCallback(
    (actor: User, deactivatedUser: User) => {
      const notification =
        NotificationBuilder.createUserDeactivatedNotification(
          actor,
          deactivatedUser,
        );
      const adminUserIds = getUsersByRole("admin").map((u) => u.id);
      addNotificationForUsers(notification, adminUserIds);
    },
    [addNotificationForUsers, getUsersByRole],
  );

  return {
    notifyLotCreated,
    notifyLotAssigned,
    notifyLotReassigned,
    notifyStageStarted,
    notifyStagePaused,
    notifyStageResumed,
    notifyStageCompleted,
    notifyQualityPending,
    notifyQualityApproved,
    notifyQualityRejected,
    notifyLotNearDelay,
    notifyLotDelayed,
    notifyUserCreated,
    notifyUserDeactivated,
  };
}
