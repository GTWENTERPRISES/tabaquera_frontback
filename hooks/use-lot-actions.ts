"use client";

import { useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Lot, LotFilters, Stage, LotStatus, User, LotStageHistory, LotMovement, LegacyLotState, Movement, SystemEvent, Observation } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { MovementService } from "@/services/movement.service";
import { EventService } from "@/services/event.service";

export function useLotActions(
  lots: Lot[],
  setLots: Dispatch<SetStateAction<Lot[]>>,
  setMovements: Dispatch<SetStateAction<Movement[]>>,
  setObservations: Dispatch<SetStateAction<Observation[]>>,
  setSystemEvents: Dispatch<SetStateAction<SystemEvent[]>>,
) {
  const { user } = useAuth();

  const getLotById = useCallback((id: string): Lot | undefined => {
    return lots.find((lot: Lot) => lot.id === id);
  }, [lots]);

  const addLot = useCallback((
    lotData: Omit<
      Lot,
      | "id"
      | "codigo"
      | "code"
      | "estado"
      | "currentStage"
      | "fechaIngreso"
      | "qrCode"
      | "responsable"
      | "stageHistory"
      | "lastUpdatedAt"
    >,
  ) => {
    if (!user) return;
    const currentYear = new Date().getFullYear();
    const lotCount = lots.filter((l: Lot) => l.codigo?.startsWith(`LT-${currentYear}-`)).length + 1;
    const codigo = `LT-${currentYear}-${String(lotCount).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const lotId = `lot-${Date.now()}`;

    // Initial stage history
    const initialStageHistory: LotStageHistory = {
      id: `hist-${lotId}-reception`,
      lotId,
      stage: "reception",
      startTime: now,
      responsibleUserId: user.id,
      responsibleUserName: user.nombre || user.name,
    };

    // Initial lot movement
    const initialLotMovement: LotMovement = {
      id: `mov-${lotId}-reception`,
      lotId,
      toStage: "reception",
      userId: user.id,
      userName: user.nombre || user.name,
      userRole: user.rol || user.role,
      startedAt: now,
      quantityReceived: lotData.currentWeight || lotData.initialWeight,
    };

    const newLot: Lot = {
      ...lotData,
      id: lotId,
      codigo,
      code: codigo,
      estado: "reception",
      currentStage: "reception",
      fechaIngreso: now,
      qrCode: `https://goldenleaf.com/verify/${codigo}`,
      responsable: { nombre: user.nombre || user.name },
      responsibleId: user.id,
      stageHistory: [initialStageHistory],
      movements: [initialLotMovement],
      lastUpdatedAt: now,
    };

    setLots((prev: Lot[]) => [...prev, newLot]);

    // Add movement record for lot creation
    const newMovement = MovementService.createMovement({
      lotId: newLot.id,
      type: "stage_change",
      description: "Lote registrado",
      userId: user.id,
      userName: user.nombre || user.name,
    });
    setMovements((prev: Movement[]) => [...prev, newMovement]);

    // System event
    const sysEvent = EventService.createSystemEvent({
      lotId: newLot.id,
      lotCode: codigo,
      action: "Lote registrado",
      detail: `${user.nombre || user.name} registró el lote ${codigo}`,
      user,
      type: "lot",
    });
    setSystemEvents((prev: SystemEvent[]) => [sysEvent, ...prev]);
  }, [lots, user, setLots, setMovements, setSystemEvents]);

  const updateLotStatus = useCallback((lotId: string, status: LotStatus) => {
    setLots((prev: Lot[]) =>
      prev.map((lot: Lot) =>
        lot.id === lotId
          ? { ...lot, estado: status as unknown as LegacyLotState }
          : lot,
      ),
    );
  }, [setLots]);

  const moveLotToStage = useCallback((
    lotId: string,
    newStage: Stage,
    observation?: string,
    quantityReceived?: number,
    delayReason?: string,
  ) => {
    const lot = lots.find((l: Lot) => l.id === lotId);
    if (!lot || !user) return;

    const previousStage = lot.currentStage;
    const now = new Date().toISOString();
    const currentTime = new Date();

    // Find the current movement to complete it
    const currentMovement = lot.movements.find(
      (m: LotMovement) => m.toStage === previousStage && !m.completedAt,
    );
    let durationMinutes: number | undefined = undefined;
    if (currentMovement?.startedAt) {
      const start = new Date(currentMovement.startedAt);
      durationMinutes = Math.floor(
        (currentTime.getTime() - start.getTime()) / 60000,
      );
    }

    // Update the lot and its stage history and movements
    setLots((prev: Lot[]) =>
      prev.map((l: Lot) => {
        if (l.id === lotId) {
          // Close the previous stage in history
          const updatedHistory = l.stageHistory.map((h: LotStageHistory) => {
            if (h.stage === previousStage && !h.endTime) {
              return { ...h, endTime: now, durationMinutes };
            }
            return h;
          });

          // Close the previous movement
          const updatedMovements = l.movements.map((m: LotMovement) => {
            if (m.toStage === previousStage && !m.completedAt) {
              return { ...m, completedAt: now, durationMinutes, isDelayed: !!delayReason, delayReason: delayReason as any };
            }
            return m;
          });

          // Add the new stage to history
          const newStageHistory: LotStageHistory = {
            id: `hist-${lotId}-${newStage}-${Date.now()}`,
            lotId,
            stage: newStage,
            startTime: now,
            responsibleUserId: user.id,
            responsibleUserName: user.nombre || user.name,
            observations: observation,
          };

          // Create new lot movement
          const newLotMovement: LotMovement = {
            id: `mov-${lotId}-${newStage}-${Date.now()}`,
            lotId,
            fromStage: previousStage,
            toStage: newStage,
            userId: user.id,
            userName: user.nombre || user.name,
            userRole: user.rol || user.role,
            startedAt: now,
            observations: observation,
            quantityReceived,
            isDelayed: !!delayReason,
            delayReason: delayReason as any,
          };

          // Create a system event
          const newSystemEvent = EventService.createSystemEvent({
            lotId,
            lotCode: lot.codigo || lot.code,
            action: "Cambio de etapa",
            detail: `${user.nombre || user.name} movió ${lot.codigo || lot.code} de ${previousStage} a ${newStage}${observation ? ` - Observación: ${observation}` : ""}`,
            user,
            type: "stage",
          });
          setSystemEvents((prev: SystemEvent[]) => [newSystemEvent, ...prev]);

          // Add observation if provided
          if (observation) {
            const newObservation: Observation = {
              id: `obs-${Date.now()}`,
              lotId,
              lotCode: lot.codigo || lot.code,
              stage: newStage,
              text: observation,
              date: now,
              userId: user.id,
              userName: user.nombre || user.name,
            };
            setObservations((prev: Observation[]) => [...prev, newObservation]);
          }

          return {
            ...l,
            currentStage: newStage,
            estado: newStage as LegacyLotState,
            stageHistory: [...updatedHistory, newStageHistory],
            movements: [...updatedMovements, newLotMovement],
            lastUpdatedAt: now,
          };
        }
        return l;
      }),
    );

    // Add movement record
    const newMovement = MovementService.createMovement({
      lotId,
      type: "stage_change",
      description: `Cambio de etapa: ${previousStage} → ${newStage}`,
      userId: user.id,
      userName: user.nombre || user.name,
      fromStage: previousStage,
      toStage: newStage,
      details: { observation },
    });
    setMovements((prev: Movement[]) => [...prev, newMovement]);
  }, [lots, user, setLots, setMovements, setObservations, setSystemEvents]);

  const completeLot = useCallback((lotId: string, observation?: string) => {
    const lot = lots.find((l: Lot) => l.id === lotId);
    if (!lot || !user) return;

    const now = new Date().toISOString();
    const currentTime = new Date();
    const previousStage = lot.currentStage;

    // Complete the last stage movement and history
    const currentMovement = lot.movements.find(
      (m: LotMovement) => m.toStage === previousStage && !m.completedAt,
    );
    let durationMinutes: number | undefined = undefined;
    if (currentMovement?.startedAt) {
      const start = new Date(currentMovement.startedAt);
      durationMinutes = Math.floor(
        (currentTime.getTime() - start.getTime()) / 60000,
      );
    }

    setLots((prev: Lot[]) =>
      prev.map((l: Lot) => {
        if (l.id === lotId) {
          // Close the last stage in history
          const updatedHistory = l.stageHistory.map((h: LotStageHistory) => {
            if (h.stage === previousStage && !h.endTime) {
              return { ...h, endTime: now, durationMinutes };
            }
            return h;
          });

          // Close the last movement
          const updatedMovements = l.movements.map((m: LotMovement) => {
            if (m.toStage === previousStage && !m.completedAt) {
              return { ...m, completedAt: now, durationMinutes };
            }
            return m;
          });

          // System event
          const newSystemEvent = EventService.createSystemEvent({
            lotId,
            lotCode: lot.codigo || lot.code,
            action: "Lote completado",
            detail: `${user.nombre || user.name} completó el lote ${lot.codigo || lot.code}${observation ? ` - Observación: ${observation}` : ""}`,
            user,
            type: "lot",
          });
          setSystemEvents((prev: SystemEvent[]) => [newSystemEvent, ...prev]);

          // Add observation if provided
          if (observation) {
            const newObservation: Observation = {
              id: `obs-${Date.now()}`,
              lotId,
              lotCode: lot.codigo || lot.code,
              stage: previousStage,
              text: observation,
              date: now,
              userId: user.id,
              userName: user.nombre || user.name,
            };
            setObservations((prev: Observation[]) => [...prev, newObservation]);
          }

          return {
            ...l,
            status: "completed" as LotStatus,
            estado: "completado",
            stageHistory: updatedHistory,
            movements: updatedMovements,
            lastUpdatedAt: now,
          };
        }
        return l;
      }),
    );

    // Add movement record
    const newMovement = MovementService.createMovement({
      lotId,
      type: "stage_change",
      description: "Lote completado",
      userId: user.id,
      userName: user.nombre || user.name,
      fromStage: previousStage,
      toStage: "completado" as Stage,
      details: { observation },
    });
    setMovements((prev: Movement[]) => [...prev, newMovement]);
  }, [lots, user, setLots, setMovements, setObservations, setSystemEvents]);

  const reasignarLote = useCallback((lotId: string, responsable: { nombre: string }) => {
    if (!user) return;
    const now = new Date().toISOString();
    setLots((prev: Lot[]) =>
      prev.map((l: Lot) => {
        if (l.id === lotId) {
          const newSystemEvent = EventService.createSystemEvent({
            lotId,
            lotCode: l.codigo || l.code,
            action: "Reasignación de lote",
            detail: `${user.nombre || user.name} reasignó lote ${l.codigo || l.code} a ${responsable.nombre}`,
            user,
            type: "stage",
          });
          setSystemEvents((prev: SystemEvent[]) => [newSystemEvent, ...prev]);

          return {
            ...l,
            responsable,
            lastUpdatedAt: now,
          };
        }
        return l;
      }),
    );
  }, [user, setLots, setSystemEvents]);

  const addObservation = useCallback((obs: Omit<Observation, "id" | "date">) => {
    const lot = lots.find((l: Lot) => l.id === obs.lotId);
    if (!lot) return;
    const now = new Date().toISOString();
    const newObs: Observation = { ...obs, id: `obs-${Date.now()}`, date: now };
    setObservations((prev: Observation[]) => [newObs, ...prev]);

    // Add as movement
    const newMovement = MovementService.createMovement({
      lotId: obs.lotId,
      type: "observation",
      description: obs.text,
      userId: obs.userId,
      userName: obs.userName,
    });
    setMovements((prev: Movement[]) => [...prev, newMovement]);

    // System event
    const sysEvent = EventService.createSystemEvent({
      lotId: obs.lotId,
      lotCode: obs.lotCode,
      action: "Observación registrada",
      detail: `${obs.userName} agregó observación en ${obs.lotCode}: "${obs.text}"`,
      user: { id: obs.userId, nombre: obs.userName },
      type: "observation",
    });
    setSystemEvents((prev: SystemEvent[]) => [sysEvent, ...prev]);
  }, [lots, setObservations, setMovements, setSystemEvents]);

  return {
    getLotById,
    addLot,
    updateLotStatus,
    moveLotToStage,
    completeLot,
    reasignarLote,
    addObservation,
  };
}
