import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ElementoFormValues } from '../types';

export function DetallesAdicionales() {
  const { control } = useFormContext<ElementoFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detalles Adicionales</h3>

      <FormField
        control={control}
        name="consumos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Consumos</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Registro de consumos"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="caracteristicas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Características</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Características del elemento"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="observaciones"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observaciones adicionales"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}