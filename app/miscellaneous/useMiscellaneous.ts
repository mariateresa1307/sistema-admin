import { useState, useCallback, useEffect } from 'react';

export type MiscellaneousItem = {
  _id?: string;
  id?: string;
  categoria: string;
  valor: string;
  descripcion?: string;
  padreId?: string;
  padreNombre?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationType = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

const API_URL = 'http://localhost:4000/miscellaneous';

export const useMiscellaneous = (currentCategoria: string) => {
  const [rows, setRows] = useState<MiscellaneousItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Estados específicos para cada tipo de dato
  const [estados, setEstados] = useState<MiscellaneousItem[]>([]);
  const [ciudades, setCiudades] = useState<MiscellaneousItem[]>([]); // ✅ NUEVO
  const [categorias, setCategorias] = useState<MiscellaneousItem[]>([]);
  const [localidades, setLocalidades] = useState<MiscellaneousItem[]>([]);
  const [subcategorias, setSubcategorias] = useState<MiscellaneousItem[]>([]);

  const showNotification = useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Cargar items de la categoría actual
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?categoria=${currentCategoria}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.data || data.items || []);
      setRows(items);
    } catch (error) {
      console.error("Error al obtener items:", error);
      showNotification("Error al cargar los datos", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategoria, showNotification]);

  // Función genérica para cargar datos por categoría
  const fetchByCategoria = useCallback(async (categoria: string) => {
    try {
      const res = await fetch(`${API_URL}?categoria=${categoria}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error al obtener ${categoria}:`, error);
      return [];
    }
  }, []);

  // Cargar solo los datos necesarios según la categoría actual
  const fetchRelatedData = useCallback(async () => {
    const promises: Promise<any>[] = [];

    // Siempre cargar estados (para el selector de ciudades)
    promises.push(fetchByCategoria('ESTADO').then(setEstados));

    // Cargar datos según la categoría actual
    switch (currentCategoria) {
      case 'CIUDAD':
        // Necesitamos localidades para mostrar en la tabla
        promises.push(fetchByCategoria('LOCALIDAD').then(setLocalidades));
        break;
        
      case 'LOCALIDAD':
        // Necesitamos ciudades para el selector al crear una localidad
        promises.push(fetchByCategoria('CIUDAD').then(setCiudades));
        break;
        
      case 'SUBCATEGORIA':
        // Necesitamos categorías para el selector
        promises.push(fetchByCategoria('CATEGORIA_RED').then(setCategorias));
        break;
        
      case 'CATEGORIA_RED':
        // Necesitamos subcategorías para mostrar en la tabla
        promises.push(fetchByCategoria('SUBCATEGORIA').then(setSubcategorias));
        break;
        
      case 'DETALLE':
        // Necesitamos subcategorías para el selector
        promises.push(fetchByCategoria('SUBCATEGORIA').then(setSubcategorias));
        break;
        
      case 'SOLUCION_CASO':
        // Necesitamos causas raíz para el selector
        promises.push(fetchByCategoria('CAUSA_RAIZ').then(setCategorias));
        break;
    }

    await Promise.all(promises);
  }, [currentCategoria, fetchByCategoria]);

  useEffect(() => {
    fetchItems();
    fetchRelatedData();
  }, [fetchItems, fetchRelatedData]);

  const deleteItem = useCallback(async (item: MiscellaneousItem): Promise<boolean> => {
    if (!window.confirm(`¿Estás seguro de eliminar "${item.valor}"?`)) return false;

    try {
      const res = await fetch(`${API_URL}/${item._id || item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showNotification("Elemento eliminado correctamente", "success");
        await fetchItems();
        await fetchRelatedData();
        return true;
      } else {
        const err = await res.json();
        showNotification(err.message || "Error al eliminar el elemento", "error");
        return false;
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      showNotification("Error de conexión", "error");
      return false;
    }
  }, [fetchItems, fetchRelatedData, showNotification]);

  const addItem = useCallback(async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification("Elemento agregado correctamente", "success");
        await fetchItems();
        await fetchRelatedData();
        return true;
      } else {
        const err = await res.json();
        showNotification(`Error: ${err.message || 'No se pudo agregar'}`, "error");
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error de conexión", "error");
      return false;
    }
  }, [fetchItems, fetchRelatedData, showNotification]);

  // Funciones de filtrado
  const getEstados = useCallback(() => {
    return estados.filter(item => item.activo !== false);
  }, [estados]);

  const getLocalidadesByCiudad = useCallback((ciudadId: string) => {
    if (!ciudadId) return [];
    return localidades.filter(
      item => item.padreId === ciudadId && item.activo !== false
    );
  }, [localidades]);

  const getSubcategoriasByCategoria = useCallback((categoriaId: string) => {
    if (!categoriaId) return [];
    return subcategorias.filter(
      item => item.padreId === categoriaId && item.activo !== false
    );
  }, [subcategorias]);

  const getCategorias = useCallback(() => {
    return categorias.filter(item => item.activo !== false);
  }, [categorias]);

  const getCiudades = useCallback(() => {
    return ciudades.filter(item => item.activo !== false);
  }, [ciudades]);

  return {
    rows,
    loading,
    notification,
    closeNotification,
    fetchItems,
    fetchRelatedData,
    deleteItem,
    addItem,
    getEstados,
    getLocalidadesByCiudad,
    getSubcategoriasByCategoria,
    getCategorias,
    getCiudades,
    localidades,
    ciudades, // ✅ Exponer ciudades
    subcategorias,
  };
};