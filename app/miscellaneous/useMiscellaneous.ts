import { useState, useCallback, useEffect } from 'react';
// ✅ AGREGAR: Importar todas las funciones necesarias del API client
import { getMiscellaneous, createMiscellaneous, updateMiscellaneous, deleteMiscellaneous } from "@/lib/api";

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
  const [ciudades, setCiudades] = useState<MiscellaneousItem[]>([]);
  const [categorias, setCategorias] = useState<MiscellaneousItem[]>([]);
  const [localidades, setLocalidades] = useState<MiscellaneousItem[]>([]);
  const [subcategorias, setSubcategorias] = useState<MiscellaneousItem[]>([]);

  const showNotification = useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // ✅ CORREGIDO: Usar getMiscellaneous en lugar de fetch
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMiscellaneous({ categoria: currentCategoria });
      const data = Array.isArray(response.data) ? response.data : [];
      setRows(data);
    } catch (error) {
      console.error("Error al obtener items:", error);
      showNotification("Error al cargar los datos", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategoria, showNotification]);

  const fetchByCategoria = useCallback(async (categoria: string) => {
    try {
      const response = await getMiscellaneous({ categoria });
      const data = Array.isArray(response.data) ? response.data : [];
      return data;
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
        promises.push(fetchByCategoria('LOCALIDAD').then(setLocalidades));
        break;
        
      case 'LOCALIDAD':
        promises.push(fetchByCategoria('CIUDAD').then(setCiudades));
        break;
        
      case 'SUBCATEGORIA':
        promises.push(fetchByCategoria('CATEGORIA_RED').then(setCategorias));
        break;
        
      case 'CATEGORIA_RED':
        promises.push(fetchByCategoria('SUBCATEGORIA').then(setSubcategorias));
        break;
        
      case 'DETALLE':
        promises.push(fetchByCategoria('SUBCATEGORIA').then(setSubcategorias));
        break;
        
      case 'SOLUCION_CASO':
        promises.push(fetchByCategoria('CAUSA_RAIZ').then(setCategorias));
        break;
    }

    await Promise.all(promises);
  }, [currentCategoria, fetchByCategoria]);

  useEffect(() => {
    fetchItems();
    fetchRelatedData();
  }, [fetchItems, fetchRelatedData]);

  // ✅ CORREGIDO: Usar deleteMiscellaneous en lugar de fetch
  const deleteItem = useCallback(async (item: MiscellaneousItem): Promise<boolean> => {
    try {
      const itemId = item._id || item.id;
      if (!itemId) {
        showNotification("ID del elemento no válido", "error");
        return false;
      }

      await deleteMiscellaneous(itemId);
      showNotification("Elemento eliminado correctamente", "success");
      await fetchItems();
      await fetchRelatedData();
      return true;
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      const message = error?.response?.data?.message || "Error de conexión";
      showNotification(message, "error");
      return false;
    }
  }, [fetchItems, fetchRelatedData, showNotification]);

  // ✅ CORREGIDO: Usar createMiscellaneous en lugar de fetch
  const addItem = useCallback(async (payload: any): Promise<boolean> => {
    try {
      await createMiscellaneous(payload);
      showNotification("Elemento agregado correctamente", "success");
      await fetchItems();
      await fetchRelatedData();
      return true;
    } catch (error: any) {
      console.error("Error:", error);
      const message = error?.response?.data?.message || 'No se pudo agregar';
      showNotification(`Error: ${message}`, "error");
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
    ciudades,
    subcategorias,
  };
};