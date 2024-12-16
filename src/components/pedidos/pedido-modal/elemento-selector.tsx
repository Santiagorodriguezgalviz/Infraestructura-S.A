import { useEffect, useState } from 'react';
import { Control, useController, useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { PedidoFormValues } from '@/types/pedidos';
import type { Elemento } from '@/types/elementos';
import { getElementos } from '@/Firebase/Services/firestore';

interface ElementoSelectorProps {
  control: Control<PedidoFormValues>;
  index: number;
  error?: { message?: string };
}

export function ElementoSelector({ control, index, error }: ElementoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { field } = useController({
    name: `elementos.${index}.elementoId`,
    control,
  });

  const { setValue } = useFormContext<PedidoFormValues>();

  useEffect(() => {
    const fetchElementos = async () => {
      try {
        const data = await getElementos();
        setElementos(data);
      } catch (error) {
        console.error('Error al cargar elementos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElementos();
  }, []);

  const selectedElemento = elementos.find(
    (elemento) => elemento.id === field.value
  );

  useEffect(() => {
    if (selectedElemento) {
      setValue(`elementos.${index}.nombreElemento`, selectedElemento.nombre);
      setValue(`elementos.${index}.unidadMedida`, selectedElemento.unidadMedida);
    }
  }, [selectedElemento, setValue, index]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error ? "border-red-500" : ""
            )}
            disabled={isLoading}
          >
            {isLoading
              ? "Cargando elementos..."
              : field.value
              ? elementos.find((elemento) => elemento.id === field.value)?.nombre
              : "Seleccionar elemento..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar elemento..." />
            <CommandEmpty>No se encontraron elementos.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {elementos.map((elemento) => (
                <CommandItem
                  key={elemento.id}
                  value={elemento.nombre}
                  onSelect={() => {
                    field.onChange(elemento.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      elemento.id === field.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {elemento.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error?.message && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}