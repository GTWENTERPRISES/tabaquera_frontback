import type { SystemEvent, User, Stage, Lot } from "@/lib/types";

export class EventService {
  static createSystemEvent(params: {
    lotId: string;
    lotCode?: string;
    action: string;
    detail: string;
    user: User | { id: string; nombre?: string; name?: string };
    type: "lot" | "quality" | "stage" | "alert" | "observation";
  }): SystemEvent {
    return {
      id: `evt-${Date.now()}`,
      lotId: params.lotId,
      lotCode: params.lotCode,
      action: params.action,
      detail: params.detail,
      date: new Date().toISOString(),
      userId: params.user.id,
      userName: params.user.nombre || params.user.name || "Sistema",
      type: params.type,
    };
  }
}
