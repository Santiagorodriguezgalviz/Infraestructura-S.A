import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PedidosTable } from '@/components/pedidos/pedidos-table';
import { PedidoModal } from '@/components/pedidos/pedido-modal';
import { type Pedido } from '@/types/pedidos';
import type { PedidoFormValues } from '@/components/pedidos/pedido-modal/types';
import { type Elemento } from '@/types/elementos';
import { 
  getPedidos, 
  addPedido, 
  updatePedido, 
  deletePedido,
  getElementos,
  updateElementoCantidadSuministrada 
} from '@/Firebase/Services/firestore';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

export function PedidosView() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'all' | 'pendiente' | 'entregado' | 'rechazado'>('all');
  const [clienteFilter, setClienteFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState<{ title: string; description: string } | null>(null);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pedidosData, elementosData] = await Promise.all([
          getPedidos(),
          getElementos()
        ]);
        setPedidos(pedidosData);
        setElementos(elementosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateEstado = async (id: string, nuevoEstado: 'pendiente' | 'entregado' | 'rechazado') => {
    try {
      const pedidoActual = pedidos.find(p => p.id === id);
      if (!pedidoActual || !pedidoActual.id) return;

      if (nuevoEstado === 'pendiente') {
        console.log('Restando cantidades para pedido:', id);
        for (const elemento of pedidoActual.elementos) {
          if (elemento.id) {
            console.log(`Restando ${elemento.cantidad} de ${elemento.id}`);
            await updateElementoCantidadSuministrada(elemento.id, -elemento.cantidad);
          }
        }
      }

      await updatePedido(pedidoActual.id, { estado: nuevoEstado });

      setPedidos(prevPedidos =>
        prevPedidos.map(pedido =>
          pedido.id === id
            ? { ...pedido, estado: nuevoEstado }
            : pedido
        )
      );

      setSuccessMessage({
        title: 'Estado actualizado',
        description: `El estado del pedido ha sido actualizado a ${nuevoEstado}`
      });
      setSuccessAlertOpen(true);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleSubmit = async (data: PedidoFormValues) => {
    try {
      if (selectedPedido && selectedPedido.id) {
        await updatePedido(selectedPedido.id, {
          ...data,
          estado: data.estado || 'pendiente'
        } as Pedido);
        
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === selectedPedido.id
              ? { ...pedido, ...data }
              : pedido
          )
        );

        setSuccessMessage({
          title: 'Pedido actualizado',
          description: 'El pedido ha sido actualizado exitosamente'
        });
      } else {
        const newPedido = {
          ...data,
          fechaPedido: new Date().toISOString(),
          estado: 'pendiente' as const
        };

        for (const elemento of data.elementos) {
          if (elemento.id) {
            console.log(`Restando ${elemento.cantidad} de ${elemento.id} para nuevo pedido`);
            await updateElementoCantidadSuministrada(elemento.id, -elemento.cantidad);
          }
        }

        const id = await addPedido(newPedido);
        const pedidoCompleto = { ...newPedido, id };
        
        setPedidos(prevPedidos => [...prevPedidos, pedidoCompleto]);

        setSuccessMessage({
          title: 'Pedido creado',
          description: 'El pedido ha sido creado exitosamente'
        });
      }

      setSuccessAlertOpen(true);
      setModalOpen(false);
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error al guardar pedido:', error);
    }
  };

  const handleDelete = async (pedidoId: string) => {
    try {
      await deletePedido(pedidoId);
      setSuccessMessage({
        title: 'Pedido eliminado',
        description: 'El pedido ha sido eliminado exitosamente.'
      });
      setSuccessAlertOpen(true);
      
      const updatedPedidos = await getPedidos();
      setPedidos(updatedPedidos);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'Hubo un error al eliminar el pedido.'
      });
      setSuccessAlertOpen(true);
    }
  };

  const handleCreatePedido = async (data: PedidoFormValues) => {
    try {
      const newPedido = {
        ...data,
        fechaPedido: new Date().toISOString(),
        estado: 'pendiente' as const
      };

      await addPedido(newPedido);

      // Como el pedido es nuevo y pendiente, restamos las cantidades
      for (const elemento of data.elementos) {
        if (elemento.id) {
          console.log(`Restando ${elemento.cantidad} de ${elemento.id} para nuevo pedido`);
          await updateElementoCantidadSuministrada(elemento.id, -elemento.cantidad);
        }
      }

      // Recargamos los datos
      const pedidosActualizados = await getPedidos();
      setPedidos(pedidosActualizados);

      setSuccessMessage({
        title: 'Pedido creado',
        description: 'El pedido ha sido creado y las cantidades han sido actualizadas.'
      });
      setSuccessAlertOpen(true);
      setModalOpen(false);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'Hubo un error al crear el pedido.'
      });
      setSuccessAlertOpen(true);
    }
  };

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(pedido => {
      const matchesSearch = pedido.cliente?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery;
      const matchesEstado = estadoFilter === 'all' || pedido.estado === estadoFilter;
      const matchesCliente = clienteFilter === 'all' || pedido.cliente === clienteFilter;
      return matchesSearch && matchesEstado && matchesCliente;
    });
  }, [pedidos, searchQuery, estadoFilter, clienteFilter]);

  const paginatedPedidos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPedidos.slice(startIndex, endIndex);
  }, [filteredPedidos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleEdit = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
        <h1 className="text-3xl font-bold text-primary">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los pedidos del sistema
          </p>
        </div>
        <Button onClick={() => {
          setSelectedPedido(null);
          setModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <PedidosTable
          pedidos={paginatedPedidos}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          estadoFilter={estadoFilter}
          onEstadoFilterChange={setEstadoFilter}
          clienteFilter={clienteFilter}
          onClienteFilterChange={setClienteFilter}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredPedidos.length}
          onUpdateEstado={handleUpdateEstado}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      <PedidoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={selectedPedido ? handleSubmit : handleCreatePedido}
        pedido={selectedPedido}
      />

      <AlertDialog open={successAlertOpen} onOpenChange={setSuccessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {successMessage?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {successMessage?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}