import { z } from "zod";

export const lotSchema = z.object({
  proveedor: z.string().min(1, "Selecciona un proveedor"),
  peso: z.coerce.number().min(1, "El peso debe ser mayor a 0"),
  origen: z.string().min(1, "Selecciona un origen"),
  variedad: z.string().min(1, "Selecciona una variedad"),
  cantidadBultos: z.coerce
    .number()
    .min(1, "La cantidad de bultos debe ser mayor a 0"),
  calidad: z.string().min(1, "Selecciona una calidad"),
  observaciones: z.string().optional(),
});

export type LotFormData = z.infer<typeof lotSchema>;
