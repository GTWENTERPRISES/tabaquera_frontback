"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseQrScannerOptions {
  onScan: (data: string) => void;
}

export function useQrScanner({ onScan }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const QrScannerRef = useRef<any>(null);

  // Load QR scanner library dynamically
  useEffect(() => {
    import("qr-scanner").then((module) => {
      QrScannerRef.current = module.default;
      setLibraryLoaded(true);
    }).catch((err) => {
      console.error("Failed to load QR scanner library:", err);
      setError("No se pudo cargar el escáner QR.");
    });
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ),
      );
    };
    checkMobile();
  }, []);

  // Scan function using canvas
  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !QrScannerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Try to scan QR code
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = await QrScannerRef.current.scanImage(imageData, {
        returnDetailedScanResult: true,
      });

      if (qrCode) {
        stopScanner();
        onScan(qrCode.data);
        toast.success("Código QR escaneado!");
        return;
      }
    } catch (err) {
      // No QR code found, continue scanning
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  };

  const startScanner = async () => {
    if (!libraryLoaded) {
      toast.error("Cargando escáner...");
      return;
    }

    setError(null);
    setIsScanning(true);

    try {
      // Request camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start scanning loop
      scanFrame();
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);

      // Handle different types of errors
      let errorMessage = "Error al acceder a la cámara.";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.message.includes("Permission denied")) {
          errorMessage = "Permiso de cámara denegado. Por favor, habilita el permiso en la configuración de tu navegador y recarga la página.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No se encontró ninguna cámara.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "La cámara está siendo usada por otra aplicación.";
        } else if (err.name === "OverconstrainedError") {
          errorMessage = "No se pudo acceder a la cámara con las características solicitadas.";
        } else {
          errorMessage = err.message || "Error al acceder a la cámara.";
        }
      }

      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const restartScanner = () => {
    stopScanner();
    setTimeout(startScanner, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isScanning,
    hasPermission,
    error,
    setError,
    isMobile,
    libraryLoaded,
    startScanner,
    stopScanner,
    restartScanner,
  };
}
