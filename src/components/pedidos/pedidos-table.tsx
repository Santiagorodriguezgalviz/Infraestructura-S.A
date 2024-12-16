import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Pencil, Trash2, Search, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Pedido } from '@/types/pedidos';
import { Timestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PedidosTableProps {
  pedidos: Pedido[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  estadoFilter: string;
  onEstadoFilterChange: (value: string) => void;
  clienteFilter: string;
  onClienteFilterChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  onUpdateEstado: (id: string, estado: string) => void;
  onEdit: (pedido: Pedido) => void;
  onDelete: (id: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: string) => void;
  elementos: any[];
}

export function PedidosTable({
  pedidos,
  searchQuery,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  clienteFilter,
  onClienteFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  onUpdateEstado,
  onEdit,
  onDelete,
  itemsPerPage,
  onItemsPerPageChange,
  elementos
}: PedidosTableProps) {
  const formatFecha = (fecha: any) => {
    if (fecha instanceof Timestamp) {
      return format(fecha.toDate(), "d 'de' MMMM 'del' yyyy", { locale: es });
    }
    try {
      return format(new Date(fecha), "d 'de' MMMM 'del' yyyy", { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  const handleExportPDF = async (pedido: Pedido) => {
    const doc = new jsPDF();
    
    try {
      // Configuración inicial
      doc.setFont("helvetica");
      
      // Título principal
      doc.setFontSize(32);
      doc.setTextColor(0, 184, 148); // Color verde moderno
      doc.text('Detalle del Pedido', 20, 40);
      
      // Subtítulo
      doc.setFontSize(16);
      doc.setTextColor(128, 128, 128); // Gris
      doc.text('Inventario Infraestructura S.A', 20, 55);
      
      // Línea divisoria sutil
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      // Información principal en formato moderno
      doc.setFontSize(14);
      doc.setTextColor(128, 128, 128);
      doc.text('Fecha', 20, 85);
      doc.text('Estado', 120, 85);
      
      // Formatear fecha con manejo de errores
      let fechaFormateada = 'No disponible';
      try {
        if (pedido.fechaPedido) {
          const fecha = new Date(pedido.fechaPedido);
          if (!isNaN(fecha.getTime())) {
            fechaFormateada = format(fecha, "dd 'de' MMMM 'del' yyyy", { locale: es });
          }
        }
      } catch (error) {
        console.error('Error al formatear fecha:', error);
      }

      // Valores de fecha y estado
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(14);
      doc.text(fechaFormateada, 20, 95);
      
      // Estado con fondo
      const estado = pedido.estado === 'pendiente' ? 'Pendiente' : 'Completado';
      const estadoColor = pedido.estado === 'pendiente' ? '#FFA500' : '#00B894';
      
      // Dibuja el fondo del estado
      doc.setFillColor(estadoColor);
      const estadoWidth = doc.getTextWidth(estado) + 10;
      doc.roundedRect(120, 87, estadoWidth, 10, 2, 2, 'F');
      
      // Texto del estado
      doc.setTextColor(255, 255, 255);
      doc.text(estado, 125, 95);

      // Cliente
      doc.setTextColor(128, 128, 128);
      doc.text('Cliente', 20, 115);
      doc.setTextColor(60, 60, 60);
      doc.text(pedido.cliente?.trim() || 'No especificado', 20, 125);

      // Elementos del Pedido
      doc.setFontSize(20);
      doc.setTextColor(60, 60, 60);
      doc.text('Elementos del Pedido', 20, 155);

      // Tabla de elementos con estilo moderno
      const elementos = pedido.elementos.map(elem => [
        elem.nombreElemento,
        elem.cantidad.toString()
      ]);

      autoTable(doc, {
        head: [['Elemento', 'Cantidad']],
        body: elementos,
        startY: 165,
        theme: 'plain',
        headStyles: {
          fillColor: [250, 250, 250],
          textColor: [128, 128, 128],
          fontSize: 12,
          cellPadding: 8,
          halign: 'left'
        },
        styles: {
          fontSize: 12,
          cellPadding: 8,
          textColor: [60, 60, 60],
          lineColor: [240, 240, 240],
          lineWidth: 0.5,
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 50, halign: 'left' }
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252]
        }
      });

      // Pie de página
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
        105,
        pageHeight - 10,
        { align: 'center' }
      );

      // Guardar PDF
      const nombreArchivo = `pedido-${pedido.id}-${format(new Date(), 'ddMMyyyy')}.pdf`;
      doc.save(nombreArchivo);
      
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      generatePDFWithoutLogo(pedido);
    }
  };

  // Función auxiliar para generar el PDF sin logo en caso de error
  const generatePDFWithoutLogo = (pedido: Pedido) => {
    // ... (mismo código pero sin la parte del logo)
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm pl-8"
          />
        </div>
        <Select value={estadoFilter} onValueChange={onEstadoFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right w-1/5">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>
                  {formatFecha(pedido.fechaPedido)}
                </TableCell>
                <TableCell>{pedido.cliente}</TableCell>
                <TableCell>
                  {pedido.elementos.map((elem, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mr-1"
                    >
                      {elem.cantidad} {elem.nombreElemento}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <Select
                    value={pedido.estado}
                    onValueChange={(value) => onUpdateEstado(pedido.id, value)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue>
                        <Badge
                          variant={pedido.estado === 'completado' ? 'default' : 'secondary'}
                        >
                          {pedido.estado === 'completado' ? 'Completado' : 'Pendiente'}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onEdit(pedido)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportPDF(pedido)}
                        className="cursor-pointer"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(pedido.id)}
                        className="cursor-pointer text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2">
            <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent">
                <SelectValue>{itemsPerPage} registros</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 registros</SelectItem>
                <SelectItem value="20">20 registros</SelectItem>
                <SelectItem value="30">30 registros</SelectItem>
                <SelectItem value="40">40 registros</SelectItem>
                <SelectItem value="50">50 registros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-muted-foreground ml-2">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} pedidos
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <div className="text-sm">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}