import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Elemento } from '@/types/elementos';

export const generateElementosPDF = (elementos: Elemento[]) => {
  // Crear nuevo documento PDF
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Configurar fuente
  doc.setFont('helvetica');
  
  // Agregar título
  doc.setFontSize(20);
  doc.text('Inventario de Elementos', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Agregar fecha
  doc.setFontSize(11);
  doc.text(
    `Fecha: ${format(new Date(), "d 'de' MMMM 'del' yyyy", { locale: es })}`,
    doc.internal.pageSize.width - 20,
    20,
    { align: 'right' }
  );

  // Tabla principal
  const tableData = elementos.map(elemento => [
    elemento.nombre,
    elemento.categoria,
    elemento.tipoElemento,
    elemento.cantidadInicial.toString(),
    elemento.cantidadActual.toString(),
    elemento.unidadMedida,
    elemento.fechaVencimiento
      ? format(new Date(elemento.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
      : '-'
  ]);

  autoTable(doc, {
    head: [['Nombre', 'Categoría', 'Tipo', 'Cant. Inicial', 'Cant. Actual', 'Unidad', 'Vencimiento']],
    body: tableData,
    startY: 30,
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    theme: 'grid'
  });

  // Agregar pie de página
  doc.setFontSize(10);
  doc.text(
    'Sistema de Inventario',
    20,
    doc.internal.pageSize.height - 10
  );
  doc.text(
    `Página 1 de 1`,
    doc.internal.pageSize.width - 20,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );

  // Guardar el PDF
  doc.save('inventario-elementos.pdf');
};
