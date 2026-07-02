"use client";

import { QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { LoteQR } from "@/components/lots/LoteQR";
import type { Lot } from "@/lib/types";

interface LoteQRDialogProps {
  lot: Lot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoteQRDialog({ lot, open, onOpenChange }: LoteQRDialogProps) {
  if (!lot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Codigo QR - {lot.codigo || lot.code}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="py-4">
          <LoteQR lot={lot} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
