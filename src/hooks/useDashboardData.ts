import { useEffect, useState } from 'react';
import { db } from '@/Firebase/Config';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';

interface DashboardData {
  stats: {
    totalElementos: number;
    elementosActivos: number;
    totalPedidos: number;
    elementosBajoStock: number;
  };
  elementosPorCategoria: {
    nombre: string;
    cantidad: number;
    color: string;
  }[];
  elementosMasSolicitados: {
    id: string;
    nombre: string;
    cantidadSolicitada: number;
    porcentaje: number;
    categoria: string;
  }[];
  elementosRecientes: any[];
  pedidosRecientes: any[];
  stockPorCategoria: any[];
}

const CATEGORY_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f43f5e',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#10b981',
];

const initialData: DashboardData = {
  stats: {
    totalElementos: 0,
    elementosActivos: 0,
    totalPedidos: 0,
    elementosBajoStock: 0,
  },
  elementosPorCategoria: [],
  elementosMasSolicitados: [],
  elementosRecientes: [],
  pedidosRecientes: [],
  stockPorCategoria: [],
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [elementosMap, setElementosMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const elementosQuery = query(collection(db, 'elementos'));
    const pedidosQuery = query(collection(db, 'pedidos'));

    const unsubscribeElementos = onSnapshot(elementosQuery, (elementosSnapshot) => {
      const elementos = elementosSnapshot.docs.map(doc => {
        const docData = doc.data();
        let fecha;
        try {
          fecha = docData.fecha instanceof Timestamp ? 
            docData.fecha.toDate() : 
            docData.fecha ? new Date(docData.fecha) : new Date();
        } catch (error) {
          console.error('Error al procesar fecha:', error);
          fecha = new Date();
        }
        
        return {
          id: doc.id,
          ...docData,
          fecha,
          cantidadActual: Number(docData.cantidadActual || 0),
          cantidadInicial: Number(docData.cantidadInicial || 0),
          categoria: docData.categoria || 'Sin categoría',
          nombre: docData.nombre || 'Sin nombre'
        };
      });

      // Actualizar el mapa de elementos
      const newElementosMap = new Map(
        elementos.map(elem => [elem.id, elem])
      );
      setElementosMap(newElementosMap);

      // Calcular elementos por categoría
      const categoriasMap = new Map();
      elementos.forEach(elemento => {
        const categoria = elemento.categoria;
        if (!categoriasMap.has(categoria)) {
          categoriasMap.set(categoria, 0);
        }
        categoriasMap.set(categoria, categoriasMap.get(categoria) + 1);
      });

      const elementosPorCategoria = Array.from(categoriasMap.entries())
        .map(([nombre, cantidad], index) => ({
          nombre,
          cantidad,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        }));

      setData(prevData => ({
        ...prevData,
        stats: {
          ...prevData.stats,
          totalElementos: elementos.length,
          elementosActivos: elementos.filter(e => e.cantidadActual > 0).length,
          elementosBajoStock: elementos.filter(e => 
            e.cantidadInicial > 0 && (e.cantidadActual / e.cantidadInicial) < 0.2
          ).length,
        },
        elementosPorCategoria,
        elementosRecientes: elementos.slice(0, 5),
        stockPorCategoria: elementosPorCategoria.map(cat => ({
          categoria: cat.nombre,
          cantidadTotal: elementos
            .filter(e => e.categoria === cat.nombre)
            .reduce((sum, e) => sum + (e.cantidadActual || 0), 0),
          elementosBajoStock: elementos
            .filter(e => e.categoria === cat.nombre && 
              e.cantidadInicial > 0 && (e.cantidadActual / e.cantidadInicial) < 0.2
            ).length
        }))
      }));
    });

    const unsubscribePedidos = onSnapshot(pedidosQuery, (pedidosSnapshot) => {
      const pedidos = pedidosSnapshot.docs.map(doc => {
        const docData = doc.data();
        let fecha;
        try {
          fecha = docData.fecha instanceof Timestamp ? 
            docData.fecha.toDate() : 
            docData.fecha ? new Date(docData.fecha) : new Date();
        } catch (error) {
          console.error('Error al procesar fecha:', error);
          fecha = new Date();
        }
        
        return {
          id: doc.id,
          ...docData,
          fecha,
          elementos: docData.elementos || []
        };
      });

      // Calcular elementos más solicitados
      const solicitudesMap = new Map();
      pedidos.forEach(pedido => {
        if (Array.isArray(pedido.elementos)) {
          pedido.elementos.forEach(elem => {
            if (elem && elem.elementoId) {
              const key = elem.elementoId;
              
              if (!solicitudesMap.has(key)) {
                solicitudesMap.set(key, {
                  id: key,
                  nombre: elem.elemento || 'Elemento no encontrado', // Usar el nombre del elemento del pedido
                  categoria: elem.sector || 'Sin categoría', // Usar el sector como categoría
                  cantidadSolicitada: 0
                });
              }
              const stats = solicitudesMap.get(key);
              stats.cantidadSolicitada += Number(elem.cantidad) || 1;
            }
          });
        }
      });

      const elementosMasSolicitados = Array.from(solicitudesMap.values())
        .map(stats => ({
          ...stats,
          porcentaje: solicitudesMap.size > 0 ? 
            (stats.cantidadSolicitada / Array.from(solicitudesMap.values())
              .reduce((sum, elem) => sum + elem.cantidadSolicitada, 0)) * 100 : 0
        }))
        .sort((a, b) => b.cantidadSolicitada - a.cantidadSolicitada)
        .slice(0, 5);

      setData(prevData => ({
        ...prevData,
        stats: {
          ...prevData.stats,
          totalPedidos: pedidos.length,
        },
        elementosMasSolicitados,
        pedidosRecientes: pedidos.slice(0, 5)
      }));
    });

    return () => {
      unsubscribeElementos();
      unsubscribePedidos();
    };
  }, []);

  return data;
}
