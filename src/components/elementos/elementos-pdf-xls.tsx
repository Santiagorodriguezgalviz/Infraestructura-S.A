import { Button } from '@/components/ui/button';
import { FileText, Table } from 'lucide-react';
import type { Elemento } from '@/types/elementos';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateElementosToExcel } from '@/utils/generate-elementos-excel';

interface ElementosPdfXlsProps {
  elementos: Elemento[];
}

export function ElementosPdfXls({ elementos }: ElementosPdfXlsProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Título centrado
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('Inventario de Elementos', doc.internal.pageSize.width / 2, 30, { align: 'center' });
    
    // Fecha alineada a la derecha
    doc.setFontSize(11);
    const currentDate = format(new Date(), "dd 'de' MMMM 'del' yyyy", { locale: es });
    doc.text(`Fecha: ${currentDate}`, doc.internal.pageSize.width - 20, 30, { align: 'right' });

    // Tabla con estilo mejorado
    const tableData = elementos.map(elemento => [
      elemento.nombre,
      elemento.categoria,
      elemento.tipoElemento,
      elemento.cantidadInicial.toString(),
      elemento.cantidadActual.toString(),
      elemento.unidadMedida,
      elemento.fechaVencimiento 
        ? format(new Date(elemento.fechaVencimiento), 'dd/MM/yyyy')
        : '-'
    ]);

    autoTable(doc, {
      head: [['Nombre', 'Categoría', 'Tipo', 'Cant. Inicial', 'Cant. Actual', 'Unidad', 'Vencimiento']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 6,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 8,
      },
      bodyStyles: {
        textColor: [70, 70, 70],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
      },
      didDrawPage: function(data) {
        // Pie de página
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Sistema de Inventario', 20, doc.internal.pageSize.height - 10);
        doc.text(
          `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
    });

    doc.save('inventario-elementos.pdf');
  };

  const handleExportToExcel = () => {
    generateElementosToExcel(elementos);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={generatePDF} className="gap-2">
        <FileText size={16} />
        Exportar a PDF
      </Button>
      <Button variant="outline" onClick={handleExportToExcel} className="gap-2">
        <Table size={16} />
        Exportar a Excel
      </Button>
    </div>
  );
}
