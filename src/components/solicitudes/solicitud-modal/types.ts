import { z } from 'zod';
import { SECTORES } from '@/types/solicitudes';

export const solicitudSchema = z.object({
  elementoId: z.string().min(1, 'Debe seleccionar un elemento'),
  fechaSolicitud: z.string().min(1, 'La fecha es requerida'),
  sector: z.enum(SECTORES, {
    errorMap: () => ({ message: 'Debe seleccionar un sector' })
  }),
  cantidad: z.number().min(1, 'La cantidad debe ser al menos 1').max(999999, 'La cantidad es muy alta')
});

export type SolicitudFormValues = z.infer<typeof solicitudSchema>;