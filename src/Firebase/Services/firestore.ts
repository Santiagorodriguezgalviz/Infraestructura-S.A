import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
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

  // Si se está actualizando la cantidad suministrada, actualizar la cantidad disponible
  if ('cantidadSuministrada' in elemento) {
    elemento.cantidadDisponible = currentElemento.cantidadInicial - elemento.cantidadSuministrada;
  }

  await updateDoc(elementoDoc, elemento);
};

export const updateElementoCantidadSuministrada = async (id: string, cantidadSuministrada: number) => {
  const elementoDoc = doc(db, 'elementos', id);
  const elemento = await getElemento(id);
  
  if (!elemento) {
    throw new Error('Elemento no encontrado');
  }

  // Validar que no exceda la cantidad inicial
  if (cantidadSuministrada > elemento.cantidadInicial) {
    throw new Error('La cantidad suministrada no puede exceder la cantidad inicial');
  }

  const cantidadDisponible = elemento.cantidadInicial - cantidadSuministrada;
  
  await updateDoc(elementoDoc, { 
    cantidadSuministrada,
    cantidadDisponible
  });
};

export const updateElementoCantidad = async (id: string, cantidad: number) => {
  const elementoDoc = doc(db, 'elementos', id);
  await updateDoc(elementoDoc, { cantidad });
};

export const deleteElemento = async (id: string) => {
  const elementoDoc = doc(db, 'elementos', id);
  await deleteDoc(elementoDoc);
};

export const agregarElementosDePrueba = async () => {
  const elementosDePrueba = [
    {
      nombre: 'Cemento',
      cantidad: 100,
      unidadMedida: 'kg',
      estado: 'disponible'
    },
    {
      nombre: 'Arena',
      cantidad: 200,
      unidadMedida: 'kg',
      estado: 'disponible'
    }
  ];

  for (const elemento of elementosDePrueba) {
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
  const solicitudesCol = collection(db, 'solicitudes');
  
  // Obtener el elemento y validar cantidad disponible
  const elemento = await getElemento(solicitud.elementoId);
  if (!elemento) {
    throw new Error('Elemento no encontrado');
  }

  const cantidadDisponible = elemento.cantidadInicial - (elemento.cantidadSuministrada || 0);
  if (solicitud.cantidad > cantidadDisponible) {
    throw new Error(`No hay suficientes unidades disponibles. Cantidad disponible: ${cantidadDisponible}`);
  }

  // Al crear la solicitud, actualizamos la cantidad suministrada
  const nuevaCantidadSuministrada = (elemento.cantidadSuministrada || 0) + solicitud.cantidad;
  await updateElementoCantidadSuministrada(elemento.id, nuevaCantidadSuministrada);

  // Crear la solicitud
  const docRef = await addDoc(solicitudesCol, {
    ...solicitud,
    estado: 'pendiente'
  });

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

  // Si estamos actualizando el estado
  if ('estado' in solicitud && solicitud.estado !== solicitudActual.estado) {
    const elemento = await getElemento(solicitudActual.elementoId);
    if (!elemento) {
      throw new Error('Elemento no encontrado');
    }

    // Si cambia a "entregado", devolvemos la cantidad al estado original
    if (solicitud.estado === 'entregado') {
      const nuevaCantidadSuministrada = Math.max(0, (elemento.cantidadSuministrada || 0) - solicitudActual.cantidad);
      await updateElementoCantidadSuministrada(elemento.id, nuevaCantidadSuministrada);
    }
    // Si cambia de "entregado" a otro estado, volvemos a descontar la cantidad
    else if (solicitudActual.estado === 'entregado') {
      const nuevaCantidadSuministrada = (elemento.cantidadSuministrada || 0) + solicitudActual.cantidad;
      await updateElementoCantidadSuministrada(elemento.id, nuevaCantidadSuministrada);
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