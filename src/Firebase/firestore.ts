import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { ensureAuth } from './config';
import { type Solicitud } from '@/types/solicitudes';

// Colección de solicitudes
const solicitudesRef = collection(db, 'solicitudes');

// Agregar una nueva solicitud
export const addSolicitud = async (solicitud: Omit<Solicitud, 'id'>) => {
  try {
    await ensureAuth(); // Asegurar autenticación antes de cada operación
    const docRef = await addDoc(solicitudesRef, {
      ...solicitud,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Solicitud agregada con ID:', docRef.id);
    return { id: docRef.id, ...solicitud };
  } catch (error) {
    console.error('Error en addSolicitud:', error);
    throw error;
  }
};

// Obtener todas las solicitudes
export const getSolicitudes = async () => {
  try {
    await ensureAuth(); // Asegurar autenticación antes de cada operación
    const querySnapshot = await getDocs(solicitudesRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Solicitud[];
  } catch (error) {
    console.error('Error en getSolicitudes:', error);
    throw error;
  }
};

// Actualizar una solicitud
export const updateSolicitud = async (id: string, data: Partial<Solicitud>) => {
  try {
    await ensureAuth(); // Asegurar autenticación antes de cada operación
    const docRef = doc(db, 'solicitudes', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    console.log('Solicitud actualizada:', id);
  } catch (error) {
    console.error('Error en updateSolicitud:', error);
    throw error;
  }
};

// Eliminar una solicitud
export const deleteSolicitud = async (id: string) => {
  try {
    await ensureAuth(); // Asegurar autenticación antes de cada operación
    await deleteDoc(doc(db, 'solicitudes', id));
    console.log('Solicitud eliminada:', id);
  } catch (error) {
    console.error('Error en deleteSolicitud:', error);
    throw error;
  }
};

// Filtrar solicitudes por estado
export const getSolicitudesPorEstado = async (estado: string) => {
  try {
    await ensureAuth(); // Asegurar autenticación antes de cada operación
    const q = query(solicitudesRef, where('estado', '==', estado));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Solicitud[];
  } catch (error) {
    console.error('Error en getSolicitudesPorEstado:', error);
    throw error;
  }
};
