import { z } from 'zod';

export const SECTORES = ['Bovina', 'Mantenimiento', 'Administrativa'] as const;

export type Sector = typeof SECTORES[number];

export interface Solicitud {
  id: string;
  elementoId: string;
  nombreElemento: string;
  fechaSolicitud: string;
  sector: Sector;
  cantidad: number;
  estado: 'pendiente' | 'entregado';
}

export const solicitudSchema = z.object({
  id: z.string(),
  elementoId: z.string(),
  nombreElemento: z.string(),
  fechaSolicitud: z.string(),
  sector: z.enum(SECTORES),
  cantidad: z.number().min(1),
  estado: z.enum(['pendiente', 'entregado'])
});

export const SOLICITUDES_MOCK: Solicitud[] = [
  {
    id: '1',
    elementoId: '1',
    nombreElemento: 'Tubo PVC',
    fechaSolicitud: '2024-03-20',
    sector: 'Bovina',
    cantidad: 2,
    estado: 'pendiente'
  },
  {
    id: '2',
    elementoId: '2',
    nombreElemento: 'Cable eléctrico',
    fechaSolicitud: '2024-03-19',
    sector: 'Mantenimiento',
    cantidad: 5,
    estado: 'entregado'
  },
  {
    id: '3',
    elementoId: '3',
    nombreElemento: 'Pintura base agua',
    fechaSolicitud: '2024-03-18',
    sector: 'Administrativa',
    cantidad: 1,
    estado: 'pendiente'
  }
];