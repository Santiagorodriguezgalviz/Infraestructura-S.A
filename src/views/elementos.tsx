import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ElementosTable } from '@/components/elementos/elementos-table';
import { ElementoModal } from '@/components/elementos/elemento-modal';
import type { Elemento } from '@/types/elementos';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Table, Search } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIAS } from '@/types/elementos';
import { getElementos, addElemento, updateElemento, deleteElemento, agregarElementosDePrueba } from '@/Firebase/Services/firestore';
import { SuccessAlert } from '@/components/elementos/success-alert';
import type { ElementoFormValues } from '@/components/elementos/elemento-modal/types';
import { generateElementosToExcel } from '@/lib/export-utils';

export function ElementosView() {
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [selectedElemento, setSelectedElemento] = useState<Elemento | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchElementos = async () => {
      try {
        console.log('Iniciando fetchElementos...');
        const data = await getElementos();
        console.log('Datos obtenidos:', data);
        if (Array.isArray(data)) {
          setElementos(data);
        } else {
          console.error('Los datos no son un array:', data);
          setElementos([]);
        }
      } catch (error) {
        console.error('Error al obtener elementos:', error);
        toast.error('Error al cargar los elementos');
        setElementos([]);
      }
    };

    fetchElementos();
  }, []);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'lowStock') {
      setSearchQuery('');
      setSelectedCategoria('todas');
      // Mostrar mensaje de que estamos viendo elementos bajo stock
      toast.info('Mostrando elementos con bajo stock');
    }
  }, [searchParams]);

  const handleEdit = (elemento: Elemento) => {
    setSelectedElemento(elemento);
    setModalOpen(true);
  };

  const handleNuevoElemento = () => {
    setSelectedElemento(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data: ElementoFormValues) => {
    try {
      if (selectedElemento) {
        await updateElemento(selectedElemento.id, data);
        setSuccessMessage({
          title: "Elemento actualizado correctamente",
          description: `Se han guardado los cambios en el elemento ${data.nombre}`
        });
      } else {
        const id = await addElemento({
          ...data,
          cantidadDisponible: parseInt(data.cantidadInicial)
        });
        console.log('Elemento creado con ID:', id);
        setSuccessMessage({
          title: "Elemento creado correctamente",
          description: `Se ha creado el elemento ${data.nombre}`
        });
      }

      // Obtener la lista actualizada de elementos
      const elementosActualizados = await getElementos();
      setElementos(elementosActualizados);
      
      setShowSuccessAlert(true);
      setModalOpen(false);
      setSelectedElemento(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el elemento');
    }
  };

  const handleDelete = async (elemento: Elemento) => {
    try {
      await deleteElemento(elemento.id);
      const elementosActualizados = await getElementos();
      setElementos(elementosActualizados);
      setSuccessMessage({
        title: "Elemento eliminado correctamente",
        description: `Se ha eliminado el elemento ${elemento.nombre}`
      });
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const handleExportToExcel = () => {
    try {
      generateElementosToExcel(filteredElementos);
      toast.success('Elementos exportados correctamente a Excel');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar los elementos');
    }
  };

  const handleExportToCSV = () => {
    try {
      const csvContent = filteredElementos.map(elemento => {
        return [
          elemento.nombre,
          elemento.categoria,
          elemento.tipoElemento,
          elemento.cantidadInicial,
          elemento.cantidadActual,
          elemento.unidadMedida,
          elemento.fechaVencimiento || '-',
        ].join(',');
      });
      
      const header = ['Nombre', 'Categoría', 'Tipo', 'Cantidad Inicial', 'Cantidad Actual', 'Unidad', 'Vencimiento'].join(',');
      const csv = [header, ...csvContent].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'elementos.csv';
      link.click();
      
      toast.success('Elementos exportados correctamente a CSV');
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      toast.error('Error al exportar los elementos');
    }
  };

  const handleAgregarDatosPrueba = async () => {
    try {
      await agregarElementosDePrueba();
      toast.success('Datos de prueba agregados correctamente');
      // Recargar los elementos
      const data = await getElementos();
      setElementos(data);
    } catch (error) {
      console.error('Error al agregar datos de prueba:', error);
      toast.error('Error al agregar datos de prueba');
    }
  };

  const filteredElementos = elementos
    .filter((elemento) => {
      const matchesSearch = elemento.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        elemento.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategoria = selectedCategoria === 'todas' || elemento.categoria === selectedCategoria;
      
      const filter = searchParams.get('filter');
      const matchesLowStock = filter === 'lowStock' ? elemento.cantidad <= elemento.stockMinimo : true;

      return matchesSearch && matchesCategoria && matchesLowStock;
    })
    .sort((a, b) => {
      const filter = searchParams.get('filter');
      if (filter === 'lowStock') {
        // Si estamos filtrando por bajo stock, ordenar por la diferencia entre cantidad y stock mínimo
        const diffA = a.cantidad - a.stockMinimo;
        const diffB = b.cantidad - b.stockMinimo;
        return diffA - diffB;
      }
      return 0;
    });

  // Paginación
  const totalItems = filteredElementos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredElementos.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Elementos</h1>
          <p className="text-muted-foreground">Gestiona el inventario de elementos</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText size={16} />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem className="gap-2" onClick={handleExportToExcel}>
                <FileText size={16} />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={handleExportToCSV}>
                <Table size={16} />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleNuevoElemento}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Elemento
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar elementos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategoria}
          onValueChange={setSelectedCategoria}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            {['todas', ...CATEGORIAS].map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <ElementosTable
          elementos={currentItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="flex items-center gap-6 py-1.5">
          <div className="flex items-center gap-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[180px] border-none bg-muted/50">
                <span>{itemsPerPage} registros</span>
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} registros
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {endIndex} de {totalItems} elementos
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((old) => Math.max(old - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-4"
            >
              Anterior
            </Button>
            <div className="text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((old) => Math.min(old + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-4"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <ElementoModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedElemento(null);
        }}
        elemento={selectedElemento}
        onSubmit={handleSubmit}
      />

      <SuccessAlert
        open={showSuccessAlert}
        onOpenChange={setShowSuccessAlert}
        title={successMessage.title}
        description={successMessage.description}
      />
    </div>
  );
}