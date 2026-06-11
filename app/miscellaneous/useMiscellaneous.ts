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
  const [allItems, setAllItems] = useState<MiscellaneousItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

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

  const fetchAllItems = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setAllItems(items);
    } catch (error) {
      console.error("Error al obtener todos los items:", error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchAllItems();
  }, [fetchItems, fetchAllItems]);

  const deleteItem = useCallback(async (item: MiscellaneousItem): Promise<boolean> => {
    if (!window.confirm(`¿Estás seguro de eliminar "${item.valor}"?`)) return false;

    try {
      const res = await fetch(`${API_URL}/${item._id || item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showNotification("Elemento eliminado correctamente", "success");
        fetchItems();
        fetchAllItems();
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
  }, [fetchItems, fetchAllItems, showNotification]);

  const addItem = useCallback(async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification("Elemento agregado correctamente", "success");
        await fetchAllItems();
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
  }, [fetchAllItems, showNotification]);

  const getEstados = useCallback(() => {
    return allItems.filter(
      item => item.categoria === 'ESTADO' && item.activo !== false
    );
  }, [allItems]);

  const getLocalidadesByCiudad = useCallback((ciudadId: string) => {
    return allItems.filter(
      item => item.categoria === 'LOCALIDAD' && item.padreId === ciudadId && item.activo !== false
    );
  }, [allItems]);

  const getSubcategoriasByCategoria = useCallback((categoriaId: string) => {
  return allItems.filter(
    item => item.categoria === 'SUBCATEGORIA' && item.padreId === categoriaId && item.activo !== false
  );
}, [allItems]);

  return {
    rows,
    allItems,
    loading,
    notification,
    closeNotification,
    fetchItems,
    fetchAllItems,
    deleteItem,
    addItem,
    getEstados,
    getLocalidadesByCiudad,
    getSubcategoriasByCategoria
  };
};