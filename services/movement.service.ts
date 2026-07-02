import type { Movement, LotMovement, Lot, Stage, User } from "@/lib/types";

export class MovementService {
  static createMovement(params: {
    lotId: string;
    lotCode?: string;
    type: Movement["type"];
    description: string;
    userId: string;
    userName: string;
    fromStage?: Stage;
    toStage?: Stage;
    details?: any;
  }): Movement {
    const now = new Date();
    return {
      id: `mov-${Date.now()}`,
      lotId: params.lotId,
      type: params.type,
      tipo: params.type === "stage_change" ? "etapa" :
            params.type === "quality_check" ? "calidad" :
            params.type === "observation" ? "observacion" : "etapa",
      description: params.description,
      descripcion: params.description,
      date: now.toISOString(),
      fecha: now,
      userId: params.userId,
      userName: params.userName,
      usuario: { nombre: params.userName },
      fromStage: params.fromStage,
      toStage: params.toStage,
      details: params.details,
    };
  }

  static createLotMovement(params: {
    lotId: string;
    lotCode?: string;
    fromStage?: Stage;
    toStage: Stage;
    user: User;
    startedAt: string;
    observations?: string;
    quantityReceived?: number;
    isDelayed?: boolean;
    delayReason?: string;
  }): LotMovement {
    return {
      id: `mov-${params.lotId}-${params.toStage}-${Date.now()}`,
      lotId: params.lotId,
      fromStage: params.fromStage,
      toStage: params.toStage,
      userId: params.user.id,
      userName: params.user.nombre || params.user.name,
      userRole: params.user.rol || params.user.role,
      startedAt: params.startedAt,
      observations: params.observations,
      quantityReceived: params.quantityReceived,
      isDelayed: !!params.isDelayed,
      delayReason: params.delayReason as any,
    };
  }
}
