import { z } from 'zod';

export interface Elemento {
  id: string;
  nombre: string;
  categoria: string;
  tipoElemento: string;
  cantidadInicial: number;
  cantidadActual: number;
  cantidadDisponible: number;
  unidadMedida: string;
  estado: 'disponible' | 'no-disponible';
  descripcion: string;
  ubicacion: string;
  caracteristicas?: string;
  observaciones?: string;
  fechaVencimiento?: string;
  consumos?: any[];
}

export const elementoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  tipoElemento: z.string(),
  cantidadInicial: z.number(),
  cantidadActual: z.number(),
  cantidadDisponible: z.number(),
  unidadMedida: z.string(),
  estado: z.enum(['disponible', 'no-disponible']),
  descripcion: z.string(),
  ubicacion: z.string(),
  caracteristicas: z.string().optional(),
  observaciones: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  consumos: z.array(z.any()).optional()
});

export const TIPOS_ELEMENTO = [
  'Herramienta',
  'Material',
  'Equipo',
  'Insumo',
  'Repuesto'
] as const;

export const UNIDADES_MEDIDA = [
  'Unidad',
  'Metro',
  'Kilogramo',
  'Litro',
  'Metro cuadrado',
  'Metro cúbico'
] as const;

export const CATEGORIAS = [
  'Material eléctrico',
  'Material de construcción',
  'Material de pintura',
  'Herramienta manual',
  'Herramienta eléctrica',
  'Equipo de medición',
  'Equipo de seguridad',
  'Accesorio de plomería',
  'Insumo de limpieza',
  'Repuesto mecánico'
] as const;

export const ElementoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string(),
  descripcion: z.string(),
  categoria: z.string(),
  ubicacion: z.string(),
  estado: z.enum(['disponible', 'no-disponible']),
  cantidad: z.number(),
  cantidadDisponible: z.number(),
  unidadMedida: z.string(),
  caracteristicas: z.string().optional(),
  observaciones: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  consumos: z.array(z.any()).optional()
});

export type ElementoNuevo = z.infer<typeof ElementoSchema>;

export const ELEMENTOS_MOCK: ElementoNuevo[] = [
  {
    id: '1',
    nombre: 'Martillo',
    descripcion: 'Martillo de carpintería',
    categoria: 'Herramientas',
    ubicacion: 'Almacén principal',
    estado: 'disponible',
    cantidad: 10,
    cantidadDisponible: 8,
    unidadMedida: 'unidad',
    caracteristicas: 'Mango de madera, cabeza de acero',
    observaciones: 'Buen estado'
  },
  {
    id: '2',
    nombre: 'Destornillador',
    descripcion: 'Destornillador Phillips',
    categoria: 'Herramientas',
    ubicacion: 'Almacén principal',
    estado: 'disponible',
    cantidad: 15,
    cantidadDisponible: 12,
    unidadMedida: 'unidad',
    caracteristicas: 'Punta Phillips, mango ergonómico',
    observaciones: 'Nuevo'
  }
];