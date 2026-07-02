"use client";

import { Keyboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ManualInputProps {
  manualCode: string;
  setManualCode: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ManualInput({ manualCode, setManualCode, onSubmit }: ManualInputProps) {
  return (
    <Card className="border-0 shadow-sm mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Ingresar código manualmente
          </span>
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            placeholder="LT-2026-001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="font-mono"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
