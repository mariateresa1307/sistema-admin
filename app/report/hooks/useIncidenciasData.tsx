import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { getService, getTickets } from '@/lib/api';
import { Service } from 'app/utils/types';

// ✅ Tipo para la tabla (agrupado por tipo)
export interface IncidenciaPorServicio {
  tipoServicio: string;
  totalIncidencias: number;
  abiertas: number;
  cerradas: number;
  ultimaIncidencia: string;
  serviciosCount: number;
  tickets: TicketAsociado[];
}

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

export interface IncidenciaTotales {
  total: number;
  abiertas: number;
  cerradas: number;
  servicios: number;
}

// ✅ Tipo para gráfico de barras (por nombre de servicio)
export interface ServicioChartData {
  nombre: string;
  total: number;
  abiertas: number;
  cerradas: number;
}

// ✅ Tipo para gráfico de torta (por tipo de servicio)
export interface TipoServicioChartData {
  name: string;
  value: number;
}

interface IncidenciaFilters {
  tipoServicio: string;
  mes: Dayjs;
}

interface UseIncidenciasDataReturn {
  filters: IncidenciaFilters;
  setFilters: React.Dispatch<React.SetStateAction<IncidenciaFilters>>;
  data: IncidenciaPorServicio[];
  servicioChartData: ServicioChartData[];
  tipoServicioChartData: TipoServicioChartData[];
  totales: IncidenciaTotales;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  clearError: () => void;
}

export const useIncidenciasData = (): UseIncidenciasDataReturn => {
  const [filters, setFilters] = useState<IncidenciaFilters>({
    tipoServicio: '',
    mes: dayjs(),
  });
  const [data, setData] = useState<IncidenciaPorServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [servicesRes, ticketsRes] = await Promise.all([
        getService({ limit: 9999 }),
        getTickets({ limit: 9999 }),
      ]);

      const services: Service[] = servicesRes?.data?.data ?? [];
      const allTickets: any[] = ticketsRes?.data?.data ?? [];

      const tickets = allTickets.filter((ticket) =>
        dayjs(ticket.createdAt).isSame(filters.mes, 'month'),
      );

      const serviceMap = new Map<string, Service>();
      services.forEach((service) => serviceMap.set(String(service._id), service));

      // ✅ Agrupar por SERVICIO INDIVIDUAL (para gráfico de barras)
      const servicioMap = new Map<string, {
        nombre: string;
        tipoServicio: string;
        tickets: TicketAsociado[];
        totalIncidencias: number;
        abiertas: number;
        cerradas: number;
        ultimaIncidencia: string;
      }>();

      // ✅ Agrupar por TIPO DE SERVICIO (para gráfico de torta y tabla)
      const tipoMap = new Map<string, {
        tickets: TicketAsociado[];
        serviciosSet: Set<string>;
        totalIncidencias: number;
        abiertas: number;
        cerradas: number;
        ultimaIncidencia: string;
      }>();

      tickets.forEach((ticket) => {
        const afectados = Array.isArray(ticket.serviciosAfectados)
          ? ticket.serviciosAfectados
          : [];

        afectados.forEach((item: any) => {
          const id = typeof item === 'string' ? item : String(item?._id ?? '');
          if (!id) return;

          const servicio = typeof item === 'object' && item !== null
            ? item
            : serviceMap.get(id);

          const tipoServicio = servicio?.tipoServicio || 'N/A';
          const servicioNombre = servicio?.name || servicio?.id_circuito || 'Servicio desconocido';

          // ✅ NUEVO: Resumen del ticket con campos técnicos del servicio afectado
          const ticketResumen: TicketAsociado = {
            _id: String(ticket._id ?? ''),
            caseNumber: ticket.caseNumber || 'S/N',
            subject: ticket.subject || 'Sin asunto',
            status: ticket.status || 'N/A',
            createdAt: ticket.createdAt,
            incidentType: ticket.incidentType || 'Sin Clasificar',
            servicioNombre,
            // ✅ Campos técnicos del servicio afectado (necesarios para el modal de detalle)
            tipoServicio,
            id_circuito: servicio?.id_circuito,
            id_netuno: servicio?.id_netuno,
            contrato: servicio?.contrato,
            ultimaMilla: servicio?.ultimaMilla,
            proveedorDelServicioCompartido: servicio?.proveedorDelServicioCompartido,
          };

          // ✅ Agrupar por servicio individual
          if (!servicioMap.has(id)) {
            servicioMap.set(id, {
              nombre: servicioNombre,
              tipoServicio,
              tickets: [],
              totalIncidencias: 0,
              abiertas: 0,
              cerradas: 0,
              ultimaIncidencia: ticket.createdAt,
            });
          }

          const servicioEntry = servicioMap.get(id)!;
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

          // ✅ Agrupar por tipo de servicio
          if (!tipoMap.has(tipoServicio)) {
            tipoMap.set(tipoServicio, {
              tickets: [],
              serviciosSet: new Set(),
              totalIncidencias: 0,
              abiertas: 0,
              cerradas: 0,
              ultimaIncidencia: ticket.createdAt,
            });
          }

          const tipoEntry = tipoMap.get(tipoServicio)!;
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

      // ✅ Datos para la tabla (agrupado por tipo)
      let result: IncidenciaPorServicio[] = Array.from(tipoMap.entries()).map(
        ([tipoServicio, value]) => ({
          tipoServicio,
          totalIncidencias: value.totalIncidencias,
          abiertas: value.abiertas,
          cerradas: value.cerradas,
          ultimaIncidencia: value.ultimaIncidencia,
          serviciosCount: value.serviciosSet.size,
          tickets: value.tickets,
        })
      );

      if (filters.tipoServicio) {
        result = result.filter((item) => item.tipoServicio === filters.tipoServicio);
      }

      result.sort((a, b) => b.totalIncidencias - a.totalIncidencias);
      setData(result);

      // ✅ Guardar datos para gráficos en variables temporales (se procesan en useMemo)
      (window as any).__servicioMapTemp = servicioMap;
      (window as any).__tipoMapTemp = tipoMap;
    } catch (err) {
      console.error('❌ [useIncidenciasData] Error:', err);
      setError('Error al cargar los datos de incidencias');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.tipoServicio, filters.mes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ Datos para gráfico de barras (Top servicios individuales)
  const servicioChartData = useMemo<ServicioChartData[]>(() => {
    const servicioMap = (window as any).__servicioMapTemp as Map<string, any> | undefined;
    if (!servicioMap) return [];

    return Array.from(servicioMap.entries())
      .map(([_, value]) => ({
        nombre: value.nombre.length > 20
          ? `${value.nombre.substring(0, 20)}...`
          : value.nombre,
        total: value.totalIncidencias,
        abiertas: value.abiertas,
        cerradas: value.cerradas,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [data]);

  // ✅ Datos para gráfico de torta (por tipo de servicio)
  const tipoServicioChartData = useMemo<TipoServicioChartData[]>(() => {
    const tipoMap = (window as any).__tipoMapTemp as Map<string, any> | undefined;
    if (!tipoMap) return [];

    return Array.from(tipoMap.entries())
      .map(([name, value]) => ({ name, value: value.totalIncidencias }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

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
    servicioChartData,
    tipoServicioChartData,
    totales,
    loading,
    error,
    loadData,
    clearError,
  };
};