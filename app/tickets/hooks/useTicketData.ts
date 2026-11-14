import { useState, useCallback, useMemo } from 'react'; 
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
  todasLasLocalidades: any[]; 
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
  loadServiciosAfectados: ( tipoClienteInput: string | string[] | ConfiguracionInterface | ConfiguracionInterface[]) => Promise<void>;
  loadAllServicios: () => Promise<void>;
  loadCausasRaiz: () => Promise<void>;
  loadGrupoDestino: () => Promise<void>;
  getCausasRaizPorCategoria: (categoriaId: string) => ConfiguracionInterface[];

  clearSubcategorias: () => void;
  clearDetalle: () => void;
  clearTipoCliente: () => void;
  clearLocalidades: () => void;
  clearServiciosAfectados: () => void;
  clearCategoriaRed: () => void;
}

const extractData = (res: any) => {
  const data = res?.data;
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
};

const filterByTipoIncidencia = <T extends { tipoIncidencia?: string[] }>(
  items: T[],
  tipoIncidencia: string,
): T[] => {
  if (!tipoIncidencia) return [];
  const upper = tipoIncidencia.toUpperCase().trim();
  return items.filter(item => {
    if (!Array.isArray(item.tipoIncidencia) || item.tipoIncidencia.length === 0) return false;
    return item.tipoIncidencia.some(t => (t || '').toUpperCase().trim() === upper);
  });
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
  const [todasLasLocalidades, setTodasLasLocalidades] = useState<any[]>([]);
  const [serviciosAfectados, setServiciosAfectados] = useState<any[]>([]);
  const [grupoDestino, setGrupoDestino] = useState<ConfiguracionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadInitialData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);

    try {
      const [operadoresRes, ciudadesRes, causasRes, grupoDestinoRes, tipoClienteRes, localidadesRes] = await Promise.all([
        getUsers({ isActive: true }),
        getMiscellaneous({ categoria: 'CIUDAD', limit: 999 }),       
        getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ, limit: 999 }),
        getMiscellaneous({ categoria: 'GRUPO_DESTINO', limit: 999 }),
        getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 999 }),
        getMiscellaneous({ categoria: 'LOCALIDAD', limit: 999 }),    
      ]);

      const operadoresData = Array.isArray(operadoresRes.data?.data) ? operadoresRes.data.data : Array.isArray(operadoresRes.data) ? operadoresRes.data : [];
      setOperadores(operadoresData.map((u: any) => ({ _id: u._id, primerNombre: u.primerNombre, primerApellido: u.primerApellido, username: u.username })));

      setCiudadesOptions(extractData(ciudadesRes));
      setCausasRaiz(extractData(causasRes));
      setGrupoDestino(extractData(grupoDestinoRes));
      setTipoCliente(extractData(tipoClienteRes));
      setTodasLasLocalidades(extractData(localidadesRes));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('❌ [useTicketData] Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [open]);

  const loadCategoriasRed = useCallback(async (tipoIncidencia: string) => {
    if (!tipoIncidencia) { setCategoriaRed([]); return []; }
    setLoading(true);
    try {
      const res = await getMiscellaneous({ categoria: 'CATEGORIA_RED', limit: 999 });
      const all = extractData(res) as ConfiguracionInterface[];
      const filtradas = filterByTipoIncidencia(all, tipoIncidencia);
      setCategoriaRed(filtradas);
      return filtradas;
    } catch (err) {
      console.error('❌ [useTicketData] Error cargando categorías:', err);
      setCategoriaRed([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocalidades = useCallback((ciudadIdOrName: string) => {
    if (!ciudadIdOrName) { setLocalidadesOptions([]); return; }
    const searchVal = String(ciudadIdOrName).toLowerCase().trim();
    const ciudadObj = ciudadesOptions.find((c: any) => String(c._id) === searchVal || (c.valor || '').toLowerCase() === searchVal);
    const ciudadId = ciudadObj ? String(ciudadObj._id) : '';
    const ciudadNombre = ciudadObj ? (ciudadObj.valor || '').toLowerCase() : searchVal;

    const filtradas = todasLasLocalidades.filter((loc: any) => {
      const locPadreId = String(loc.padreId || '').toLowerCase();
      const locCiudadId = String(loc.ciudadId || '').toLowerCase();
      const locPadreNombre = String(loc.padreNombre || '').toLowerCase();
      return (ciudadId && (locPadreId === ciudadId || locCiudadId === ciudadId)) || locPadreNombre === ciudadNombre;
    });
    setLocalidadesOptions(filtradas);
  }, [todasLasLocalidades, ciudadesOptions]);

  const loadSubcategorias = useCallback(async (categoriaId: string) => {
    if (!categoriaId) { setSubcategorias([]); return; }
    try {
      const res = await getMiscellaneous({ categoria: 'SUBCATEGORIA', padreId: categoriaId, limit: 999 });
      setSubcategorias(extractData(res));
    } catch (error) { console.error('Error cargando subcategorías:', error); setSubcategorias([]); }
  }, []);

  const loadDetalle = useCallback(async (subcategoriaId: string) => {
    if (!subcategoriaId) { setDetalle([]); return; }
    try {
      const res = await getMiscellaneous({ categoria: 'DETALLE', padreId: subcategoriaId, limit: 999 });
      setDetalle(extractData(res));
    } catch (error) { console.error('Error cargando detalles:', error); setDetalle([]); }
  }, []);

  const loadTipoCliente = useCallback(async () => {
    try {
      const res = await getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 999 });
      setTipoCliente(extractData(res));
    } catch (error) { console.error('Error cargando tipos de cliente:', error); setTipoCliente([]); }
  }, []);

  const loadSolucionesCaso = useCallback(async (causaRaizId: string) => {
    if (!causaRaizId) { setSolucionesCaso([]); return; }
    try {
      const res = await getMiscellaneous({ categoria: CATEGORIA.SOLUCION_CASO, padreId: causaRaizId, limit: 999 });
      setSolucionesCaso(extractData(res));
    } catch (error) { console.error('Error cargando soluciones:', error); setSolucionesCaso([]); }
  }, []);

const loadServiciosAfectados = useCallback(async (
  tipoClienteInput: string | string[] | ConfiguracionInterface | ConfiguracionInterface[]
) => {
  if (!tipoClienteInput) { setServiciosAfectados([]); return; }

  // ✅ Normalizar a array de IDs
  const rawItems = Array.isArray(tipoClienteInput) ? tipoClienteInput : [tipoClienteInput];
  const ids = rawItems
    .map(item => {
      if (typeof item === 'object' && item !== null) return String((item as any)._id || '');
      return String(item);
    })
    .filter(id => id && /^[0-9a-fA-F]{24}$/.test(id));

  if (ids.length === 0) { setServiciosAfectados([]); return; }

  setLoading(true);
  try {
    // ✅ Si es un solo ID, hacer una petición directa (más rápido)
    if (ids.length === 1) {
      const res = await getService({ tipoCliente: ids[0], limit: 9999 });
      const dataServicios: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setServiciosAfectados(dataServicios);
    } else {
      // ✅ Si son múltiples IDs, hacer peticiones en paralelo y combinar/deduplicar
      const resultados = await Promise.all(
        ids.map(id => getService({ tipoCliente: id, limit: 9999 }))
      );

      const mapaServicios = new Map<string, any>();
      resultados.forEach(res => {
        const dataServicios: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        dataServicios.forEach(servicio => {
          const id = String(servicio._id || servicio.id || '');
          if (id && !mapaServicios.has(id)) {
            mapaServicios.set(id, servicio);
          }
        });
      });

      setServiciosAfectados(Array.from(mapaServicios.values()));
    }
  } catch (error) {
    console.error('❌ [useTicketData] Error al obtener servicios:', error);
    setServiciosAfectados([]);
  } finally {
    setLoading(false);
  }
}, []);

  const loadAllServicios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getService({ limit: 9999 });
      const dataServicios: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setServiciosAfectados(dataServicios);
    } catch (error) { console.error('❌ [useTicketData] Error al obtener todos los servicios:', error); setServiciosAfectados([]); }
    finally { setLoading(false); }
  }, []);

  const loadCausasRaiz = useCallback(async () => {
    try {
      const response = await getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ, limit: 999 });
      setCausasRaiz(extractData(response));
    } catch (error) { console.error('Error cargando causas raíz:', error); }
  }, []);

  const loadGrupoDestino = useCallback(async () => {
    try {
      const response = await getMiscellaneous({ categoria: 'GRUPO_DESTINO', limit: 999 });
      setGrupoDestino(extractData(response));
    } catch (error) { console.error('Error cargando grupo destino:', error); }
  }, []);

  const getCausasRaizPorCategoria = useCallback((categoriaId: string) => {
    if (!categoriaId) return causasRaiz; 

    return causasRaiz.filter((causa: any) => {
      if (causa.categoriaRedIds && causa.categoriaRedIds.length > 0) {
        return causa.categoriaRedIds.includes(categoriaId);
      }
      return true; 
    });
  }, [causasRaiz]);

  const clearSubcategorias = useCallback(() => setSubcategorias([]), []);
  const clearDetalle = useCallback(() => setDetalle([]), []);
  const clearTipoCliente = useCallback(() => setTipoCliente([]), []);
  const clearLocalidades = useCallback(() => setLocalidadesOptions([]), []);
  const clearServiciosAfectados = useCallback(() => setServiciosAfectados([]), []);
  const clearCategoriaRed = useCallback(() => setCategoriaRed([]), []);

  
