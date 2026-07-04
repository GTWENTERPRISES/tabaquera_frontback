"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ErrorSeverity = "error" | "warning" | "info";

export interface AppError {
  id: string;
  title: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  details?: string;
}

interface ErrorContextType {
  errors: AppError[];
  showError: (title: string, message: string, details?: string) => void;
  showWarning: (title: string, message: string, details?: string) => void;
  showInfo: (title: string, message: string, details?: string) => void;
  dismissError: (id: string) => void;
  clearAll: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback(
    (title: string, message: string, severity: ErrorSeverity, details?: string) => {
      const newError: AppError = {
        id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        message,
        severity,
        timestamp: new Date(),
        details,
      };
      setErrors((prev) => [...prev, newError]);
    },
    [],
  );

  const showError = useCallback(
    (title: string, message: string, details?: string) =>
      addError(title, message, "error", details),
    [addError],
  );

  const showWarning = useCallback(
    (title: string, message: string, details?: string) =>
      addError(title, message, "warning", details),
    [addError],
  );

  const showInfo = useCallback(
    (title: string, message: string, details?: string) =>
      addError(title, message, "info", details),
    [addError],
  );

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => setErrors([]), []);

  return (
    <ErrorContext.Provider
      value={{ errors, showError, showWarning, showInfo, dismissError, clearAll }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
