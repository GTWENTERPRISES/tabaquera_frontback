"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LOT_STATUS_CONFIG, PRODUCTION_STAGES } from "@/lib/constants";

interface LoteDetalleProgressCardProps {
  lot: any;
  progress: number;
  currentStageIndex: number;
}

export function LoteDetalleProgressCard({
  lot,
  progress,
  currentStageIndex,
}: LoteDetalleProgressCardProps) {
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Verificar si se necesitan botones de scroll en móvil
  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const needsScroll = container.scrollWidth > container.clientWidth;
        setShowScrollButtons(needsScroll);

        // Actualizar estado de los botones
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft <
            container.scrollWidth - container.clientWidth - 5,
        );
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Escuchar eventos de scroll para actualizar botones
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft <
            container.scrollWidth - container.clientWidth - 5,
        );
      };
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full"
    >
      <Card className="border-0 shadow-sm w-full">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base font-medium">
            Progreso de Producción
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 w-full">
          {/* Progress bar */}
          <div className="mb-6 w-full">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-muted-foreground">Avance general</span>
              <span className="font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              />
            </div>
          </div>

          {/* Stage steps con scroll horizontal en móvil */}
          <div className="relative">
            {/* Botón izquierdo (solo móvil) */}
            {showScrollButtons && canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background shadow-md md:hidden"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Contenedor scrollable */}
            <div
              ref={scrollContainerRef}
              className={`
                overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent
                ${showScrollButtons ? "mx-6" : ""}
              `}
              style={{
                scrollbarWidth: "thin",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="flex gap-2 sm:gap-4 w-max sm:w-full min-w-full">
                {PRODUCTION_STAGES.map((stage, index) => {
                  const isCompleted =
                    index < currentStageIndex ||
                    lot.estado === "completado" ||
                    lot.estado === "finalizado";
                  const isCurrent =
                    index === currentStageIndex &&
                    lot.estado !== "completado" &&
                    lot.estado !== "finalizado" &&
                    lot.estado !== "rechazado";
                  const isRejected = lot.estado === "rechazado";
                  const config = LOT_STATUS_CONFIG[stage];

                  // Determinar el estado visual
                  let statusColor = "";
                  let statusBg = "";
                  let statusBorder = "";

                  if (isCompleted) {
                    statusColor = "border-green-500 bg-green-500 text-white";
                  } else if (isCurrent && !isRejected) {
                    statusColor = "border-primary bg-primary/10 text-primary";
                  } else if (isRejected && !isCompleted) {
                    statusColor = "border-red-500 bg-red-500/10 text-red-500";
                  } else {
                    statusColor = "border-muted bg-muted text-muted-foreground";
                  }

                  // Versión responsive: sizes diferentes en móvil/desktop
                  const circleSize = "h-9 w-9 sm:h-11 sm:w-11";
                  const iconSize = "h-4 w-4 sm:h-5 sm:w-5";
                  const numberSize = "text-xs sm:text-sm";

                  return (
                    <div
                      key={stage}
                      className={`
                        flex flex-col items-center text-center flex-shrink-0
                        ${PRODUCTION_STAGES.length === 5 ? "sm:flex-1" : ""}
                      `}
                      style={{ width: "70px", minWidth: "70px" }}
                    >
                      {/* Círculo de etapa */}
                      <div className="relative">
                        <div
                          className={`
                            flex items-center justify-center rounded-full border-2 transition-all duration-300
                            ${circleSize} ${statusColor}
                            ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2" : ""}
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle className={iconSize} />
                          ) : isCurrent ? (
                            <Clock className={iconSize} />
                          ) : (
                            <span className={`font-semibold ${numberSize}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Línea conectora (solo desktop y entre etapas) */}
                        {index < PRODUCTION_STAGES.length - 1 && (
                          <div className="hidden sm:block absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2">
                            <div
                              className={`
                                h-full w-full rounded-full transition-all duration-500
                                ${index < currentStageIndex ? "bg-green-500" : "bg-muted"}
                              `}
                              style={{
                                width: "calc(100% - 2rem)",
                                marginLeft: "1rem",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Etiqueta de etapa */}
                      <span className="mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight break-words max-w-[70px]">
                        {config.label}
                      </span>

                      {/* Indicador de estado actual (solo móvil) */}
                      {isCurrent && (
                        <span className="mt-1 text-[8px] text-primary font-semibold sm:hidden">
                          ACTUAL
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botón derecho (solo móvil) */}
            {showScrollButtons && canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background shadow-md md:hidden"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Indicador de posición (solo móvil) */}
          {showScrollButtons && (
            <div className="flex justify-center gap-1 mt-4 sm:hidden">
              {PRODUCTION_STAGES.map((_, index) => {
                const isActive = index === currentStageIndex;
                return (
                  <div
                    key={index}
                    className={`
                      h-1 rounded-full transition-all duration-300
                      ${isActive ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}
                    `}
                  />
                );
              })}
            </div>
          )}

          
          
        </CardContent>
      </Card>
    </motion.div>
  );
}