return useMemo(() => ({
  operadores, categoriaRed, subcategorias, detalle, tipoCliente, causasRaiz, solucionesCaso,
  ciudadesOptions, localidadesOptions, todasLasLocalidades, serviciosAfectados, grupoDestino,
  loading, error,
  loadInitialData, loadCategoriasRed, loadSubcategorias, loadDetalle, loadTipoCliente,
  loadLocalidades, loadSolucionesCaso, loadServiciosAfectados, loadAllServicios, loadCausasRaiz, loadGrupoDestino,
  getCausasRaizPorCategoria,
  clearSubcategorias, clearDetalle, clearTipoCliente, clearLocalidades, clearServiciosAfectados, clearCategoriaRed,
}), [
  operadores, categoriaRed, subcategorias, detalle, tipoCliente, causasRaiz, solucionesCaso,
  ciudadesOptions, localidadesOptions, todasLasLocalidades, serviciosAfectados, grupoDestino,
  loading, error,
  loadInitialData, loadCategoriasRed, loadSubcategorias, loadDetalle, loadTipoCliente,
  loadLocalidades, loadSolucionesCaso, loadServiciosAfectados, loadAllServicios, loadCausasRaiz, loadGrupoDestino,
  getCausasRaizPorCategoria,
  clearSubcategorias, clearDetalle, clearTipoCliente, clearLocalidades, clearServiciosAfectados, clearCategoriaRed,
]);

};