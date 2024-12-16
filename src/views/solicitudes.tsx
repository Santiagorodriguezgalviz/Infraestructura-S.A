import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { SolicitudesTable } from '@/components/solicitudes/solicitudes-table';
import { SolicitudModal } from '@/components/solicitudes/solicitud-modal';
import type { Solicitud } from '@/components/solicitudes/constants';
import { 
  getSolicitudes, 
  addSolicitud, 
  updateSolicitud, 
  deleteSolicitud,
  agregarSolicitudesDePrueba,
  getElementos,
  updateElementoCantidad
} from '@/Firebase/Services/firestore';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

export function SolicitudesView() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [elementos, setElementos] = useState([]);
  const [successMessage, setSuccessMessage] = useState<{ title: string; description: string } | null>(null);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await getSolicitudes();
        if (Array.isArray(data)) {
          setSolicitudes(data);
        } else {
          console.error('Los datos no son un array:', data);
          setSolicitudes([]);
        }
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        setSuccessMessage({
          title: 'Error',
          description: 'Error al cargar las solicitudes'
        });
        setSuccessAlertOpen(true);
        setSolicitudes([]);
      }
    };

    fetchSolicitudes();
  }, []);

  // Filtrar solicitudes
  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = searchQuery ? solicitud.elemento.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesEstado = estadoFilter === 'all' || solicitud.estado === estadoFilter;
    const matchesSector = sectorFilter === 'all' || solicitud.sector.toLowerCase() === sectorFilter.toLowerCase();
    return matchesSearch && matchesEstado && matchesSector;
  });

  // Calcular los índices de inicio y fin para la paginación
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredSolicitudes.length);
  const paginatedSolicitudes = filteredSolicitudes.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredSolicitudes.length / pageSize);

  const handleUpdateEstado = async (solicitudId: string, nuevoEstado: string) => {
    try {
      const solicitudActual = solicitudes.find(s => s.id === solicitudId);
      if (!solicitudActual) return;

      console.log('Estado actual:', solicitudActual.estado, 'Nuevo estado:', nuevoEstado);

      // Si cambiamos de entregado a pendiente
      if (solicitudActual.estado === 'entregado' && nuevoEstado === 'pendiente') {
        console.log('Restando cantidades para solicitud:', solicitudId);
        // Restamos las cantidades porque los elementos vuelven a estar prestados
        await updateElementoCantidad(solicitudActual.elementoId, -solicitudActual.cantidad);
      }
      // Si cambiamos de pendiente a entregado
      else if (solicitudActual.estado === 'pendiente' && nuevoEstado === 'entregado') {
        console.log('Sumando cantidades para solicitud:', solicitudId);
        // Sumamos las cantidades porque los elementos fueron devueltos
        await updateElementoCantidad(solicitudActual.elementoId, solicitudActual.cantidad);
      }

      // Actualizamos el estado de la solicitud
      await updateSolicitud(solicitudId, { estado: nuevoEstado });

      // Recargamos los elementos y solicitudes para mostrar las cantidades actualizadas
      console.log('Recargando datos...');
      const [elementosActualizados, solicitudesActualizadas] = await Promise.all([
        getElementos(),
        getSolicitudes()
      ]);
      
      setElementos(elementosActualizados);
      setSolicitudes(solicitudesActualizadas);
      
      setSuccessMessage({
        title: 'Solicitud actualizada',
        description: nuevoEstado === 'entregado' 
          ? 'Los elementos han sido devueltos y el inventario ha sido actualizado.'
          : 'La solicitud ha sido actualizada y el inventario ha sido ajustado.'
      });
      setSuccessAlertOpen(true);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'Hubo un error al actualizar el estado de la solicitud'
      });
      setSuccessAlertOpen(true);
    }
  };

  const handleCreateSolicitud = async (data: any) => {
    try {
      // Creamos la solicitud como pendiente
      const newSolicitud = {
        ...data,
        fechaSolicitud: new Date().toISOString(),
        estado: 'pendiente'
      };

      // Primero restamos la cantidad del inventario
      await updateElementoCantidad(data.elementoId, -data.cantidad);

      // Luego creamos la solicitud
      const id = await addSolicitud(newSolicitud);

      // Recargamos los datos
      const [elementosActualizados, solicitudesActualizadas] = await Promise.all([
        getElementos(),
        getSolicitudes()
      ]);
      
      setElementos(elementosActualizados);
      setSolicitudes(solicitudesActualizadas);

      setSuccessMessage({
        title: 'Solicitud creada',
        description: 'La solicitud ha sido creada y las cantidades han sido actualizadas.'
      });
      setSuccessAlertOpen(true);
      setModalOpen(false);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'Hubo un error al crear la solicitud'
      });
      setSuccessAlertOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
      return;
    }

    try {
      await deleteSolicitud(id);
      setSuccessMessage({
        title: 'Solicitud eliminada',
        description: 'La solicitud ha sido eliminada con éxito.'
      });
      setSuccessAlertOpen(true);
      const solicitudesActualizadas = await getSolicitudes();
      setSolicitudes(solicitudesActualizadas);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'Error al eliminar la solicitud'
      });
      setSuccessAlertOpen(true);
    }
  };

  const handleEdit = (solicitud: Solicitud) => {
    setSelectedSolicitud({
      id: solicitud.id,
      nombreElemento: solicitud.nombreElemento,
      cantidad: solicitud.cantidad.toString(),
      sector: solicitud.sector,
      fechaSolicitud: format(new Date(solicitud.fechaSolicitud), 'yyyy-MM-dd'),
      estado: solicitud.estado,
      observaciones: solicitud.observaciones || '',
      elementoId: solicitud.elementoId,
      cantidadAnterior: solicitud.cantidad // Guardamos la cantidad anterior para restaurar el inventario si es necesario
    });
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedSolicitud) {
        await updateSolicitud(selectedSolicitud.id, data);
        setSuccessMessage({
          title: 'Solicitud actualizada',
          description: 'La solicitud ha sido actualizada correctamente.'
        });
        setSuccessAlertOpen(true);
      } else {
        await handleCreateSolicitud(data);
      }

      // Actualizar la lista de solicitudes
      const solicitudesActualizadas = await getSolicitudes();
      setSolicitudes(solicitudesActualizadas);
      setModalOpen(false);
      setSelectedSolicitud(null);
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'Error al procesar la solicitud'
      });
      setSuccessAlertOpen(true);
    }
  };

  const handlePageChange = (newPage: number) => {
    // Asegurarse de que no podemos ir a una página inválida
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Solicitudes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las solicitudes de elementos
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Solicitud
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por elemento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="sin-entregar">Sin entregar</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los sectores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            <SelectItem value="bovina">Bovina</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            <SelectItem value="administrativa">Administrativa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px]">Elemento</TableHead>
                <TableHead className="w-[180px]">Fecha de Solicitud</TableHead>
                <TableHead className="w-[150px]">Sector</TableHead>
                <TableHead className="w-[120px]">Cantidad</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[80px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSolicitudes.map((solicitud) => (
                <TableRow key={solicitud.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{solicitud.nombreElemento}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(solicitud.fechaSolicitud), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>{solicitud.sector}</TableCell>
                  <TableCell>{solicitud.cantidad}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        solicitud.estado === 'entregado'
                          ? 'success'
                          : solicitud.estado === 'pendiente'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {solicitud.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(solicitud)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(solicitud.id)} className="cursor-pointer text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUpdateEstado(solicitud.id, 'entregado')}
                          disabled={solicitud.estado === 'entregado'}
                          className="cursor-pointer text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como entregado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateEstado(solicitud.id, 'pendiente')}
                          disabled={solicitud.estado === 'pendiente'}
                          className="cursor-pointer text-yellow-600"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Marcar como pendiente
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
          <div className="flex items-center space-x-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[130px] border-none bg-muted/50">
                <SelectValue>{pageSize} registros</SelectValue>
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} registros
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {endIndex} de {filteredSolicitudes.length} elementos
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="h-8 w-24 px-0 font-normal"
            >
              Anterior
            </Button>

            <p className="text-sm">
              Página {currentPage + 1} de {totalPages}
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="h-8 w-24 px-0 font-normal"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <SolicitudModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        solicitud={selectedSolicitud}
      />

      <AlertDialog open={successAlertOpen} onOpenChange={setSuccessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
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