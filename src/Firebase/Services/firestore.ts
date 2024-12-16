import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc, deleteDoc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '../config';
import { ensureAuth } from '../config';
import { type Solicitud } from '@/types/solicitudes';
import { type Elemento } from '@/types/elementos';
import { type Pedido } from '@/types/pedidos';

// Funciones para solicitudes
export const getSolicitudes = async (): Promise<Solicitud[]> => {
  try {
    await ensureAuth();
    const querySnapshot = await getDocs(collection(db, 'solicitudes'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Solicitud[];
  } catch (error) {
    console.error('Error en getSolicitudes:', error);
    throw error;
  }
};

export const addSolicitud = async (solicitudData: Omit<Solicitud, 'id'>): Promise<string> => {
  try {
    await ensureAuth();
    
    // Usar una transacción para actualizar tanto la solicitud como el elemento
    const solicitudId = await runTransaction(db, async (transaction) => {
      // Obtener el elemento actual
      const elementoRef = doc(db, 'elementos', solicitudData.elementoId);
      const elementoDoc = await transaction.get(elementoRef);
      
      if (!elementoDoc.exists()) {
        throw new Error('El elemento no existe');
      }
      
      const elementoData = elementoDoc.data() as Elemento;
      
      // Verificar si hay suficiente cantidad disponible
      if (elementoData.cantidadDisponible < solicitudData.cantidad) {
        throw new Error('No hay suficientes unidades disponibles');
      }
      
      // Actualizar la cantidad disponible del elemento
      transaction.update(elementoRef, {
        cantidadDisponible: elementoData.cantidadDisponible - solicitudData.cantidad
      });
      
      // Crear la nueva solicitud
      const solicitudRef = doc(collection(db, 'solicitudes'));
      transaction.set(solicitudRef, {
        ...solicitudData,
        createdAt: serverTimestamp()
      });
      
      return solicitudRef.id;
    });
    
    return solicitudId;
  } catch (error) {
    console.error('Error en addSolicitud:', error);
    throw error;
  }
};

export const updateSolicitud = async (id: string, solicitudData: Partial<Solicitud>): Promise<void> => {
  try {
    await ensureAuth();
    
    await runTransaction(db, async (transaction) => {
      const solicitudRef = doc(db, 'solicitudes', id);
      const solicitudDoc = await transaction.get(solicitudRef);
      
      if (!solicitudDoc.exists()) {
        throw new Error('La solicitud no existe');
      }
      
      const solicitudAntigua = solicitudDoc.data() as Solicitud;
      const elementoRef = doc(db, 'elementos', solicitudAntigua.elementoId);
      const elementoDoc = await transaction.get(elementoRef);
      
      if (!elementoDoc.exists()) {
        throw new Error('El elemento no existe');
      }
      
      const elementoData = elementoDoc.data() as Elemento;
      
      // Si cambia el estado a 'entregado', actualizamos el inventario
      if (solicitudData.estado === 'entregado' && solicitudAntigua.estado !== 'entregado') {
        // No necesitamos hacer nada, la cantidad ya está descontada
      } 
      // Si cambia el estado de 'entregado' a 'pendiente', devolvemos la cantidad al inventario
      else if (solicitudData.estado === 'pendiente' && solicitudAntigua.estado === 'entregado') {
        transaction.update(elementoRef, {
          cantidadDisponible: elementoData.cantidadDisponible + solicitudAntigua.cantidad
        });
      }
      
      // Si cambia la cantidad
      if (solicitudData.cantidad && solicitudData.cantidad !== solicitudAntigua.cantidad) {
        const diferencia = solicitudData.cantidad - solicitudAntigua.cantidad;
        
        // Verificar si hay suficiente cantidad disponible
        if (elementoData.cantidadDisponible < diferencia) {
          throw new Error('No hay suficientes unidades disponibles');
        }
        
        transaction.update(elementoRef, {
          cantidadDisponible: elementoData.cantidadDisponible - diferencia
        });
      }
      
      transaction.update(solicitudRef, {
        ...solicitudData,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error en updateSolicitud:', error);
    throw error;
  }
};

export const deleteSolicitud = async (id: string): Promise<void> => {
  try {
    await ensureAuth();
    
    await runTransaction(db, async (transaction) => {
      const solicitudRef = doc(db, 'solicitudes', id);
      const solicitudDoc = await transaction.get(solicitudRef);
      
      if (!solicitudDoc.exists()) {
        throw new Error('La solicitud no existe');
      }
      
      const solicitudData = solicitudDoc.data() as Solicitud;
      
      // Si la solicitud no está entregada, devolver la cantidad al inventario
      if (solicitudData.estado !== 'entregado') {
        const elementoRef = doc(db, 'elementos', solicitudData.elementoId);
        const elementoDoc = await transaction.get(elementoRef);
        
        if (!elementoDoc.exists()) {
          throw new Error('El elemento no existe');
        }
        
        const elementoData = elementoDoc.data() as Elemento;
        
        transaction.update(elementoRef, {
          cantidadDisponible: elementoData.cantidadDisponible + solicitudData.cantidad
        });
      }
      
      transaction.delete(solicitudRef);
    });
  } catch (error) {
    console.error('Error en deleteSolicitud:', error);
    throw error;
  }
};

// Funciones para elementos
export const getElementos = async (): Promise<Elemento[]> => {
  try {
    await ensureAuth();
    const querySnapshot = await getDocs(collection(db, 'elementos'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Elemento[];
  } catch (error) {
    console.error('Error en getElementos:', error);
    throw error;
  }
};

export const addElemento = async (elementoData: Omit<Elemento, 'id'>): Promise<string> => {
  try {
    await ensureAuth();
    const docRef = await addDoc(collection(db, 'elementos'), {
      ...elementoData,
      cantidadDisponible: elementoData.cantidad, // Inicialmente la cantidad disponible es igual a la cantidad total
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error en addElemento:', error);
    throw error;
  }
};

export const updateElemento = async (id: string, elementoData: Partial<Elemento>): Promise<void> => {
  try {
    await ensureAuth();
    const docRef = doc(db, 'elementos', id);
    await updateDoc(docRef, {
      ...elementoData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error en updateElemento:', error);
    throw error;
  }
};

export const updateElementoCantidad = async (elementoId: string, cantidad: number) => {
  try {
    const elementoRef = doc(db, 'elementos', elementoId);
    const elementoSnap = await getDoc(elementoRef);
    
    if (elementoSnap.exists()) {
      const elementoData = elementoSnap.data();
      const cantidadActual = elementoData.cantidadInicial || 0;
      const nuevaCantidad = cantidadActual + cantidad;
      
      // Actualizamos la cantidad inicial
      await updateDoc(elementoRef, {
        cantidadInicial: nuevaCantidad
      });

      console.log(`Actualizando elemento ${elementoId}: cantidad actual ${cantidadActual} + nueva cantidad ${cantidad} = ${nuevaCantidad}`);
    } else {
      console.error(`No se encontró el elemento con ID ${elementoId}`);
    }
  } catch (error) {
    console.error('Error al actualizar cantidad del elemento:', error);
    throw error;
  }
};

export const deleteElemento = async (id: string): Promise<void> => {
  try {
    await ensureAuth();
    // Verificar si hay solicitudes pendientes para este elemento
    const solicitudesQuery = query(collection(db, 'solicitudes'), where('elementoId', '==', id));
    const solicitudesSnapshot = await getDocs(solicitudesQuery);
    
    if (!solicitudesSnapshot.empty) {
      throw new Error('No se puede eliminar el elemento porque tiene solicitudes asociadas');
    }
    
    await deleteDoc(doc(db, 'elementos', id));
  } catch (error) {
    console.error('Error en deleteElemento:', error);
    throw error;
  }
};

// Funciones para pedidos
export const getPedidos = async (): Promise<Pedido[]> => {
  try {
    await ensureAuth();
    const querySnapshot = await getDocs(collection(db, 'pedidos'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pedido[];
  } catch (error) {
    console.error('Error en getPedidos:', error);
    throw error;
  }
};

export const addPedido = async (pedidoData: Omit<Pedido, 'id'>): Promise<string> => {
  try {
    await ensureAuth();
    const docRef = await addDoc(collection(db, 'pedidos'), {
      ...pedidoData,
      fechaPedido: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error en addPedido:', error);
    throw error;
  }
};

export const updatePedido = async (id: string, pedidoData: Partial<Pedido>): Promise<void> => {
  try {
    await ensureAuth();
    const pedidoRef = doc(db, 'pedidos', id);
    await updateDoc(pedidoRef, pedidoData);
  } catch (error) {
    console.error('Error en updatePedido:', error);
    throw error;
  }
};

export const deletePedido = async (id: string): Promise<void> => {
  try {
    await ensureAuth();
    const pedidoRef = doc(db, 'pedidos', id);
    await deleteDoc(pedidoRef);
  } catch (error) {
    console.error('Error en deletePedido:', error);
    throw error;
  }
};

// Funciones para agregar datos de prueba
export const agregarElementosDePrueba = async (): Promise<void> => {
  try {
    const elementosDePrueba = [
      {
        nombre: "Martillo",
        descripcion: "Martillo de carpintería",
        categoria: "Herramientas manuales",
        ubicacion: "Almacén principal",
        estado: "disponible",
        cantidad: 5,
        cantidadDisponible: 5
      },
      {
        nombre: "Destornillador",
        descripcion: "Destornillador Phillips",
        categoria: "Herramientas manuales",
        ubicacion: "Almacén principal",
        estado: "disponible",
        cantidad: 10,
        cantidadDisponible: 10
      }
    ];

    for (const elemento of elementosDePrueba) {
      await addDoc(collection(db, 'elementos'), {
        ...elemento,
        createdAt: serverTimestamp()
      });
    }

    console.log('Elementos de prueba agregados con éxito');
  } catch (error) {
    console.error('Error al agregar elementos de prueba:', error);
    throw error;
  }
};

export const agregarSolicitudesDePrueba = async (): Promise<void> => {
  try {
    const solicitudesPrueba = [
      {
        elementoId: "elemento1",
        nombreElemento: "Tubo PVC",
        fechaSolicitud: new Date().toISOString(),
        sector: "Bovina",
        estado: "pendiente",
        cantidad: 2
      },
      {
        elementoId: "elemento2",
        nombreElemento: "Cable eléctrico",
        fechaSolicitud: new Date().toISOString(),
        sector: "Mantenimiento",
        estado: "entregado",
        cantidad: 5
      }
    ];

    for (const solicitud of solicitudesPrueba) {
      await addDoc(collection(db, 'solicitudes'), {
        ...solicitud,
        createdAt: serverTimestamp()
      });
    }

    console.log('Solicitudes de prueba agregadas con éxito');
  } catch (error) {
    console.error('Error al agregar solicitudes de prueba:', error);
    throw error;
  }
};