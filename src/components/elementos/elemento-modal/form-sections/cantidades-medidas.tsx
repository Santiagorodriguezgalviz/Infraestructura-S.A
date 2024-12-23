import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { UNIDADES_MEDIDA } from '../constants';
import type { ElementoFormValues } from '../types';
import { es } from 'date-fns/locale';

interface CantidadesMedidasProps {
}

export function CantidadesMedidas() {
  const form = useFormContext<ElementoFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cantidades y Medidas</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cantidadInicial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad Inicial</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ingresa la cantidad inicial"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cantidadSuministrada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad Suministrada</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ingresa la cantidad suministrada"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    const cantidadInicial = form.getValues('cantidadInicial');
                    const cantidadSuministrada = e.target.value ? parseInt(e.target.value) : 0;
                    form.setValue('cantidadDisponible', cantidadInicial - cantidadSuministrada);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unidadMedida"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad de Medida</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value || undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {UNIDADES_MEDIDA.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cantidadDisponible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad Disponible</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value || ''}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaVencimiento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Vencimiento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(parseISO(field.value), "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}