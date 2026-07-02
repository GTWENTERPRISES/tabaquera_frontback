"use client";

import { useRef, useState } from "react";
import { Camera, FileText, Loader2, X, ZoomIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { Evidence } from "@/lib/types";

interface TabEvidenciasProps {
  evidence: Evidence[];
  uploadingFiles: Set<string>;
  onUploadEvidence: (
    files: FileList | null,
    type: "photo" | "document",
  ) => void;
  onRemoveEvidence: (id: string) => void;
}

export function TabEvidencias({
  evidence,
  uploadingFiles,
  onUploadEvidence,
  onRemoveEvidence,
}: TabEvidenciasProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);

  return (
    <>
      <div className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Evidencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hidden file inputs */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadEvidence(e.target.files, "photo")}
            />
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => onUploadEvidence(e.target.files, "document")}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => photoInputRef.current?.click()}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Subir Foto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => documentInputRef.current?.click()}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </div>

            {/* Uploading indicator */}
            {uploadingFiles.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Subiendo archivo...</span>
              </div>
            )}

            {evidence.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidence.map((e) => {
                  const isUploading = uploadingFiles.has(e.id);
                  return (
                    <div
                      key={e.id}
                      className="relative group flex flex-col gap-2 p-3 border rounded-lg bg-card"
                    >
                      {/* Preview/Icon */}
                      <div className="w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {e.type === "photo" ? (
                          <img
                            src={e.url}
                            alt={e.name || "Foto"}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setPreviewEvidence(e)}
                          />
                        ) : (
                          <FileText className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {e.name}
                          </span>
                          {e.fileSize && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(e.fileSize / 1024)} KB
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {e.type === "photo" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setPreviewEvidence(e)}
                                >
                                  <ZoomIn className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onRemoveEvidence(e.id)}
                                disabled={isUploading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewEvidence}
        onOpenChange={(open) => !open && setPreviewEvidence(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 sm:p-6">
          {previewEvidence?.type === "photo" ? (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4 sm:p-0 sm:pb-4">
                <DialogTitle>{previewEvidence.name}</DialogTitle>
                <DialogClose className="absolute right-4 top-4" />
              </DialogHeader>
              <div className="flex-1 overflow-auto flex items-center justify-center bg-black/5 rounded-lg">
                <img
                  src={previewEvidence.url}
                  alt={previewEvidence.name || "Preview"}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-0">
              <DialogHeader className="pb-4">
                <DialogTitle>{previewEvidence?.name}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-12 bg-muted rounded-lg">
                <FileText className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Vista previa solo disponible para imágenes
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
