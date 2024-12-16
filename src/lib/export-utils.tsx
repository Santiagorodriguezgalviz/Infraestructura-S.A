import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import type { Elemento } from '@/types/elementos';
import type { Pedido } from '@/types/pedidos';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    width: '14.28%',
    padding: 8,
    textAlign: 'center',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

const ElementosPDFDocument = ({ elementos }: { elementos: Elemento[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Inventario de Elementos</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Nombre</Text>
          <Text style={styles.tableCell}>Categoría</Text>
          <Text style={styles.tableCell}>Tipo</Text>
          <Text style={styles.tableCell}>Cantidad Inicial</Text>
          <Text style={styles.tableCell}>Cantidad Actual</Text>
          <Text style={styles.tableCell}>Unidad</Text>
          <Text style={styles.tableCell}>Vencimiento</Text>
        </View>
        
        {elementos.map((elemento, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{elemento.nombre}</Text>
            <Text style={styles.tableCell}>{elemento.categoria}</Text>
            <Text style={styles.tableCell}>{elemento.tipo}</Text>
            <Text style={styles.tableCell}>{elemento.cantidadInicial}</Text>
            <Text style={styles.tableCell}>{elemento.cantidadActual}</Text>
            <Text style={styles.tableCell}>{elemento.unidadMedida}</Text>
            <Text style={styles.tableCell}>
              {elemento.fechaVencimiento 
                ? format(new Date(elemento.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
                : '-'}
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.footer}>
        Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
      </Text>
    </Page>
  </Document>
);

const PedidoPDFDocument = ({ pedido }: { pedido: Pedido }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Pedido {pedido.id}</Text>
      
      {/* Add Pedido details here */}
      
      <Text style={styles.footer}>
        Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
      </Text>
    </Page>
  </Document>
);

export async function exportToExcel(elementos: Elemento[]) {
  const worksheet = XLSX.utils.json_to_sheet(elementos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Elementos');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, 'elementos.xlsx');
}

export async function exportToPDF(elementos: Elemento[]) {
  const blob = await pdf(<ElementosPDFDocument elementos={elementos} />).toBlob();
  saveAs(blob, 'elementos.pdf');
}

export async function exportPedidoToPDF(pedido: Pedido) {
  const blob = await pdf(<PedidoPDFDocument pedido={pedido} />).toBlob();
  saveAs(blob, `pedido-${pedido.id}.pdf`);
}

export const exportElementosToExcelStyling = (elementos: Elemento[]) => {
  // Preparar datos para Excel
  const workbookData = elementos.map(elemento => ({
    'Nombre': elemento.nombre,
    'Categoría': elemento.categoria,
    'Tipo': elemento.tipo,
    'Cantidad Inicial': elemento.cantidadInicial,
    'Cantidad Actual': elemento.cantidadActual,
    'Unidad': elemento.unidadMedida,
    'Fecha de Vencimiento': elemento.fechaVencimiento 
      ? format(new Date(elemento.fechaVencimiento), 'dd/MM/yyyy', { locale: es })
      : '-'
  }));

  // Crear libro y hoja
  const worksheet = XLSX.utils.json_to_sheet(workbookData);
  const workbook = XLSX.utils.book_new();

  // Configurar anchos de columna
  worksheet['!cols'] = [
    { wch: 20 }, // Nombre
    { wch: 20 }, // Categoría
    { wch: 15 }, // Tipo
    { wch: 15 }, // Cantidad Inicial
    { wch: 15 }, // Cantidad Actual
    { wch: 10 }, // Unidad
    { wch: 20 }, // Fecha de Vencimiento
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
  XLSX.writeFile(workbook, `Inventario_Elementos_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
};

export const exportElementosToPDFStyling = async (elementos: Elemento[]) => {
  const blob = await pdf(<ElementosPDFDocument elementos={elementos} />).toBlob();
  saveAs(blob, `Inventario_Elementos_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
};
