import { z } from 'zod';
import { Elemento } from './elementos';

export type EstadoSolicitud = 'pendiente' | 'entregado' | 'rechazado';
export type Sector = 'Bovina' | 'Mantenimiento' | 'Administrativa' | 'Porcina' | 'Avícola';

export const SolicitudSchema = z.object({
  id: z.string().optional(),
  elemento: z.object({
    id: z.string(),
    nombre: z.string(),
    cantidad: z.number(),
    unidadMedida: z.string(),
    estado: z.string()
  }),
  fechaSolicitud: z.string(),
  sector: z.string(),
  estado: z.enum(['pendiente', 'entregado', 'rechazado']),
  cantidad: z.number(),
  observaciones: z.string().optional()
});

export type Solicitud = z.infer<typeof SolicitudSchema>;

export const ESTADOS_SOLICITUD = ['pendiente', 'entregado', 'rechazado'] as const;

export const SECTORES: Sector[] = [
  'Bovina',
  'Mantenimiento',
  'Administrativa',
  'Porcina',
  'Avícola'
];

export const SOLICITUDES_MOCK: Solicitud[] = [
  {
    id: '1',
    elemento: {
      id: '1',
      nombre: 'Martillo',
      cantidad: 1,
      unidadMedida: 'unidad',
      estado: 'disponible'
    },
    fechaSolicitud: new Date().toISOString(),
    sector: 'Mantenimiento',
    estado: 'pendiente',
    cantidad: 1,
    observaciones: 'Urgente'
  },
  {
    id: '2',
    elemento: {
      id: '2',
      nombre: 'Destornillador',
      cantidad: 2,
      unidadMedida: 'unidad',
      estado: 'disponible'
    },
    fechaSolicitud: new Date().toISOString(),
    sector: 'Producción',
    estado: 'entregado',
    cantidad: 2
  }
];