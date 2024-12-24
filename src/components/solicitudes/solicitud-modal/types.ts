import { z } from 'zod';
import { SECTORES, type Sector } from '@/types/solicitudes';

const sectorEnum = z.enum(SECTORES as unknown as [string, ...string[]]);

export const solicitudSchema = z.object({
  elementoId: z.string().min(1, 'Debe seleccionar un elemento'),
  elemento: z.string().optional(),
  fechaSolicitud: z.string().min(1, 'La fecha es requerida'),
  sector: sectorEnum,
  cantidad: z.number().min(1, 'La cantidad debe ser al menos 1').max(999999, 'La cantidad es muy alta')
});

export type SolicitudFormValues = z.infer<typeof solicitudSchema>;
export type { Sector };