import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { type Solicitud, SECTORES } from "@/types/solicitudes";
import { getElementos } from "@/Firebase/Services/firestore";
import { toast } from "sonner";
import type { Elemento } from "@/types/elementos";

interface SolicitudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  solicitud?: Solicitud | null;
}

const sectores = SECTORES.map(sector => ({
  value: sector.toLowerCase(),
  label: sector
}));

export function SolicitudModal({
  open,
  onOpenChange,
  onSubmit,
  solicitud,
}: SolicitudModalProps) {
  const [elementoId, setElementoId] = useState(solicitud?.elementoId || '');
  const [nombreElemento, setNombreElemento] = useState(solicitud?.nombreElemento || '');
  const [fecha, setFecha] = useState<Date>(
    solicitud?.fechaSolicitud ? new Date(solicitud.fechaSolicitud) : new Date()
  );
  const [sector, setSector] = useState(solicitud?.sector || 'Bovina');
  const [cantidad, setCantidad] = useState(solicitud?.cantidad?.toString() || '1');
  const [observaciones, setObservaciones] = useState(solicitud?.observaciones || '');
  const [openElemento, setOpenElemento] = useState(false);
  const [openSector, setOpenSector] = useState(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementoSeleccionado, setElementoSeleccionado] = useState<Elemento | null>(null);

  useEffect(() => {
    if (solicitud) {
      setElementoId(solicitud.elementoId || '');
      setNombreElemento(solicitud.nombreElemento || '');
      setFecha(new Date(solicitud.fechaSolicitud));
      setSector(solicitud.sector || 'Bovina');
      setCantidad(solicitud.cantidad?.toString() || '1');
      setObservaciones(solicitud.observaciones || '');
    }
  }, [solicitud]);

  useEffect(() => {
    const fetchElementos = async () => {
      try {
        const elementosData = await getElementos();
        setElementos(elementosData);

        // Si hay una solicitud seleccionada, establecer el elemento
        if (solicitud?.elementoId) {
          const elementoEncontrado = elementosData.find(e => e.id === solicitud.elementoId);
          if (elementoEncontrado) {
            setElementoSeleccionado(elementoEncontrado);
            setNombreElemento(elementoEncontrado.nombre);
          }
        }
      } catch (error) {
        console.error("Error al cargar elementos:", error);
        toast.error("Error al cargar los elementos");
      }
    };

    fetchElementos();
  }, [solicitud]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!elementoId) {
      toast.error("Por favor selecciona un elemento");
      return;
    }

    if (!sector) {
      toast.error("Por favor selecciona un sector");
      return;
    }

    if (!cantidad || parseInt(cantidad) < 1) {
      toast.error("Por favor ingresa una cantidad válida");
      return;
    }

    const cantidadSolicitada = parseInt(cantidad);
    
    if (!elementoSeleccionado) {
      toast.error("Error: No se encontró el elemento seleccionado");
      return;
    }

    // Si es una edición, validamos contra la cantidad disponible más la cantidad actual de la solicitud
    const cantidadDisponibleReal = solicitud 
      ? elementoSeleccionado.cantidadDisponible + solicitud.cantidad 
      : elementoSeleccionado.cantidadDisponible;

    if (cantidadSolicitada > cantidadDisponibleReal) {
      toast.error(`No hay suficientes unidades disponibles. Cantidad disponible: ${cantidadDisponibleReal}`);
      return;
    }
    
    onSubmit({
      elementoId: elementoId,
      nombreElemento: elementoSeleccionado.nombre,
      fechaSolicitud: fecha.toISOString(),
      sector,
      cantidad: cantidadSolicitada,
      observaciones,
      estado: solicitud?.estado || 'pendiente'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {solicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Popover open={openElemento} onOpenChange={setOpenElemento}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openElemento}
                className="w-full justify-between"
              >
                {elementoId
                  ? elementos.find((item) => item.id === elementoId)?.nombre
                  : "Seleccionar elemento..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar elemento..." />
                <CommandEmpty>No se encontró ningún elemento.</CommandEmpty>
                <CommandGroup>
                  {elementos.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={(currentValue) => {
                        const elemento = elementos.find(e => e.id === currentValue);
                        if (elemento) {
                          setElementoId(currentValue);
                          setElementoSeleccionado(elemento);
                          setNombreElemento(elemento.nombre);
                          // Mostrar la cantidad disponible
                          toast.info(`Cantidad disponible: ${elemento.cantidadDisponible} unidades`);
                        }
                        setOpenElemento(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          elementoId === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.nombre} ({item.cantidadDisponible} disponibles)
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fecha && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fecha ? (
                  format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={(date) => date && setFecha(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover open={openSector} onOpenChange={setOpenSector}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSector}
                className="w-full justify-between"
              >
                {sector
                  ? sectores.find((item) => item.value === sector.toLowerCase())?.label
                  : "Seleccionar sector..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar sector..." />
                <CommandEmpty>No se encontró ningún sector.</CommandEmpty>
                <CommandGroup>
                  {sectores.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={(currentValue) => {
                        setSector(currentValue === sector ? "" : currentValue)
                        setOpenSector(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          sector.toLowerCase() === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => {
                const value = e.target.value;
                setCantidad(value);
                
                // Validar cantidad en tiempo real
                if (elementoSeleccionado) {
                  const cantidadSolicitada = parseInt(value);
                  const cantidadDisponibleReal = solicitud 
                    ? elementoSeleccionado.cantidadDisponible + solicitud.cantidad 
                    : elementoSeleccionado.cantidadDisponible;
                    
                  if (cantidadSolicitada > cantidadDisponibleReal) {
                    toast.error(`La cantidad solicitada excede la disponible (${cantidadDisponibleReal})`);
                  }
                }
              }}
              min="1"
            />
            {elementoSeleccionado && (
              <p className="text-sm text-muted-foreground">
                Cantidad disponible: {elementoSeleccionado.cantidadDisponible} unidades
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {solicitud ? 'Guardar cambios' : 'Crear solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
