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
  await updateDoc(elementoDoc, elemento);
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