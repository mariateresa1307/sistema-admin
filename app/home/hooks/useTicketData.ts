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
  loadLocalidades: (ciudad: string) => Promise<void>;
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
  const [grupoDestino, setGrupoDestino] = useState<ConfiguracionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ✅ Carga inicial paralela
  const loadInitialData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [useTicketData] Cargando datos iniciales...');

      const [operadoresRes, ciudadesRes, causasRes, grupoDestinoRes, tipoClienteRes] = await Promise.all([
        getUsers(undefined, { isActive: true }),
        getMiscellaneous({ categoria: 'CIUDAD' }),
        getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ }),
        getMiscellaneous({ categoria: 'GRUPO_DESTINO' }),
        getMiscellaneous({ categoria: 'TIPO_CLIENTE' }),
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
      setGrupoDestino(grupoDestinoRes.data || []);
      setTipoCliente(tipoClienteRes.data || []);

      console.log('✅ [useTicketData] Datos iniciales cargados');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('❌ [useTicketData] Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [open]);

  // ✅ CARGAR CATEGORÍAS DE RED
  const loadCategoriasRed = useCallback(async (tipoIncidencia: string) => {
    if (!tipoIncidencia) {
      setCategoriaRed([]);
      return [];
    }

    setLoading(true);
    try {
      const res = await getMiscellaneous({
        categoria: 'CATEGORIA_RED',
        tipoIncidencia,
      });

      const data = res.data || [];
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

  // 🎯 FIX: Filtra estrictamente por Tipo de Cliente ANTES de consultar
  const loadServiciosAfectados = useCallback(
    async (tipoClienteInput: string | ConfiguracionInterface) => {
      if (!tipoClienteInput) {
        setServiciosAfectados([]);
        return;
      }

      try {
        let idAEnviar = '';
        let valorAEnviar = '';

        // Si se recibe directamente el objeto seleccionado
        if (typeof tipoClienteInput === 'object') {
          idAEnviar = tipoClienteInput._id;
          valorAEnviar = tipoClienteInput.valor;
        } else {
          // Si se recibe solo el ID/Texto, buscar en el listado cargado
          const clienteObj = tipoCliente.find(
            (tc) => tc._id === tipoClienteInput || tc.valor === tipoClienteInput
          );
          idAEnviar = clienteObj?._id || tipoClienteInput;
          valorAEnviar = clienteObj?.valor || tipoClienteInput;
        }

        console.log('📡 [loadServiciosAfectados] Filtrando previo a la consulta con:', {
          idAEnviar,
          valorAEnviar,
        });

        // 1. Petición filtrada por ID / padreId
        let res = await getService({
          tipoCliente: idAEnviar,
          padreId: idAEnviar,
        });

        let dataServicios: any[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        // 2. Si no retornó datos por ID, reintentar filtrando directamente por el 'valor' (ej. "CORPORATIVO")
        if (dataServicios.length === 0 && valorAEnviar) {
          console.log('⚠️ [loadServiciosAfectados] Reintentando filtro por valor en texto:', valorAEnviar);
          res = await getService({
            tipoCliente: valorAEnviar,
            padreNombre: valorAEnviar,
          });

          dataServicios = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        }

        // 3. Filtrado preventivo en el Frontend en caso de que la API retorne todos los servicios sin filtrar
        const serviciosFiltrados = dataServicios.filter((servicio: any) => {
          if (!servicio) return false;
          // Validar si el objeto del servicio trae propiedad de relación con Tipo de Cliente
          const tcRel = servicio.tipoCliente || servicio.padreId || servicio.categoriaId || servicio.padreNombre;
          if (!tcRel) return true; // Si no tiene el campo, se conserva
          return tcRel === idAEnviar || tcRel === valorAEnviar;
        });

        console.log('✅ [loadServiciosAfectados] Servicios filtrados listos:', serviciosFiltrados);
        setServiciosAfectados(serviciosFiltrados);
      } catch (error) {
        console.error('❌ [loadServiciosAfectados] Error al obtener servicios filtrados:', error);
        setServiciosAfectados([]);
      }
    },
    [tipoCliente]
  );

  const loadCausasRaiz = useCallback(async () => {
    try {
      const response = await getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ });
      setCausasRaiz(response.data || []);
    } catch (error) {
      console.error('Error cargando causas raíz:', error);
    }
  }, []);

  const loadGrupoDestino = useCallback(async () => {
    try {
      const response = await getMiscellaneous({ categoria: 'GRUPO_DESTINO' });
      setGrupoDestino(response.data || []);
    } catch (error) {
      console.error('Error cargando grupo destino:', error);
    }
  }, []);

  // ✅ Funciones de limpieza
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