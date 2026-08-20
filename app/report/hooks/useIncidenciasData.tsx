import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { getService, getTickets, getMiscellaneous } from '@/lib/api';
import { Service } from 'app/utils/types';

dayjs.extend(duration);

/* ============================================================ */
/*  TIPOS                                                        */
/* ============================================================ */
export interface TicketAsociado {
  _id: string;
  caseNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  incidentType: string;
  servicioNombre: string;
  tipoServicio?: string;
  id_circuito?: string;
  id_netuno?: string;
  contrato?: number | string;
  ultimaMilla?: string;
  proveedorDelServicioCompartido?: string;
}

export interface IncidenciaPorServicio {
  tipoServicio: string;
  servicioId: string;
  servicioNombre: string;
  totalIncidencias: number;
  abiertas: number;
  cerradas: number;
  ultimaIncidencia: string;
  serviciosCount: number;
  tickets: TicketAsociado[];
}

export interface IncidenciaPorProveedor {
  ticketId: string;
  caseNumber: string;
  subject: string;
  servicioNombre: string;
  tipoServicio: string;
  proveedorNombre: string;
  horaInicioFalla: string;
  horaDeteccionNoc: string;
  horaInicioAtencion: string;
  horaFinAfectacion: string;
  duracionAfectacion: string;
  causaRaiz: string;
  solucionCaso: string;
  status: string;
  createdAt: string;
}

export interface IncidenciaTotales {
  total: number;
  abiertas: number;
  cerradas: number;
  servicios: number;
}

export interface ServicioChartData {
  nombre: string;
  total: number;
  abiertas: number;
  cerradas: number;
}

export interface TipoServicioChartData {
  name: string;
  value: number;
}

interface IncidenciaFilters {
  tipoServicio: string;
  proveedor: string;
  mes: Dayjs;
}

interface UseIncidenciasDataReturn {
  filters: IncidenciaFilters;
  setFilters: React.Dispatch<React.SetStateAction<IncidenciaFilters>>;
  data: IncidenciaPorServicio[];
  dataPorProveedor: IncidenciaPorProveedor[];
  servicioChartData: ServicioChartData[];
  tipoServicioChartData: TipoServicioChartData[];
  servicioChartDataPorProveedor: ServicioChartData[];
  tipoServicioChartDataPorProveedor: TipoServicioChartData[];
  totalesPorProveedor: IncidenciaTotales;
  totales: IncidenciaTotales;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  clearError: () => void;
  proveedores: any[];
}

/* ============================================================ */
/*  HELPERS PUROS (sin efectos secundarios)                      */
/* ============================================================ */

/** Extrae datos planos de una respuesta API (maneja varios formatos). */
const extractData = <T = any>(res: any): T[] => {
  if (!res?.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.data.results)) return res.data.results;
  return [];
};

/** Construye un Map id → valor a partir de datos miscellaneous. */
const buildMap = (data: any[]): Map<string, string> => {
  const map = new Map<string, string>();
  data.forEach((item: any) => {
    if (item?._id && item?.valor) map.set(String(item._id), item.valor);
  });
  return map;
};

/** Calcula duración legible entre dos fechas. */
const calcularDuracion = (inicio: any, fin: any): string => {
  if (!inicio || !fin) return 'N/A';
  const i = dayjs(inicio);
  const f = dayjs(fin);
  if (!i.isValid() || !f.isValid()) return 'N/A';

  const diffMs = f.diff(i);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const hoursRemaining = diffHours % 24;
  const minsRemaining = diffMins % 60;

  if (diffDays > 0) return `${diffDays}d ${hoursRemaining}h ${minsRemaining}min`;
  if (diffHours > 0) return `${diffHours}h ${minsRemaining}min`;
  return `${diffMins}min`;
};

/** Resuelve el nombre del servicio desde el objeto o fallback. */
const getServicioNombre = (servicio: any): string =>
  servicio?.name || servicio?.id_circuito || servicio?.id_netuno || 'Servicio desconocido';

/** Resuelve el tipo de servicio con fallback seguro. */
const getTipoServicio = (servicio: any): string =>
  servicio?.tipoServicio?.trim() || 'Sin Tipo';

