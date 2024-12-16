import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, X, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { type Solicitud } from "@/types/solicitudes";
import { DeleteAlert } from "./delete-alert";
import { toast } from "sonner";

interface SolicitudesTableProps {
  solicitudes: Solicitud[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onUpdateEstado: (id: string, estado: string) => void;
  onEdit: (solicitud: Solicitud) => void;
  onDelete: (id: string) => void;
}

export function SolicitudesTable({
  solicitudes,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onUpdateEstado,
  onEdit,
  onDelete,
}: SolicitudesTableProps) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [solicitudToDelete, setSolicitudToDelete] = useState<string | null>(null);

  const handleDeleteClick = (solicitudId: string) => {
    setSolicitudToDelete(solicitudId);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (solicitudToDelete) {
      onDelete(solicitudToDelete);
      setDeleteAlertOpen(false);
      setSolicitudToDelete(null);
      toast.success("Solicitud eliminada correctamente");
    }
  };

  const handleUpdateEstado = (solicitudId: string, nuevoEstado: string) => {
    onUpdateEstado(solicitudId, nuevoEstado);
    toast.success(`Solicitud marcada como ${nuevoEstado}`);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elemento</TableHead>
              <TableHead>Fecha de Solicitud</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.map((solicitud) => (
              <TableRow key={solicitud.id}>
                <TableCell>
                  {solicitud.elementoNombre || 'No disponible'}
                </TableCell>
                <TableCell>
                  {format(new Date(solicitud.fechaSolicitud), "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>{solicitud.sector}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      solicitud.estado === "entregado"
                        ? "success"
                        : solicitud.estado === "no-devuelto"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {solicitud.estado}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => handleUpdateEstado(solicitud.id, "entregado")}>
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como entregado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateEstado(solicitud.id, "sin-entregar")}>
                        <X className="mr-2 h-4 w-4" />
                        Marcar como sin entregar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(solicitud)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(solicitud.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
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

      <div className="flex items-center justify-between space-x-2 py-4">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue>{pageSize} registros</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 registros</SelectItem>
            <SelectItem value="20">20 registros</SelectItem>
            <SelectItem value="30">30 registros</SelectItem>
            <SelectItem value="40">40 registros</SelectItem>
            <SelectItem value="50">50 registros</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando {solicitudes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} a{" "}
          {Math.min(currentPage * pageSize, solicitudes.length)} de {solicitudes.length} elementos
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
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

      <DeleteAlert
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteAlertOpen(false);
          setSolicitudToDelete(null);
        }}
      />
    </>
  );
}