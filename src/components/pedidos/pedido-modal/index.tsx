import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PedidoSchema, type PedidoFormValues, type Pedido } from '@/types/pedidos';
import { ElementoSelector } from './elemento-selector';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

interface PedidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PedidoFormValues) => void;
  pedido?: Pedido | null;
}

export function PedidoModal({
  open,
  onOpenChange,
  onSubmit,
  pedido
}: PedidoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  const getInitialDate = (fechaPedido: any) => {
    if (!fechaPedido) return new Date();
    if (fechaPedido instanceof Timestamp) {
      return fechaPedido.toDate();
    }
    try {
      return new Date(fechaPedido);
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  };

  const defaultValues: PedidoFormValues = useMemo(() => {
    if (pedido) {
      const initialDate = getInitialDate(pedido.fechaPedido);
      return {
        fechaPedido: initialDate.toISOString(),
        cliente: pedido.cliente || '',
        elementos: pedido.elementos.map(elem => ({
          elementoId: elem.elementoId || '',
          cantidad: elem.cantidad || 1,
          nombreElemento: elem.nombreElemento || '',
          unidadMedida: elem.unidadMedida || ''
        }))
      };
    }
    return {
      fechaPedido: new Date().toISOString(),
      cliente: '',
      elementos: [{ elementoId: '', cantidad: 1, nombreElemento: '', unidadMedida: '' }]
    };
  }, [pedido]);

  const methods = useForm<PedidoFormValues>({
    resolver: zodResolver(PedidoSchema),
    defaultValues
  });

  useEffect(() => {
    if (pedido) {
      const initialDate = getInitialDate(pedido.fechaPedido);
      methods.reset({
        fechaPedido: initialDate.toISOString(),
        cliente: pedido.cliente || '',
        elementos: pedido.elementos.map(elem => ({
          elementoId: elem.elementoId || '',
          cantidad: elem.cantidad || 1,
          nombreElemento: elem.nombreElemento || '',
          unidadMedida: elem.unidadMedida || ''
        }))
      });
    } else {
      methods.reset({
        fechaPedido: new Date().toISOString(),
        cliente: '',
        elementos: [{ elementoId: '', cantidad: 1, nombreElemento: '', unidadMedida: '' }]
      });
    }
  }, [pedido, methods]);

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "elementos"
  });

  const handleClose = () => {
    if (!isSubmitting) {
      methods.reset();
      setOpenCalendar(false);
      onOpenChange?.(false);
    }
  };

  const onSubmitForm = async (data: PedidoFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      methods.reset();
      setOpenCalendar(false);
      onOpenChange?.(false);
      toast.success(pedido ? 'Pedido actualizado exitosamente' : 'Pedido creado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(pedido ? 'Error al actualizar el pedido' : 'Error al crear el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (date: string) => {
    try {
      return format(new Date(date), "d 'de' MMMM 'del' yyyy", { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pedido ? 'Editar Pedido' : 'Nuevo Pedido'}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmitForm)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha del Pedido</label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !methods.watch('fechaPedido') && 'text-muted-foreground',
                        methods.formState.errors.fechaPedido && 'border-red-500'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {methods.watch('fechaPedido') ? (
                        formatDisplayDate(methods.watch('fechaPedido'))
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={methods.watch('fechaPedido') ? new Date(methods.watch('fechaPedido')) : undefined}
                      onSelect={(date) => {
                        methods.setValue('fechaPedido', date ? date.toISOString() : '');
                        setOpenCalendar(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {methods.formState.errors.fechaPedido && (
                  <p className="text-xs text-red-500">
                    {methods.formState.errors.fechaPedido.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Input
                  {...methods.register('cliente')}
                  placeholder="Nombre del cliente"
                  className={cn(
                    methods.formState.errors.cliente && 'border-red-500'
                  )}
                />
                {methods.formState.errors.cliente && (
                  <p className="text-xs text-red-500">
                    {methods.formState.errors.cliente.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Elementos</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ elementoId: '', cantidad: 1, nombreElemento: '', unidadMedida: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar elemento
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4">
                    <div className="flex-1">
                      <ElementoSelector
                        control={methods.control}
                        index={index}
                        error={methods.formState.errors.elementos?.[index]?.elementoId}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        {...methods.register(`elementos.${index}.cantidad` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="Cantidad"
                        className={cn(
                          'w-full',
                          methods.formState.errors.elementos?.[index]?.cantidad && 'border-red-500'
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {methods.formState.errors.elementos && (
                  <p className="text-xs text-red-500">
                    Debes agregar al menos un elemento al pedido
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : pedido ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}