import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Elemento } from '@/types/elementos';

interface ElementosTableProps {
  elementos: Elemento[];
  onEdit: (elemento: Elemento) => void;
  onDelete: (elemento: Elemento) => void;
}

export function ElementosTable({ elementos, onEdit, onDelete }: ElementosTableProps) {
  const [selectedElemento, setSelectedElemento] = useState<Elemento | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="h-10 px-2 text-left align-middle font-medium">Nombre</th>
              <th className="h-10 px-2 text-left align-middle font-medium">Categoría</th>
              <th className="h-10 px-2 text-left align-middle font-medium">Tipo</th>
              <th className="h-10 px-2 text-left align-middle font-medium">Cantidad Inicial</th>
              <th className="h-10 px-2 text-left align-middle font-medium">Unidad</th>
              <th className="h-10 px-2 text-left align-middle font-medium">Vencimiento</th>
              <th className="h-10 px-2 text-right align-middle font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementos.map((elemento) => (
              <tr key={elemento.id} className="border-b">
                <td className="p-2">{elemento.nombre}</td>
                <td className="p-2">{elemento.categoria}</td>
                <td className="p-2">{elemento.tipoElemento}</td>
                <td className="p-2">{elemento.cantidadInicial}</td>
                <td className="p-2">{elemento.unidadMedida}</td>
                <td className="p-2">
                  {elemento.fechaVencimiento ? (
                    <span className="text-muted-foreground">
                      {format(parseISO(elemento.fechaVencimiento), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-2">
                  <div className="flex items-center justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-accent transition-all duration-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedElemento(elemento);
                            setShowDetails(true);
                          }}
                          className="cursor-pointer text-blue-600"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onEdit(elemento)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onDelete(elemento)}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Elemento</DialogTitle>
          </DialogHeader>
          {selectedElemento && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Nombre</p>
                  <p className="text-sm text-muted-foreground">{selectedElemento.nombre}</p>
                </div>
                <div>
                  <p className="font-medium">Categoría</p>
                  <p className="text-sm text-muted-foreground">{selectedElemento.categoria}</p>
                </div>
                <div>
                  <p className="font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">{selectedElemento.tipoElemento}</p>
                </div>
                <div>
                  <p className="font-medium">Cantidad Inicial</p>
                  <p className="text-sm text-muted-foreground">{selectedElemento.cantidadInicial}</p>
                </div>
                <div>
                  <p className="font-medium">Unidad de Medida</p>
                  <p className="text-sm text-muted-foreground">{selectedElemento.unidadMedida}</p>
                </div>
                <div>
                  <p className="font-medium">Fecha de Vencimiento</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedElemento.fechaVencimiento
                      ? format(parseISO(selectedElemento.fechaVencimiento), "d 'de' MMMM 'de' yyyy", { locale: es })
                      : '-'}
                  </p>
                </div>
              </div>
              {(selectedElemento.caracteristicas || selectedElemento.observaciones) && (
                <div className="grid gap-2">
                  {selectedElemento.caracteristicas && (
                    <div>
                      <p className="font-medium">Características</p>
                      <p className="text-sm text-muted-foreground">{selectedElemento.caracteristicas}</p>
                    </div>
                  )}
                  {selectedElemento.observaciones && (
                    <div>
                      <p className="font-medium">Observaciones</p>
                      <p className="text-sm text-muted-foreground">{selectedElemento.observaciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
