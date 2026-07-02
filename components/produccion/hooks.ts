import { useState, useEffect } from "react";
import { formatDuration } from "./utils";
import type { Lot } from "@/lib/types";

export function useLiveStageTime(lot: Lot) {
  const [time, setTime] = useState("-");

  useEffect(() => {
    const currentMovement = lot.movements?.find(
      (m) => m.toStage === lot.currentStage && !m.completedAt,
    );
    if (!currentMovement?.startedAt) {
      setTime("-");
      return;
    }

    const updateTime = () => {
      const start = new Date(currentMovement.startedAt as string);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      setTime(formatDuration(diffMinutes));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lot]);

  return time;
}

export function useLiveTimer(
  startedAt?: string,
  pausedAt?: string,
  totalPausedMinutes: number = 0,
) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsedSeconds(0);
      return;
    }

    let totalPausedMs = totalPausedMinutes * 60000;

    const updateTimer = () => {
      const start = new Date(startedAt);
      const now = new Date();
      let elapsedMs = now.getTime() - start.getTime() - totalPausedMs;
      if (pausedAt) {
        const pauseStart = new Date(pausedAt);
        const pauseElapsed = now.getTime() - pauseStart.getTime();
        elapsedMs -= pauseElapsed;
      }
      const elapsedSecs = Math.max(0, Math.floor(elapsedMs / 1000));
      setElapsedSeconds(elapsedSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt, pausedAt, totalPausedMinutes]);

  return elapsedSeconds;
}
