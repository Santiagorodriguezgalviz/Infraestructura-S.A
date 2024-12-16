import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
} from '@react-pdf/renderer';
import type { Pedido } from '@/types/pedidos';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#10b981',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 40,
    marginBottom: 30,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    padding: '6 12',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
  },
  pendingBadge: {
    backgroundColor: '#f59e0b',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: '12 16',
  },
  tableHeaderCell: {
    color: '#374151',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: '12 16',
  },
  tableCell: {
    fontSize: 12,
    color: '#111827',
  },
  elementoColumn: {
    flex: 2,
  },
  cantidadColumn: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#6b7280',
  }
});

interface PedidosPDFProps {
  pedido: Pedido;
}

export function PedidosPDF({ pedido }: PedidosPDFProps) {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Detalle del Pedido</Text>
            <Text style={styles.subtitle}>Inventario Infraestructura S.A</Text>
            <View style={styles.divider} />
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(pedido.fechaPedido), "d 'de' MMMM 'del' yyyy", {
                    locale: es,
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValue}>
                  {pedido.cliente || 'No especificado'}
                </Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estado</Text>
                <View style={[
                  styles.statusBadge,
                  pedido.estado !== 'entregado' && styles.pendingBadge
                ]}>
                  <Text style={styles.statusText}>
                    {pedido.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Elementos Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Elementos del Pedido</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, styles.elementoColumn]}>
                  <Text>Elemento</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.cantidadColumn]}>
                  <Text>Cantidad</Text>
                </View>
              </View>
              {pedido.elementos.map((elemento, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.elementoColumn]}>
                    <Text>{elemento.nombreElemento}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.cantidadColumn]}>
                    <Text>{elemento.cantidad} {elemento.unidadMedida}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Este documento fue generado automáticamente por el sistema de inventario.
            </Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
