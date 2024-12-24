import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../Config';
import { Elemento } from '@/types/elementos';
import { Solicitud } from '@/types/solicitudes';
import { Pedido } from '@/types/pedidos';

// Elementos
export const getElementos = async () => {
  const elementosCol = collection(db, 'elementos');
  const elementosSnapshot = await getDocs(elementosCol);
  return elementosSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Elemento[];
};

export const addElemento = async (elemento: Omit<Elemento, 'id'>) => {
  const elementosCol = collection(db, 'elementos');
  const docRef = await addDoc(elementosCol, elemento);
  return docRef.id;
};

export const getElemento = async (id: string) => {
  const elementoDoc = doc(db, 'elementos', id);
  const elementoSnapshot = await getDoc(elementoDoc);
  if (elementoSnapshot.exists()) {
    return { id: elementoSnapshot.id, ...elementoSnapshot.data() } as Elemento;
  }
  return null;
};

export const updateElemento = async (id: string, elemento: Partial<Elemento>) => {
  const elementoDoc = doc(db, 'elementos', id);
  const currentElemento = await getElemento(id);
  
  if (!currentElemento) {
    throw new Error('Elemento no encontrado');
  }

  const cantidadSuministrada = elemento.cantidadSuministrada ?? currentElemento.cantidadSuministrada;
  
  const updateData: Partial<Elemento> = {
    ...elemento,
    cantidadDisponible: currentElemento.cantidadInicial - cantidadSuministrada
  };

  await updateDoc(elementoDoc, updateData);
};

export const updateElementoCantidadSuministrada = async (id: string, cantidadSuministrada: number) => {
  const elemento = await getElemento(id);
  
  if (!elemento) {
    throw new Error('Elemento no encontrado');
  }

  await updateElemento(id, {
    cantidadSuministrada,
    cantidadDisponible: elemento.cantidadInicial - cantidadSuministrada
  });
};

export const deleteElemento = async (id: string) => {
  const elementoDoc = doc(db, 'elementos', id);
  await deleteDoc(elementoDoc);
};

// Elementos de prueba
const elementosPrueba = [
  {
    nombre: 'Cemento',
    categoria: 'Materiales',
    tipoElemento: 'Construcción',
    cantidadInicial: 100,
    cantidadSuministrada: 0,
    cantidadDisponible: 100,
    unidadMedida: 'kg',
    estado: 'disponible' as const,
    descripcion: 'Cemento Portland Tipo I',
    ubicacion: 'Almacén Principal'
  },
  {
    nombre: 'Arena',
    categoria: 'Materiales',
    tipoElemento: 'Construcción',
    cantidadInicial: 200,
    cantidadSuministrada: 0,
    cantidadDisponible: 200,
    unidadMedida: 'kg',
    estado: 'disponible' as const,
    descripcion: 'Arena fina para construcción',
    ubicacion: 'Almacén Principal'
  }
];

// Función para agregar elementos de prueba
export const agregarElementosDePrueba = async () => {
  for (const elemento of elementosPrueba) {
    await addElemento(elemento);
  }
};

// Solicitudes
export const getSolicitudes = async () => {
  const solicitudesCol = collection(db, 'solicitudes');
  const solicitudesSnapshot = await getDocs(solicitudesCol);
  return solicitudesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Solicitud[];
};

export const addSolicitud = async (solicitud: Omit<Solicitud, 'id'>) => {
  const elemento = await getElemento(solicitud.elemento.id);
  
  if (!elemento) {
    throw new Error('Elemento no encontrado');
  }

  if (solicitud.cantidad > elemento.cantidadDisponible) {
    throw new Error(`No hay suficientes unidades disponibles. Cantidad disponible: ${elemento.cantidadDisponible}`);
  }

  const nuevaCantidadSuministrada = elemento.cantidadSuministrada + solicitud.cantidad;
  await updateElementoCantidadSuministrada(solicitud.elemento.id, nuevaCantidadSuministrada);

  const solicitudesCol = collection(db, 'solicitudes');
  const docRef = await addDoc(solicitudesCol, solicitud);
  return docRef.id;
};

export const getSolicitud = async (id: string) => {
  const solicitudDoc = doc(db, 'solicitudes', id);
  const solicitudSnapshot = await getDoc(solicitudDoc);
  if (solicitudSnapshot.exists()) {
    return { id: solicitudSnapshot.id, ...solicitudSnapshot.data() } as Solicitud;
  }
  return null;
};

export const updateSolicitud = async (id: string, solicitud: Partial<Solicitud>) => {
  const solicitudDoc = doc(db, 'solicitudes', id);
  const solicitudActual = await getSolicitud(id);
  
  if (!solicitudActual) {
    throw new Error('Solicitud no encontrada');
  }

  if (solicitud.estado && solicitud.estado !== solicitudActual.estado) {
    const elemento = await getElemento(solicitudActual.elemento.id);
    if (!elemento) {
      throw new Error('Elemento no encontrado');
    }

    if (solicitud.estado === 'entregado') {
      const nuevaCantidadSuministrada = elemento.cantidadSuministrada - solicitudActual.cantidad;
      await updateElementoCantidadSuministrada(solicitudActual.elemento.id, nuevaCantidadSuministrada);
    } else if (solicitudActual.estado === 'entregado') {
      const nuevaCantidadSuministrada = elemento.cantidadSuministrada + solicitudActual.cantidad;
      await updateElementoCantidadSuministrada(solicitudActual.elemento.id, nuevaCantidadSuministrada);
    }
  }

  await updateDoc(solicitudDoc, solicitud);
};

export const deleteSolicitud = async (id: string) => {
  const solicitudDoc = doc(db, 'solicitudes', id);
  await deleteDoc(solicitudDoc);
};

// Pedidos
export const getPedidos = async () => {
  const pedidosCol = collection(db, 'pedidos');
  const pedidosSnapshot = await getDocs(pedidosCol);
  return pedidosSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Pedido[];
};

export const addPedido = async (pedido: Omit<Pedido, 'id'>) => {
  const pedidosCol = collection(db, 'pedidos');
  const docRef = await addDoc(pedidosCol, pedido);
  return docRef.id;
};

export const getPedido = async (id: string) => {
  const pedidoDoc = doc(db, 'pedidos', id);
  const pedidoSnapshot = await getDoc(pedidoDoc);
  if (pedidoSnapshot.exists()) {
    return { id: pedidoSnapshot.id, ...pedidoSnapshot.data() } as Pedido;
  }
  return null;
};

export const updatePedido = async (id: string, pedido: Partial<Pedido>) => {
  const pedidoDoc = doc(db, 'pedidos', id);
  await updateDoc(pedidoDoc, pedido);
};

export const deletePedido = async (id: string) => {
  const pedidoDoc = doc(db, 'pedidos', id);
  await deleteDoc(pedidoDoc);
};