/* ============================================================ */
/*  HOOK PRINCIPAL                                               */
/* ============================================================ */
export const useIncidenciasData = (): UseIncidenciasDataReturn => {
  const [filters, setFilters] = useState<IncidenciaFilters>({
    tipoServicio: '',
    proveedor: '',
    mes: dayjs(),
  });
  const [data, setData] = useState<IncidenciaPorServicio[]>([]);
  const [dataPorProveedor, setDataPorProveedor] = useState<IncidenciaPorProveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedores, setProveedores] = useState<any[]>([]);

  // Cargar proveedores al montar
  useEffect(() => {
    const loadProveedores = async () => {
      try {
        const res = await getMiscellaneous({ categoria: 'PROVEEDOR', limit: 9999 });
        setProveedores(extractData(res));
      } catch (err) {
        console.error('❌ Error cargando proveedores:', err);
      }
    };
    loadProveedores();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [servicesRes, ticketsRes, causasRes, solucionesRes] = await Promise.all([
        getService({ limit: 9999 }),
        getTickets({ limit: 9999 }),
        getMiscellaneous({ categoria: 'CAUSA_RAIZ', limit: 9999 }),
        getMiscellaneous({ categoria: 'SOLUCION_CASO', limit: 9999 }),
      ]);

      const services: Service[] = extractData(servicesRes);
      const allTickets: any[] = extractData(ticketsRes);
      const causasMap = buildMap(extractData(causasRes));
      const solucionesMap = buildMap(extractData(solucionesRes));

      const tickets = allTickets.filter((t) =>
        dayjs(t.createdAt).isSame(filters.mes, 'month'),
      );

      const serviceMap = new Map<string, Service>();
      services.forEach((s) => serviceMap.set(String(s._id), s));

      const proveedoresMap = new Map<string, string>();
      proveedores.forEach((p) => proveedoresMap.set(p._id, p.valor));

      // Maps de agrupación
      const incidenciasPorProveedorMap = new Map<string, IncidenciaPorProveedor>();
      const servicioMap = new Map<string, any>();
      const tipoMap = new Map<string, any>();

      tickets.forEach((ticket) => {
        const afectados = Array.isArray(ticket.serviciosAfectados) ? ticket.serviciosAfectados : [];

        afectados.forEach((item: any) => {
          const id = typeof item === 'string' ? item : String(item?._id ?? '');
          if (!id) return;

          const servicio = typeof item === 'object' && item !== null ? item : serviceMap.get(id);
          const tipoServicio = getTipoServicio(servicio);
          const servicioNombre = getServicioNombre(servicio);
          const proveedorId = String(servicio?.proveedorDelServicioCompartido || servicio?.ultimaMilla || '');
          const proveedorNombre = proveedoresMap.get(proveedorId) || 'Sin proveedor';
          const causaRaizNombre = ticket.causaRaiz ? (causasMap.get(ticket.causaRaiz) || ticket.causaRaiz) : 'Sin especificar';
          const solucionId = ticket.SolucionCaso || ticket.solucionCaso;
          const solucionNombre = solucionId ? (solucionesMap.get(solucionId) || solucionId) : 'Sin especificar';
          const duracionAfectacion = calcularDuracion(ticket.horaInicioFalla, ticket.horaFinAfectacion);

          const ticketResumen: TicketAsociado = {
            _id: String(ticket._id ?? ''),
            caseNumber: ticket.caseNumber || 'S/N',
            subject: ticket.subject || 'Sin asunto',
            status: ticket.status || 'N/A',
            createdAt: ticket.createdAt,
            incidentType: ticket.incidentType || 'Sin Clasificar',
            servicioNombre,
            tipoServicio,
            id_circuito: servicio?.id_circuito,
            id_netuno: servicio?.id_netuno,
            contrato: servicio?.contrato,
            ultimaMilla: servicio?.ultimaMilla,
            proveedorDelServicioCompartido: servicio?.proveedorDelServicioCompartido,
          };

          // Vista por proveedor (clave única)
          const keyProv = `${ticket._id}-${id}`;
          if (!incidenciasPorProveedorMap.has(keyProv)) {
            incidenciasPorProveedorMap.set(keyProv, {
              ticketId: String(ticket._id),
              caseNumber: ticket.caseNumber || 'S/N',
              subject: ticket.subject || 'Sin asunto',
              servicioNombre,
              tipoServicio,
              proveedorNombre,
              horaInicioFalla: ticket.horaInicioFalla || 'N/A',
              horaDeteccionNoc: ticket.horaDeteccionNoc || 'N/A',
              horaInicioAtencion: ticket.horaInicioAtencion || 'N/A',
              horaFinAfectacion: ticket.horaFinAfectacion || 'N/A',
              duracionAfectacion,
              causaRaiz: causaRaizNombre,
              solucionCaso: solucionNombre,
              status: ticket.status || 'N/A',
              createdAt: ticket.createdAt,
            });
          }

          // Agrupación por servicio individual
          if (!servicioMap.has(id)) {
            servicioMap.set(id, {
              id,
              nombre: servicioNombre,
              tipoServicio,
              tickets: [],
              totalIncidencias: 0,
              abiertas: 0,
              cerradas: 0,
              ultimaIncidencia: ticket.createdAt,
            });
          }
          const servicioEntry = servicioMap.get(id);
          servicioEntry.totalIncidencias += 1;
          if (String(ticket.status).toLowerCase() === 'cerrado') {
            servicioEntry.cerradas += 1;
          } else {
            servicioEntry.abiertas += 1;
          }
          if (dayjs(ticket.createdAt).isAfter(dayjs(servicioEntry.ultimaIncidencia))) {
            servicioEntry.ultimaIncidencia = ticket.createdAt;
          }
          servicioEntry.tickets.push(ticketResumen);

          // Agrupación por tipo de servicio
          if (!tipoMap.has(tipoServicio)) {
            tipoMap.set(tipoServicio, {
              tipoServicio,
              servicioId: id,
              servicioNombre,
              tickets: [],
              serviciosSet: new Set(),
              totalIncidencias: 0,
              abiertas: 0,
              cerradas: 0,
              ultimaIncidencia: ticket.createdAt,
            });
          }
          const tipoEntry = tipoMap.get(tipoServicio);
          tipoEntry.serviciosSet.add(id);
          tipoEntry.totalIncidencias += 1;
          if (String(ticket.status).toLowerCase() === 'cerrado') {
            tipoEntry.cerradas += 1;
          } else {
            tipoEntry.abiertas += 1;
          }
          if (dayjs(ticket.createdAt).isAfter(dayjs(tipoEntry.ultimaIncidencia))) {
            tipoEntry.ultimaIncidencia = ticket.createdAt;
          }
          tipoEntry.tickets.push({ ...ticketResumen });
        });
      });

      // Construir resultado final
      let result: IncidenciaPorServicio[] = Array.from(tipoMap.values()).map((value) => ({
        tipoServicio: value.tipoServicio,
        servicioId: value.servicioId,
        servicioNombre: value.servicioNombre,
        totalIncidencias: value.totalIncidencias,
        abiertas: value.abiertas,
        cerradas: value.cerradas,
        ultimaIncidencia: value.ultimaIncidencia,
        serviciosCount: value.serviciosSet.size,
        tickets: value.tickets,
      }));

      // Aplicar filtros
      if (filters.tipoServicio) {
        result = result.filter((item) => item.tipoServicio === filters.tipoServicio);
      }
      if (filters.proveedor) {
        result = result.filter((item) =>
          item.tickets.some((ticket) => {
            const proveedorId = ticket.proveedorDelServicioCompartido || ticket.ultimaMilla;
            return proveedorId === filters.proveedor;
          }),
        );
      }

      result.sort((a, b) => b.totalIncidencias - a.totalIncidencias);

      // 🔍 LOG DE DIAGNÓSTICO
      console.log('📊 [useIncidenciasData] Resultado final:', result);
      if (result.length > 0) {
        console.log('📊 [useIncidenciasData] Primer registro:', result[0]);
        console.log('📊 [useIncidenciasData] tiposServicio únicos:', result.map((r) => r.tipoServicio));
      }

      setData(result);

      // Vista por proveedor
      let resultPorProveedor = Array.from(incidenciasPorProveedorMap.values());
      if (filters.proveedor) {
        const proveedorNombreFiltro =
          proveedores.find((p) => p._id === filters.proveedor)?.valor?.toLowerCase() || '';
        resultPorProveedor = resultPorProveedor.filter((item) =>
          item.proveedorNombre.toLowerCase().includes(proveedorNombreFiltro),
        );
      }
      resultPorProveedor.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
      setDataPorProveedor(resultPorProveedor);
    } catch (err) {
      console.error('❌ [useIncidenciasData] Error:', err);
      setError('Error al cargar los datos de incidencias');
      setData([]);
      setDataPorProveedor([]);
    } finally {
      setLoading(false);
    }
  }, [filters.tipoServicio, filters.proveedor, filters.mes, proveedores]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ============================================================ */
  /*  MEMOS PARA GRÁFICAS Y TOTALES                                */
  /* ============================================================ */

  const servicioChartData = useMemo<ServicioChartData[]>(() => {
    if (data.length === 0) return [];
    const map = new Map<string, { nombre: string; total: number; abiertas: number; cerradas: number }>();

    data.forEach((grupo) => {
      grupo.tickets.forEach((ticket) => {
        const nombre = ticket.servicioNombre || 'Servicio desconocido';
        if (!map.has(nombre)) {
          map.set(nombre, { nombre, total: 0, abiertas: 0, cerradas: 0 });
        }
        const entry = map.get(nombre)!;
        entry.total += 1;
        if (String(ticket.status).toLowerCase() === 'cerrado') entry.cerradas += 1;
        else entry.abiertas += 1;
      });
    });

    return Array.from(map.values())
      .map((v) => ({
        nombre: v.nombre.length > 25 ? `${v.nombre.substring(0, 25)}...` : v.nombre,
        total: v.total,
        abiertas: v.abiertas,
        cerradas: v.cerradas,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [data]);

  const tipoServicioChartData = useMemo<TipoServicioChartData[]>(
    () => data.map((item) => ({ name: item.tipoServicio, value: item.totalIncidencias })),
    [data],
  );

  const totalesPorProveedor = useMemo<IncidenciaTotales>(() => {
    if (!filters.proveedor) return { total: 0, abiertas: 0, cerradas: 0, servicios: 0 };
    const serviciosUnicos = new Set(dataPorProveedor.map((i) => i.servicioNombre));
    return {
      total: dataPorProveedor.length,
      abiertas: dataPorProveedor.filter((i) => i.status.toLowerCase() !== 'cerrado').length,
      cerradas: dataPorProveedor.filter((i) => i.status.toLowerCase() === 'cerrado').length,
      servicios: serviciosUnicos.size,
    };
  }, [dataPorProveedor, filters.proveedor]);

  const tipoServicioChartDataPorProveedor = useMemo<TipoServicioChartData[]>(() => {
    if (!filters.proveedor) return [];
    const map = new Map<string, number>();
    dataPorProveedor.forEach((item) => {
      map.set(item.tipoServicio, (map.get(item.tipoServicio) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dataPorProveedor, filters.proveedor]);

  const servicioChartDataPorProveedor = useMemo<ServicioChartData[]>(() => {
    if (!filters.proveedor) return [];
    const map = new Map<string, { nombre: string; total: number; abiertas: number; cerradas: number }>();

    dataPorProveedor.forEach((item) => {
      if (!map.has(item.servicioNombre)) {
        map.set(item.servicioNombre, { nombre: item.servicioNombre, total: 0, abiertas: 0, cerradas: 0 });
      }
      const entry = map.get(item.servicioNombre)!;
      entry.total += 1;
      if (item.status.toLowerCase() === 'cerrado') entry.cerradas += 1;
      else entry.abiertas += 1;
    });

    return Array.from(map.values())
      .map((v) => ({
        nombre: v.nombre.length > 20 ? `${v.nombre.substring(0, 20)}...` : v.nombre,
        total: v.total,
        abiertas: v.abiertas,
        cerradas: v.cerradas,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [dataPorProveedor, filters.proveedor]);

  const totales = useMemo<IncidenciaTotales>(
    () => ({
      total: data.reduce((sum, item) => sum + item.totalIncidencias, 0),
      abiertas: data.reduce((sum, item) => sum + item.abiertas, 0),
      cerradas: data.reduce((sum, item) => sum + item.cerradas, 0),
      servicios: data.reduce((sum, item) => sum + item.serviciosCount, 0),
    }),
    [data],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    filters,
    setFilters,
    data,
    dataPorProveedor,
    servicioChartData,
    tipoServicioChartData,
    servicioChartDataPorProveedor,
    tipoServicioChartDataPorProveedor,
    totalesPorProveedor,
    totales,
    loading,
    error,
    loadData,
    clearError,
    proveedores,
  };
};