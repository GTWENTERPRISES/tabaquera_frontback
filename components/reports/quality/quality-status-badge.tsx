import { Badge } from "@/components/ui/badge";
import type { QualityCheck } from "@/lib/types";

export function QualityStatusBadge({ status }: { status: QualityCheck["status"] }) {
  if (status === "passed") return <Badge variant="default">Aprobado</Badge>;
  if (status === "failed") return <Badge variant="destructive">Rechazado</Badge>;
  return <Badge variant="secondary">Observaciones</Badge>;
}
