export interface Elemento {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  estado: 'disponible' | 'no-disponible';
  cantidad: number;
  cantidadDisponible: number;
}

export const TIPOS_ELEMENTO = [
  'Plomería',
  'Eléctrico',
  'Pintura',
  'Construcción',
  'No Consumible',
  'Herramienta',
  'Seguridad',
  'Limpieza'
];

export const UNIDADES_MEDIDA = [
  'Unidad',
  'Metro',
  'Kilogramo',
  'Litro',
  'Galón',
  'Par',
  'Caja',
  'Rollo',
  'Paquete',
  'Pieza',
  'Metro Cuadrado',
  'Metro Cúbico'
];

export const CATEGORIAS = [
  'Accesorio de plomería',
  'Material de construcción',
  'Accesorio eléctrico',
  'Herramienta de pintura',
  'Material eléctrico',
  'Accesorio de seguridad',
  'Accesorio de fijación',
  'Material de señalización',
  'Material de limpieza',
  'Herramienta/Abrasión',
  'Material de soldadura',
  'Material de pintura',
  'Material de ferretería',
  'Equipo de protección',
  'Herramienta manual',
  'Herramienta eléctrica'
];

export const ELEMENTOS_MOCK: Elemento[] = [
  {
    id: '1',
    nombre: 'Cable eléctrico',
    descripcion: 'Cable de cobre calibre 12 AWG',
    categoria: 'Material eléctrico',
    ubicacion: '',
    estado: 'disponible',
    cantidad: 100,
    cantidadDisponible: 100
  },
  {
    id: '2',
    nombre: 'Tubo PVC',
    descripcion: 'Tubo PVC 1/2 pulgada',
    categoria: 'Accesorio de plomería',
    ubicacion: '',
    estado: 'disponible',
    cantidad: 50,
    cantidadDisponible: 50
  },
  {
    id: '3',
    nombre: 'Pintura base agua',
    descripcion: 'Pintura blanca lavable',
    categoria: 'Material de pintura',
    ubicacion: '',
    estado: 'disponible',
    cantidad: 20,
    cantidadDisponible: 20
  },
  {
    id: '4',
    nombre: 'asd',
    descripcion: '',
    categoria: 'Material de construcción',
    ubicacion: '',
    estado: 'disponible',
    cantidad: 20,
    cantidadDisponible: 20
  }
];