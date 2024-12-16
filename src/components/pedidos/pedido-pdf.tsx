import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Pedido } from '@/types/pedidos';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  info: {
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginTop: 20,
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
    padding: 8,
    flex: 1,
  },
});

interface PedidoPDFProps {
  pedido: Pedido;
}

export function PedidoPDF({ pedido }: PedidoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Pedido #{pedido.id}</Text>
          <Text style={styles.info}>Fecha: {new Date(pedido.fechaPedido).toLocaleDateString()}</Text>
          {pedido.nombreCliente && (
            <Text style={styles.info}>Cliente: {pedido.nombreCliente}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Elemento</Text>
            <Text style={styles.tableCell}>Cantidad</Text>
            <Text style={styles.tableCell}>Unidad</Text>
          </View>
          {pedido.elementos.map((elemento, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{elemento.nombre}</Text>
              <Text style={styles.tableCell}>{elemento.cantidad}</Text>
              <Text style={styles.tableCell}>{elemento.unidadMedida}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}