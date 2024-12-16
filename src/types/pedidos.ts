import { z } from 'zod';

export const ElementoPedidoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string(),
  cantidad: z.number(),
  unidadMedida: z.string(),
  estado: z.enum(['pendiente', 'entregado', 'rechazado']),
  observaciones: z.string().optional()
});

export type ElementoPedido = z.infer<typeof ElementoPedidoSchema>;

export const PedidoSchema = z.object({
  id: z.string().optional(),
  cliente: z.string(),
  fechaPedido: z.string(),
  elementos: z.array(ElementoPedidoSchema),
  estado: z.enum(['pendiente', 'entregado', 'rechazado']),
  observaciones: z.string().optional()
});

export type Pedido = z.infer<typeof PedidoSchema>;

export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: '1',
    cliente: 'Juan Pérez',
    fechaPedido: new Date().toISOString(),
    elementos: [
      {
        id: '1',
        nombre: 'Martillo',
        cantidad: 2,
        unidadMedida: 'unidad',
        estado: 'pendiente'
      },
      {
        id: '2',
        nombre: 'Destornillador',
        cantidad: 3,
        unidadMedida: 'unidad',
        estado: 'pendiente'
      }
    ],
    estado: 'pendiente',
    observaciones: 'Pedido urgente'
  },
  {
    id: '2',
    cliente: 'María García',
    fechaPedido: new Date().toISOString(),
    elementos: [
      {
        id: '3',
        nombre: 'Cable eléctrico',
        cantidad: 10,
        unidadMedida: 'metro',
        estado: 'entregado'
      }
    ],
    estado: 'entregado'
  }
];