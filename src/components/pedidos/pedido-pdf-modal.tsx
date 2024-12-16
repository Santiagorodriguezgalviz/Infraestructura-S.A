import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { PedidosPDF } from './pedidos-pdf';
import type { Pedido } from '@/types/pedidos';

interface PedidoPDFModalProps {
  open: boolean;
  onClose: () => void;
  pedido: Pedido;
}

export function PedidoPDFModal({ open, onClose, pedido }: PedidoPDFModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <PedidosPDF pedido={pedido} />
      </DialogContent>
    </Dialog>
  );
}
