import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Elemento } from '@/types/elementos';

export const generateElementosToExcel = (elementos: Elemento[]) => {
  // Preparar los datos para Excel
  const data = elementos.map(elemento => ({
    'Nombre': elemento.nombre,
    'Categoría': elemento.categoria,
    'Tipo': elemento.tipoElemento,
    'Cantidad Inicial': elemento.cantidadInicial,
    'Cantidad Actual': elemento.cantidadDisponible,
    'Unidad': elemento.unidadMedida,
    'Vencimiento': elemento.fechaVencimiento 
      ? format(new Date(elemento.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
      : '-',
    'Características': elemento.caracteristicas || '-',
    'Observaciones': elemento.observaciones || '-'
  }));

  // Crear libro de trabajo y hoja
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 20 }, // Nombre
    { wch: 20 }, // Categoría
    { wch: 15 }, // Tipo
    { wch: 15 }, // Cantidad Inicial
    { wch: 15 }, // Cantidad Actual
    { wch: 10 }, // Unidad
    { wch: 12 }, // Vencimiento
    { wch: 30 }, // Características
    { wch: 30 }, // Observaciones
  ];
  ws['!cols'] = colWidths;

  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Elementos');

  // Guardar el archivo
  XLSX.writeFile(wb, `Inventario_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
};
