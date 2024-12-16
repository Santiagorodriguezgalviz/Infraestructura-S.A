import { useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { CATEGORIAS, TIPOS_ELEMENTO } from '@/types/elementos';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InformacionPrincipal() {
  const form = useFormContext();

  return (
    <div className="grid gap-4 py-4">
      <FormField
        name="nombre"
        label="Nombre"
        error={form.formState.errors.nombre}
      >
        <Input placeholder="Ingresa el nombre del elemento" {...form.register('nombre')} />
      </FormField>

      <FormField
        name="categoria"
        label="Categoría"
        error={form.formState.errors.categoria}
      >
        <Select
          value={form.watch('categoria') || undefined}
          onValueChange={(value) => form.setValue('categoria', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {CATEGORIAS.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        name="tipoElemento"
        label="Tipo de Elemento"
        error={form.formState.errors.tipoElemento}
      >
        <Select
          value={form.watch('tipoElemento') || undefined}
          onValueChange={(value) => form.setValue('tipoElemento', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="max-h-[300px] overflow-y-auto dropdown-scroll">
              {TIPOS_ELEMENTO.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}