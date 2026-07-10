"use client";

import { X } from "lucide-react";

interface ActiveFilterTagProps {
  label: string;
  onRemove: () => void;
}

export function ActiveFilterTag({ label, onRemove }: ActiveFilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary/70 transition-colors ml-0.5"
        aria-label="Quitar filtro"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
