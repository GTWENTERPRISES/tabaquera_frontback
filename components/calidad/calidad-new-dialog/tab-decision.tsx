"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { REJECTION_REASON_LABELS, FINAL_DECISION_LABELS } from "./constants";
import type { UseFormReturn } from "react-hook-form";
import type { QualityCheckFormData } from "./use-quality-check-form";
import type { RejectionReason } from "@/lib/types";

interface TabDecisionProps {
  form: UseFormReturn<QualityCheckFormData>;
  watchStatus: string;
  onToggleRejectionReason: (reason: RejectionReason) => void;
}

export function TabDecision({
  form,
  watchStatus,
  onToggleRejectionReason,
}: TabDecisionProps) {
  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Decisión Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="finalDecision"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Decisión *</FormLabel>
                <div className="space-y-3">
                  {Object.entries(FINAL_DECISION_LABELS).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => field.onChange(key)}
                    >
                      <FormControl>
                        <input
                          type="radio"
                          name="finalDecision"
                          value={key}
                          checked={field.value === key}
                          onChange={() => field.onChange(key)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchStatus === "failed" && (
            <div className="mt-4 space-y-3">
              <FormLabel>Motivos de Rechazo</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(REJECTION_REASON_LABELS).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    <Checkbox
                      checked={(form.getValues("rejectionReasons") || []).includes(key as RejectionReason)}
                      onCheckedChange={() => onToggleRejectionReason(key as RejectionReason)}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
