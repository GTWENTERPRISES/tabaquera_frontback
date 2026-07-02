"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ChecklistItem } from "@/lib/types";

interface TabChecklistProps {
  checklist: ChecklistItem[];
  onToggleChecklist: (id: string) => void;
}

export function TabChecklist({ checklist, onToggleChecklist }: TabChecklistProps) {
  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Inspección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={item.passed}
                onCheckedChange={() => onToggleChecklist(item.id)}
              />
              <span className="flex-1">{item.label}</span>
              {item.passed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
