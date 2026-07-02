"use client";

import { useCallback } from "react";
import type { Lot, SystemEvent, Movement } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { EventService } from "@/services/event.service";

export function useWorkActions(
  lots: Lot[],
  setLots: React.Dispatch<React.SetStateAction<Lot[]>>,
  setSystemEvents: React.Dispatch<React.SetStateAction<SystemEvent[]>>,
) {
  const { user } = useAuth();

  const iniciarTrabajo = useCallback((lotId: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    setLots((prev) =>
      prev.map((l) => {
        if (l.id === lotId) {
          const updatedMovements = l.movements?.map((mov) => {
            if (
              mov.toStage === l.currentStage &&
              !mov.completedAt &&
              !mov.startedAt
            ) {
              return {
                ...mov,
                startedAt: now,
                userId: user.id,
                userName: user.nombre || user.name,
                userRole: user.rol || user.role,
              };
            }
            return mov;
          }) || [];

          const newSystemEvent = EventService.createSystemEvent({
            lotId,
            lotCode: l.codigo || l.code,
            action: "Inicio de trabajo",
            detail: `${user.nombre || user.name} inició trabajo en ${STAGE_LABELS[l.currentStage]} para ${l.codigo || l.code}`,
            user,
            type: "stage",
          });
          setSystemEvents((prev) => [newSystemEvent, ...prev]);

          return {
            ...l,
            responsable: { nombre: user.nombre || user.name },
            movements: updatedMovements,
            lastUpdatedAt: now,
          };
        }
        return l;
      }),
    );
  }, [user, setLots, setSystemEvents]);

  const pausarTrabajo = useCallback((lotId: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    setLots((prev) =>
      prev.map((l) => {
        if (l.id === lotId) {
          const updatedMovements = l.movements?.map((mov) => {
            if (
              mov.toStage === l.currentStage &&
              !mov.completedAt &&
              mov.startedAt &&
              !mov.pausedAt
            ) {
              return { ...mov, pausedAt: now };
            }
            return mov;
          }) || [];

          const newSystemEvent = EventService.createSystemEvent({
            lotId,
            lotCode: l.codigo || l.code,
            action: "Pausa de trabajo",
            detail: `${user.nombre || user.name} pausó el trabajo en ${STAGE_LABELS[l.currentStage]} para ${l.codigo || l.code}`,
            user,
            type: "stage",
          });
          setSystemEvents((prev) => [newSystemEvent, ...prev]);

          return {
            ...l,
            movements: updatedMovements,
            lastUpdatedAt: now,
          };
        }
        return l;
      }),
    );
  }, [user, setLots, setSystemEvents]);

  const reanudarTrabajo = useCallback((lotId: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    setLots((prev) =>
      prev.map((l) => {
        if (l.id === lotId) {
          const updatedMovements = l.movements?.map((mov) => {
            if (
              mov.toStage === l.currentStage &&
              !mov.completedAt &&
              mov.pausedAt
            ) {
              const pauseStart = new Date(mov.pausedAt);
              const pauseEnd = new Date(now);
              const pauseDuration = Math.floor(
                (pauseEnd.getTime() - pauseStart.getTime()) / 60000,
              );
              const { pausedAt, ...rest } = mov;
              return {
                ...rest,
                resumedAt: now,
                totalPausedMinutes: (mov.totalPausedMinutes || 0) + pauseDuration,
              };
            }
            return mov;
          }) || [];

          const newSystemEvent = EventService.createSystemEvent({
            lotId,
            lotCode: l.codigo || l.code,
            action: "Reanudación de trabajo",
            detail: `${user.nombre || user.name} reanudó el trabajo en ${STAGE_LABELS[l.currentStage]} para ${l.codigo || l.code}`,
            user,
            type: "stage",
          });
          setSystemEvents((prev) => [newSystemEvent, ...prev]);

          return {
            ...l,
            movements: updatedMovements,
            lastUpdatedAt: now,
          };
        }
        return l;
      }),
    );
  }, [user, setLots, setSystemEvents]);

  return {
    iniciarTrabajo,
    pausarTrabajo,
    reanudarTrabajo,
  };
}
