export const ESTADOS_SOLICITUD = {
  SIN_ENTREGAR: 'Sin entregar',
  ENTREGADO: 'Entregado',
  NO_DEVUELTO: 'No devuelto'
} as const;

export type EstadoSolicitud = typeof ESTADOS_SOLICITUD[keyof typeof ESTADOS_SOLICITUD];

export interface Solicitud {
  id: string;
  elemento: string;
  fechaSolicitud: string;
  sector: string;
  estado: string;
  cantidad?: number;
}

export const SECTORES = [
  'Bovina',
  'Mantenimiento',
  'Administrativa',
  'Porcina',
  'Avícola'
];
