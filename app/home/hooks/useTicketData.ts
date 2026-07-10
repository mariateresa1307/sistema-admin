// app/home/hooks/useTicketData.ts
import { useState, useEffect, useCallback } from 'react';
import { getMiscellaneous, getUsers, getService } from '@/lib/api';
import { CATEGORIA } from 'app/utils/constants';
import { ConfiguracionInterface } from '../../utils/types';

type Operador = {
  _id: string;
  primerNombre: string;
  primerApellido: string;
  username?: string;
};

export interface UseTicketDataReturn {
  operadores: Operador[];
  categoriaRed: ConfiguracionInterface[];
  subcategorias: ConfiguracionInterface[];
  detalle: ConfiguracionInterface[];
  tipoCliente: ConfiguracionInterface[];
  causasRaiz: ConfiguracionInterface[];
  solucionesCaso: ConfiguracionInterface[];
  ciudadesOptions: any[];
  localidadesOptions: any[];
  serviciosAfectados: any[];
  loading: boolean;
  error: Error | null;
  
  loadInitialData: () => Promise<void>;
  loadLocalidades: (ciudad: string) => Promise<void>;
  loadCategoriasRed: (tipoIncidencia: string) => Promise<ConfiguracionInterface[]>;
  loadSubcategorias: (categoriaId: string) => Promise<void>;
  loadDetalle: (subcategoriaId: string) => Promise<void>;
  loadTipoCliente: () => Promise<void>;
  loadSolucionesCaso: (causaRaizId: string) => Promise<void>;
  loadServiciosAfectados: (tipoClienteId: string) => Promise<void>;
  
  clearSubcategorias: () => void;
  clearDetalle: () => void;
  clearTipoCliente: () => void;
  clearLocalidades: () => void;
  clearServiciosAfectados: () => void;
  clearCategoriaRed: () => void;
}

export const useTicketData = (open: boolean): UseTicketDataReturn => {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [categoriaRed, setCategoriaRed] = useState<ConfiguracionInterface[]>([]);
  const [subcategorias, setSubcategorias] = useState<ConfiguracionInterface[]>([]);
  const [detalle, setDetalle] = useState<ConfiguracionInterface[]>([]);
  const [tipoCliente, setTipoCliente] = useState<ConfiguracionInterface[]>([]);
  const [causasRaiz, setCausasRaiz] = useState<ConfiguracionInterface[]>([]);
  const [solucionesCaso, setSolucionesCaso] = useState<ConfiguracionInterface[]>([]);
  const [ciudadesOptions, setCiudadesOptions] = useState<any[]>([]);
  const [localidadesOptions, setLocalidadesOptions] = useState<any[]>([]);
  const [serviciosAfectados, setServiciosAfectados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ✅ Carga inicial paralela
  const loadInitialData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [useTicketData] Cargando datos iniciales...');
      
      const [operadoresRes, ciudadesRes, causasRes] = await Promise.all([
        getUsers(undefined, { isActive: true }),
        getMiscellaneous({ categoria: 'CIUDAD' }),
        getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ }),
      ]);

      setOperadores(
        (operadoresRes.data || []).map((u: any) => ({
          _id: u._id,
          primerNombre: u.primerNombre,
          primerApellido: u.primerApellido,
          username: u.username,
        }))
      );
      setCiudadesOptions(ciudadesRes.data || []);
      setCausasRaiz(causasRes.data || []);
      
      console.log('✅ [useTicketData] Datos iniciales cargados');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('❌ [useTicketData] Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [open]);

  // ✅ CARGAR CATEGORÍAS DE RED - FUNCIÓN CRÍTICA
  const loadCategoriasRed = useCallback(async (tipoIncidencia: string) => {
    console.log(' [useTicketData] loadCategoriasRed llamado con:', tipoIncidencia);
    
    if (!tipoIncidencia) {
      console.log('⚠️ [useTicketData] tipoIncidencia vacío, limpiando categorías');
      setCategoriaRed([]);
      return [];
    }

    setLoading(true);
    try {
      const res = await getMiscellaneous({ 
        categoria: 'CATEGORIA_RED', 
        tipoIncidencia 
      });
      
      const data = res.data || [];
      console.log('✅ [useTicketData] Categorías cargadas:', data.length, data);
      setCategoriaRed(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error cargando categorías');
      setError(error);
      console.error('❌ [useTicketData] Error cargando categorías:', error);
      setCategoriaRed([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocalidades = useCallback(async (ciudad: string) => {
    if (!ciudad) {
      setLocalidadesOptions([]);
      return;
    }
    try {
      const res = await getMiscellaneous({ categoria: 'LOCALIDAD', padreNombre: ciudad });
      setLocalidadesOptions(res.data || []);
    } catch (error) {
      console.error('Error cargando localidades:', error);
      setLocalidadesOptions([]);
    }
  }, []);

  const loadSubcategorias = useCallback(async (categoriaId: string) => {
    try {
      const res = await getMiscellaneous({ categoria: 'SUBCATEGORIA', padreId: categoriaId });
      setSubcategorias(res.data || []);
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
      setSubcategorias([]);
    }
  }, []);

  const loadDetalle = useCallback(async (subcategoriaId: string) => {
    try {
      const res = await getMiscellaneous({ categoria: 'DETALLE', padreId: subcategoriaId });
      setDetalle(res.data || []);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setDetalle([]);
    }
  }, []);

  const loadTipoCliente = useCallback(async () => {
    try {
      const res = await getMiscellaneous({ categoria: 'TIPO_CLIENTE' });
      setTipoCliente(res.data || []);
    } catch (error) {
      console.error('Error cargando tipos de cliente:', error);
      setTipoCliente([]);
    }
  }, []);

  const loadSolucionesCaso = useCallback(async (causaRaizId: string) => {
    if (!causaRaizId) {
      setSolucionesCaso([]);
      return;
    }
    try {
      const res = await getMiscellaneous({
        categoria: CATEGORIA.SOLUCION_CASO,
        padreId: causaRaizId,
      });
      setSolucionesCaso(res.data || []);
    } catch (error) {
      console.error('Error cargando soluciones:', error);
      setSolucionesCaso([]);
    }
  }, []);

  const loadServiciosAfectados = useCallback(async (tipoClienteId: string) => {
    try {
      const res = await getService({ tipoCliente: tipoClienteId });
      setServiciosAfectados(res.data || []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setServiciosAfectados([]);
    }
  }, []);

  const clearSubcategorias = useCallback(() => setSubcategorias([]), []);
  const clearDetalle = useCallback(() => setDetalle([]), []);
  const clearTipoCliente = useCallback(() => setTipoCliente([]), []);
  const clearLocalidades = useCallback(() => setLocalidadesOptions([]), []);
  const clearServiciosAfectados = useCallback(() => setServiciosAfectados([]), []);
  const clearCategoriaRed = useCallback(() => setCategoriaRed([]), []);

  return {
    operadores,
    categoriaRed,
    subcategorias,
    detalle,
    tipoCliente,
    causasRaiz,
    solucionesCaso,
    ciudadesOptions,
    localidadesOptions,
    serviciosAfectados,
    loading,
    error,
    loadInitialData,
    loadLocalidades,
    loadCategoriasRed,
    loadSubcategorias,
    loadDetalle,
    loadTipoCliente,
    loadSolucionesCaso,
    loadServiciosAfectados,
    clearSubcategorias,
    clearDetalle,
    clearTipoCliente,
    clearLocalidades,
    clearServiciosAfectados,
    clearCategoriaRed,
  };
};