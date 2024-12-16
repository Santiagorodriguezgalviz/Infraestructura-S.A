import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InformacionPrincipal } from './form-sections/informacion-principal';
import { CantidadesMedidas } from './form-sections/cantidades-medidas';
import { ElementoFormValues, elementoSchema } from './types';
import { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ElementoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elemento?: ElementoFormValues | null;
  onSubmit: (data: ElementoFormValues) => Promise<void>;
}

export function ElementoModal({ open, onOpenChange, elemento, onSubmit }: ElementoModalProps) {
  const form = useForm<ElementoFormValues>({
    resolver: zodResolver(elementoSchema),
    defaultValues: {
      nombre: '',
      categoria: '',
      tipoElemento: '',
      cantidadInicial: '',
      cantidadActual: '',
      unidadMedida: '',
      fechaVencimiento: '',
      consumos: '',
      caracteristicas: '',
      observaciones: '',
    }
  });

  const prevOpenRef = useRef(open);
  const prevElementoRef = useRef(elemento);

  useEffect(() => {
    if (!open) {
      // Limpiar el formulario cuando se cierra el modal
      form.reset({
        nombre: '',
        categoria: '',
        tipoElemento: '',
        cantidadInicial: '',
        unidadMedida: '',
        fechaVencimiento: '',
        caracteristicas: '',
        observaciones: '',
      });
    } else if (elemento) {
      // Convertir cantidadInicial a string si es número
      const formattedElemento = {
        ...elemento,
        cantidadInicial: elemento.cantidadInicial.toString(),
      };
      form.reset(formattedElemento);
    }
  }, [open, elemento, form]);

  const handleFormSubmit = async (data: ElementoFormValues) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al procesar el elemento:', error);
      toast.error('Error al procesar el elemento');
    }
  };

  return (
    <FormProvider {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{elemento ? 'Editar Elemento' : 'Nuevo Elemento'}</DialogTitle>
            <DialogDescription>
              {elemento 
                ? 'Modifica los detalles del elemento seleccionado.' 
                : 'Completa los detalles para crear un nuevo elemento.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-8 pb-4">
                <InformacionPrincipal />
                <CantidadesMedidas />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Características</Label>
                    <Textarea
                      {...form.register('caracteristicas')}
                      placeholder="Ingresa las características del elemento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea
                      {...form.register('observaciones')}
                      placeholder="Ingresa observaciones adicionales"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {elemento ? 'Guardar Cambios' : 'Crear Elemento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}