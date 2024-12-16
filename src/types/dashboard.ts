export interface DashboardStats {
  totalClientes: number;
  totalProductos: number;
  totalPedidos: number;
  incrementoClientes: number;
  incrementoProductos: number;
  incrementoPedidos: number;
}

export interface ProductoSolicitud {
  id: string;
  nombre: string;
  cantidadSolicitada: number;
  porcentaje: number;
}

export interface ProductoBajoStock {
  id: string;
  nombre: string;
  cantidadActual: number;
  stockMinimo: number;
}

export interface SolicitudReciente {
  id: string;
  solicitante: string;
  numeroSolicitud: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  iniciales: string;
}

export interface DashboardData {
  stats: DashboardStats;
  productosMasSolicitados: ProductoSolicitud[];
  productosMenosSolicitados: ProductoSolicitud[];
  productosBajoStock: ProductoBajoStock[];
  solicitudesRecientes: SolicitudReciente[];
}
