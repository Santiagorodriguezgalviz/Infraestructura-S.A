import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Elemento } from '@/types/elementos';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    fontSize: 10,
  },
});

interface ElementosPDFProps {
  elementos: Elemento[];
}

export function ElementosPDF({ elementos }: ElementosPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Inventario de Elementos</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Nombre</Text>
            <Text style={styles.tableCell}>Categoría</Text>
            <Text style={styles.tableCell}>Tipo</Text>
            <Text style={styles.tableCell}>Cantidad Actual</Text>
          </View>
          {elementos.map((elemento, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{elemento.nombre}</Text>
              <Text style={styles.tableCell}>{elemento.categoria}</Text>
              <Text style={styles.tableCell}>{elemento.tipoElemento}</Text>
              <Text style={styles.tableCell}>{elemento.cantidadActual}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}