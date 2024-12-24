import { type ElementoPedido } from '@/types/pedidos';

export interface PedidoFormValues {
  cliente: string;
  fechaPedido: string;
  elementos: ElementoPedido[];
  estado?: 'pendiente' | 'entregado' | 'rechazado';
  observaciones?: string;
}
