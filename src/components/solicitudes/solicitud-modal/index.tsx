import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SECTORES } from '@/types/solicitudes';
import { solicitudSchema, type SolicitudFormValues, type Sector } from './types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Solicitud } from '../constants';
import { SuccessAlert } from '../success-alert';
import { getElementos } from '@/Firebase/Services/firestore';
import type { Elemento } from '@/types/elementos';

interface SolicitudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud: Solicitud | null;
  onSubmit: (data: SolicitudFormValues) => void;
}

export function SolicitudModal({ open, onOpenChange, solicitud, onSubmit }: SolicitudModalProps) {
  const [elementos, setElementos] = useState<Elemento[]>([]);

  useEffect(() => {
    const fetchElementos = async () => {
      try {
        const data = await getElementos();
        if (Array.isArray(data)) {
          setElementos(data);
        }
      } catch (error) {
        console.error('Error al cargar elementos:', error);
      }
    };

    fetchElementos();
  }, []);

  const form = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: {
      elementoId: '',
      fechaSolicitud: new Date().toISOString(),
      sector: SECTORES[0],
      cantidad: 1
    }
  });

  const [openCombobox, setOpenCombobox] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedElemento = elementos.find(
    (elemento) => elemento.id === form.watch('elementoId')
  );

  const handleClose = () => {
    form.reset({
      elementoId: '',
      fechaSolicitud: new Date().toISOString(),
      sector: SECTORES[0],
      cantidad: 1
    });
    setOpenCombobox(false);
    setOpenCalendar(false);
    onOpenChange(false);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const elementoSeleccionado = elementos.find(e => e.id === data.elementoId);
      if (!elementoSeleccionado) {
        throw new Error('Elemento no encontrado');
      }

      onSubmit({
        ...data,
        elemento: elementoSeleccionado.nombre // Aseguramos que se envíe el nombre del elemento
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        elementoId: '',
        fechaSolicitud: new Date().toISOString(),
        sector: SECTORES[0],
        cantidad: 1
      });
    } else if (solicitud) {
      const elementoId = elementos.find(e => e.nombre === solicitud.elemento)?.id || '';
      const sector = SECTORES.includes(solicitud.sector as Sector) ? solicitud.sector : SECTORES[0];
      form.reset({
        elementoId,
        fechaSolicitud: solicitud.fechaSolicitud,
        sector: sector as Sector,
        cantidad: solicitud.cantidad || 1
      });
    }
  }, [open, solicitud, form, elementos]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {solicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedElemento ? selectedElemento.nombre : "Seleccionar elemento..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar elemento..." />
                  <CommandEmpty>No se encontraron elementos.</CommandEmpty>
                  <CommandGroup>
                    {elementos.map((elemento) => (
                      <CommandItem
                        key={elemento.id}
                        value={elemento.nombre}
                        onSelect={() => {
                          form.setValue('elementoId', elemento.id);
                          setOpenCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            elemento.id === form.watch('elementoId') ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {elemento.nombre}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch('fechaSolicitud') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('fechaSolicitud') ? (
                    format(new Date(form.watch('fechaSolicitud')), "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(form.watch('fechaSolicitud'))}
                  onSelect={(date) => {
                    if (date) {
                      form.setValue('fechaSolicitud', date.toISOString());
                      setOpenCalendar(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select 
              value={form.watch('sector')}
              onValueChange={(value) => form.setValue('sector', value as Sector)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORES.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Cantidad"
              value={form.watch('cantidad')}
              onChange={(e) => form.setValue('cantidad', parseInt(e.target.value))}
              min={1}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {solicitud ? 'Guardar cambios' : 'Crear solicitud'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessAlert
        open={showSuccess}
        onOpenChange={(open) => {
          setShowSuccess(open);
          if (!open) handleClose();
        }}
        title={solicitud ? "Solicitud actualizada" : "Solicitud creada"}
        description={solicitud ? "La solicitud ha sido actualizada correctamente" : "La solicitud ha sido creada correctamente"}
      />
    </>
  );
}