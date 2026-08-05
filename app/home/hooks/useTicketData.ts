import { useState, useCallback } from 'react';
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
  grupoDestino: ConfiguracionInterface[];
  loading: boolean;
  error: Error | null;

  loadInitialData: () => Promise<void>;
  loadCategoriasRed: (tipoIncidencia: string) => Promise<ConfiguracionInterface[]>;
  loadSubcategorias: (categoriaId: string) => Promise<void>;
  loadDetalle: (subcategoriaId: string) => Promise<void>;
  loadTipoCliente: () => Promise<void>;
  loadLocalidades: (ciudadIdOrName: string) => void;
  loadSolucionesCaso: (causaRaizId: string) => Promise<void>;
  loadServiciosAfectados: (tipoClienteInput: string | ConfiguracionInterface) => Promise<void>;
  loadCausasRaiz: () => Promise<void>;
  loadGrupoDestino: () => Promise<void>;

  clearSubcategorias: () => void;
  clearDetalle: () => void;
  clearTipoCliente: () => void;
  clearLocalidades: () => void;
  clearServiciosAfectados: () => void;
  clearCategoriaRed: () => void;
}

// ✅ FUNCIÓN CLAVE: Extrae el array correctamente, ya sea que venga paginado o directo
const extractData = (res: any) => {
  const data = res?.data;
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
};

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
  const [todasLasLocalidades, setTodasLasLocalidades] = useState<any[]>([]); // ✅ Para filtrado en frontend
  const [serviciosAfectados, setServiciosAfectados] = useState<any[]>([]);
  const [grupoDestino, setGrupoDestino] = useState<ConfiguracionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadInitialData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [useTicketData] Iniciando carga de datos iniciales...');
      const [operadoresRes, ciudadesRes, causasRes, grupoDestinoRes, tipoClienteRes, localidadesRes] = await Promise.all([
        getUsers(undefined, { isActive: true }),
        getMiscellaneous({ categoria: 'CIUDAD', limit: 999 }),
        getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ, limit: 999 }),
        getMiscellaneous({ categoria: 'GRUPO_DESTINO', limit: 999 }),
        getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 999 }),
        getMiscellaneous({ categoria: 'LOCALIDAD', limit: 999 }),
      ]);

      setOperadores((operadoresRes.data || []).map((u: any) => ({
        _id: u._id,
        primerNombre: u.primerNombre,
        primerApellido: u.primerApellido,
        username: u.username,
      })));
      
      const ciudadesData = extractData(ciudadesRes);
      const tipoClienteData = extractData(tipoClienteRes);
      const localidadesData = extractData(localidadesRes);
      
      setCiudadesOptions(ciudadesData);
      setCausasRaiz(extractData(causasRes));
      setGrupoDestino(extractData(grupoDestinoRes));
      setTipoCliente(tipoClienteData);
      setTodasLasLocalidades(localidadesData); // ✅ Guardamos todas para filtrar localmente
      
      console.log('✅ [useTicketData] Carga exitosa:', {
        ciudades: ciudadesData.length,
        tipoCliente: tipoClienteData.length,
        localidades: localidadesData.length,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('❌ [useTicketData] Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [open]);

  const loadCategoriasRed = useCallback(async (tipoIncidencia: string) => {
    if (!tipoIncidencia) {
      setCategoriaRed([]);
      return [];
    }
    setLoading(true);
    try {
      console.log(`🔄 [useTicketData] Cargando categorías para: ${tipoIncidencia}`);
      const res = await getMiscellaneous({ categoria: 'CATEGORIA_RED', tipoIncidencia, limit: 999 });
      const data = extractData(res);
      setCategoriaRed(data);
      console.log(`✅ [useTicketData] Categorías cargadas: ${data.length}`);
      return data;
    } catch (err) {
      console.error('❌ [useTicketData] Error cargando categorías:', err);
      setCategoriaRed([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CORREGIDO: Filtrado local robusto usando ciudadId o padreId
  const loadLocalidades = useCallback((ciudadIdOrName: string) => {
    if (!ciudadIdOrName) {
      setLocalidadesOptions([]);
      return;
    }
    
    console.log(`🔍 [useTicketData] Filtrando localidades para: ${ciudadIdOrName}`);
    
    const filtradas = todasLasLocalidades.filter((loc: any) => {
      const locCiudadId = String(loc.ciudadId || loc.padreId || '');
      const searchId = String(ciudadIdOrName);
      
      return locCiudadId === searchId || 
             String(loc.padreNombre || '').toLowerCase() === String(ciudadIdOrName).toLowerCase();
    });
    
    console.log(`✅ [useTicketData] Localidades encontradas: ${filtradas.length}`);
    setLocalidadesOptions(filtradas);
  }, [todasLasLocalidades]);

  const loadSubcategorias = useCallback(async (categoriaId: string) => {
    try {
      const res = await getMiscellaneous({ categoria: 'SUBCATEGORIA', padreId: categoriaId, limit: 999 });
      setSubcategorias(extractData(res));
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
      setSubcategorias([]);
    }
  }, []);

  const loadDetalle = useCallback(async (subcategoriaId: string) => {
    try {
      const res = await getMiscellaneous({ categoria: 'DETALLE', padreId: subcategoriaId, limit: 999 });
      setDetalle(extractData(res));
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setDetalle([]);
    }
  }, []);

  const loadTipoCliente = useCallback(async () => {
    try {
      const res = await getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 999 });
      setTipoCliente(extractData(res));
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
      const res = await getMiscellaneous({ categoria: CATEGORIA.SOLUCION_CASO, padreId: causaRaizId, limit: 999 });
      setSolucionesCaso(extractData(res));
    } catch (error) {
      console.error('Error cargando soluciones:', error);
      setSolucionesCaso([]);
    }
  }, []);

  const loadServiciosAfectados = useCallback(async (tipoClienteInput: string | ConfiguracionInterface) => {
    if (!tipoClienteInput) {
      setServiciosAfectados([]);
      return;
    }

    setLoading(true);
    try {
      let idAEnviar = '';
      if (typeof tipoClienteInput === 'object' && tipoClienteInput !== null) {
        idAEnviar = tipoClienteInput._id;
      } else {
        idAEnviar = String(tipoClienteInput);
      }

      if (!idAEnviar) {
        setServiciosAfectados([]);
        return;
      }

      console.log('📡 [useTicketData] Solicitando servicios para tipoCliente ID:', idAEnviar);
      const res = await getService({ tipoCliente: idAEnviar });

      const dataServicios: any[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      console.log('✅ [useTicketData] Servicios recibidos:', dataServicios.length);
      setServiciosAfectados(dataServicios);
    } catch (error) {
      console.error('❌ [useTicketData] Error al obtener servicios:', error);
      setServiciosAfectados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCausasRaiz = useCallback(async () => {
    try {
      const response = await getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ, limit: 999 });
      setCausasRaiz(extractData(response));
    } catch (error) {
      console.error('Error cargando causas raíz:', error);
    }
  }, []);

  const loadGrupoDestino = useCallback(async () => {
    try {
      const response = await getMiscellaneous({ categoria: 'GRUPO_DESTINO', limit: 999 });
      setGrupoDestino(extractData(response));
    } catch (error) {
      console.error('Error cargando grupo destino:', error);
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
    grupoDestino,
    loading,
    error,
    loadInitialData,
    loadCategoriasRed,
    loadSubcategorias,
    loadDetalle,
    loadTipoCliente,
    loadLocalidades,
    loadSolucionesCaso,
    loadServiciosAfectados,
    loadCausasRaiz,
    loadGrupoDestino,
    clearSubcategorias,
    clearDetalle,
    clearTipoCliente,
    clearLocalidades,
    clearServiciosAfectados,
    clearCategoriaRed,
  };
};