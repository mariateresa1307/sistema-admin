import { useState, useCallback, useEffect } from 'react';
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
  ciudadId?: string;
  categoriaId?: string;
  subcategoriaId?: string;
  estadoId?: string;
  causaId?: string;
};

export type NotificationType = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

interface UseMiscellaneousProps {
  categoria: string;
  page?: number;
  pageSize?: number;
  searchValue?: string;
  padreId?: string;
  fetchAll?: boolean;
}

export const useMiscellaneous = ({
  categoria,
  page = 1,
  pageSize = 10,
  searchValue,
  padreId,
  fetchAll = false,
}: UseMiscellaneousProps) => {
  const [rows, setRows] = useState<MiscellaneousItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        categoria,
        limit: fetchAll ? 900 : pageSize, // ✅ Usar 9999 si fetchAll es true
      };

      if (!fetchAll) {
        params.page = page;
      }

      if (searchValue) params.valor = searchValue;
      if (padreId) params.padreId = padreId;

      const response = await getMiscellaneous(params);

      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      const total = response.data?.total || data.length;

      setRows(data);
      setTotalItems(total);
    } catch (error) {
      console.error("Error al obtener items:", error);
      showNotification("Error al cargar los datos", "error");
      setRows([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [categoria, page, pageSize, searchValue, padreId, fetchAll, showNotification]); // ✅ fetchAll agregado


  const fetchByCategoria = useCallback(async (cat: string) => {
    try {
      const response = await getMiscellaneous({ categoria: cat, limit: 900 });
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      return data;
    } catch (error) {
      console.error(`Error al obtener ${cat}:`, error);
      return [];
    }
  }, []);

  const fetchRelatedData = useCallback(async () => {
    const promises: Promise<any>[] = [];

    promises.push(fetchByCategoria('ESTADO').then(setEstados));
    switch (categoria) {
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
  }, [categoria, fetchByCategoria]);

useEffect(() => {
  fetchItems();
}, [fetchItems]);

useEffect(() => {
  fetchRelatedData();
}, [fetchRelatedData]);

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

  const getEstados = useCallback(() => {
    return estados.filter(item => item.activo !== false);
  }, [estados]);

  const getLocalidadesByCiudad = useCallback((ciudadId: string) => {
    if (!ciudadId) return [];
    return localidades.filter(
      item => (String(item.ciudadId) === String(ciudadId) || String(item.padreId) === String(ciudadId)) && item.activo !== false
    );
  }, [localidades]);

  const getSubcategoriasByCategoria = useCallback((categoriaId: string) => {
    if (!categoriaId) return [];
    return subcategorias.filter(
      item => (String(item.categoriaId) === String(categoriaId) || String(item.padreId) === String(categoriaId)) && item.activo !== false
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
    totalItems,
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