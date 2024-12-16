import { z } from 'zod';
import type { Elemento } from './elementos';

export interface ElementoPedido {
  elementoId: string;
  cantidad: number;
  nombreElemento: string;
  unidadMedida: string;
}

export interface Pedido {
  id: string;
  fechaPedido: string;
  cliente?: string;
  elementos: ElementoPedido[];
  estado: 'pendiente' | 'completado';
}

export const pedidoSchema = z.object({
  fechaPedido: z.string().min(1, 'La fecha es requerida'),
  cliente: z.string().optional(),
  elementos: z.array(z.object({
    elementoId: z.string().min(1, 'El elemento es requerido'),
    cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    nombreElemento: z.string(),
    unidadMedida: z.string()
  })).min(1, 'Debe seleccionar al menos un elemento'),
});

export type PedidoFormValues = z.infer<typeof pedidoSchema>;

export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: '1',
    fechaPedido: '2024-03-20',
    cliente: 'Juan Pérez',
    elementos: [
      { elementoId: '1', cantidad: 5, nombreElemento: 'Tubo PVC', unidadMedida: 'Unidad' },
      { elementoId: '2', cantidad: 10, nombreElemento: 'Cable eléctrico', unidadMedida: 'Metro' }
    ],
    estado: 'pendiente'
  }
];