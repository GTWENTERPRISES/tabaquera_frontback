"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, CheckCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProcesoDetalleTimerProps {
  isRunning: boolean;
  elapsedTime: number;
  progress: number;
  onStartPause: () => void;
  onComplete: () => void;
  status: string;
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function ProcesoDetalleTimer({
  isRunning,
  elapsedTime,
  progress,
  onStartPause,
  onComplete,
  status,
}: ProcesoDetalleTimerProps) {
  return (
    <Card className="border-0 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Control de Proceso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 w-full">
        <div className="flex items-center justify-center">
          <motion.div
            className="relative w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center"
            animate={{ borderColor: isRunning ? "var(--primary)" : "var(--muted)" }}
          >
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-foreground">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
            </div>
            {isRunning && (
              <motion.div
                className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
        </div>

        <div className="space-y-2 w-full">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 w-full" />
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            size="lg"
            variant={isRunning ? "outline" : "default"}
            onClick={onStartPause}
            disabled={status === "completed"}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pausar
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                {status === "pending" ? "Iniciar" : "Continuar"}
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="default"
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={onComplete}
            disabled={status === "completed"}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Completar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
