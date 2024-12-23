import { z } from 'zod';

export const elementoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  tipoElemento: z.string().min(1, 'El tipo de elemento es requerido'),
  cantidadInicial: z.union([
    z.string().min(1, 'La cantidad inicial es requerida'),
    z.number()
  ]).transform(val => typeof val === 'string' ? parseInt(val) : val)
    .refine(val => !isNaN(val) && val > 0, {
      message: 'La cantidad inicial debe ser un número mayor a 0'
    }),
  cantidadSuministrada: z.union([
    z.string(),
    z.number()
  ]).transform(val => typeof val === 'string' ? parseInt(val || '0') : val)
    .default(0),
  cantidadDisponible: z.union([
    z.string(),
    z.number()
  ]).transform(val => typeof val === 'string' ? parseInt(val || '0') : val)
    .default(0),
  unidadMedida: z.string().min(1, 'La unidad de medida es requerida'),
  fechaVencimiento: z.string().optional(),
  caracteristicas: z.string().optional(),
  observaciones: z.string().optional(),
});

export type ElementoFormValues = z.infer<typeof elementoSchema>;