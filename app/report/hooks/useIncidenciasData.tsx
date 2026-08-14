import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { getService, getTickets, getMiscellaneous } from '@/lib/api';
import { Service } from 'app/utils/types';
import duration from 'dayjs/plugin/duration'; // ✅ 1. Importar el plugin

dayjs.extend(duration); 
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

export const useIncidenciasData = (): UseIncidenciasDataReturn => {
  const [filters, setFilters] = useState<IncidenciaFilters>({
    tipoServicio: '',
    proveedor: '',
    mes: dayjs(),
  });
  const [data, setData] = useState<IncidenciaPorServicio[]>([]);
  const [dataPorProveedor, setDataPorProveedor] = useState<IncidenciaPorProveedor[]>([]); // ✅ NUEVO
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedores, setProveedores] = useState<any[]>([]);

  useEffect(() => {
    const loadProveedores = async () => {
      try {
        const res = await getMiscellaneous({ categoria: 'PROVEEDOR', limit: 9999 });
        const proveedoresData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        setProveedores(proveedoresData);
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

      const services: Service[] = servicesRes?.data?.data ?? [];
      const allTickets: any[] = ticketsRes?.data?.data ?? [];
      const causasMap = new Map<string, string>();
      const causasData = Array.isArray(causasRes?.data) ? causasRes.data : (Array.isArray(causasRes?.data?.data) ? causasRes.data.data : []);
      causasData.forEach((c: any) => causasMap.set(c._id, c.valor));

      const solucionesMap = new Map<string, string>();
      const solucionesData = Array.isArray(solucionesRes?.data) ? solucionesRes.data : (Array.isArray(solucionesRes?.data?.data) ? solucionesRes.data.data : []);
      solucionesData.forEach((s: any) => solucionesMap.set(s._id, s.valor));

      const tickets = allTickets.filter((ticket) =>
        dayjs(ticket.createdAt).isSame(filters.mes, 'month'),
      );

      const serviceMap = new Map<string, Service>();
      services.forEach((service) => serviceMap.set(String(service._id), service));

      const proveedoresMap = new Map<string, string>();
      proveedores.forEach((p) => {
        proveedoresMap.set(p._id, p.valor);
      });

      const incidenciasPorProveedorMap = new Map<string, IncidenciaPorProveedor>();
      const servicioMap = new Map<string, any>();
      const tipoMap = new Map<string, any>();

      tickets.forEach((ticket) => {
        const afectados = Array.isArray(ticket.serviciosAfectados)
          ? ticket.serviciosAfectados
          : [];

        afectados.forEach((item: any) => {
          const id = typeof item === 'string' ? item : String(item?._id ?? '');
          if (!id) return;

          const servicio = typeof item === 'object' && item !== null ? item : serviceMap.get(id);
          const tipoServicio = servicio?.tipoServicio || 'N/A';
          const servicioNombre = servicio?.name || servicio?.id_circuito || 'Servicio desconocido';
          const proveedorId = String(servicio?.proveedorDelServicioCompartido || servicio?.ultimaMilla || '');
          const proveedorNombre = proveedoresMap.get(proveedorId) || 'Sin proveedor';
          const causaRaizId = ticket.causaRaiz;
          const solucionId = ticket.SolucionCaso || ticket.solucionCaso; // Maneja ambas posibles mayúsculas
          const causaRaizNombre = causaRaizId ? (causasMap.get(causaRaizId) || causaRaizId) : 'Sin especificar';
          const solucionNombre = solucionId ? (solucionesMap.get(solucionId) || solucionId) : 'Sin especificar';

           let duracionAfectacion = 'N/A';
          if (ticket.horaInicioFalla && ticket.horaFinAfectacion) {
            const inicio = dayjs(ticket.horaInicioFalla);
            const fin = dayjs(ticket.horaFinAfectacion);
            
            if (inicio.isValid() && fin.isValid()) {
              const diffMs = fin.diff(inicio); // Diferencia en milisegundos
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHours / 24);
              
              const hoursRemaining = diffHours % 24;
              const minsRemaining = diffMins % 60;
              
              if (diffDays > 0) {
                duracionAfectacion = `${diffDays}d ${hoursRemaining}h ${minsRemaining}min`;
              } else if (diffHours > 0) {
                duracionAfectacion = `${diffHours}h ${minsRemaining}min`;
              } else {
                duracionAfectacion = `${diffMins}min`;
              }
            }
          }


        
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

          //  a vista por proveedor (clave única por ticket + servicio)
          const key = `${ticket._id}-${id}`;
          if (!incidenciasPorProveedorMap.has(key)) {
            incidenciasPorProveedorMap.set(key, {
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
               duracionAfectacion: duracionAfectacion, 
              causaRaiz: causaRaizNombre,
              solucionCaso: solucionNombre,
              status: ticket.status || 'N/A',
              createdAt: ticket.createdAt,
            });
          }

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

      let result: IncidenciaPorServicio[] = Array.from(tipoMap.entries()).map(
        ([tipoServicio, value]) => ({
          tipoServicio,
          servicioId: value.servicioId ?? '',
          servicioNombre: value.servicioNombre ?? '',
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

      // Si hay filtro de proveedor, también filtramos la vista agrupada
      if (filters.proveedor) {
        result = result.filter((item) => {
          return item.tickets.some((ticket) => {
            const proveedorId = ticket.proveedorDelServicioCompartido || ticket.ultimaMilla;
            return proveedorId === filters.proveedor;
          });
        });
      }

      result.sort((a, b) => b.totalIncidencias - a.totalIncidencias);
      setData(result);

      // ✅ 2. Procesar datos detallados por proveedor (Vista al seleccionar proveedor)
      let resultPorProveedor = Array.from(incidenciasPorProveedorMap.values());

      if (filters.proveedor) {
        const proveedorNombreFiltro = proveedores.find(p => p._id === filters.proveedor)?.valor?.toLowerCase() || '';
        resultPorProveedor = resultPorProveedor.filter(
          (item) => item.proveedorNombre.toLowerCase().includes(proveedorNombreFiltro)
        );
      }

      // Ordenar por fecha de creación (más reciente primero)
      resultPorProveedor.sort((a, b) =>
        dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      );

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

    const servicioChartData = useMemo<ServicioChartData[]>(() => {
    if (data.length === 0) return [];

    // Agrupar todos los tickets de los grupos por servicio individual
    const servicioMap = new Map<string, { nombre: string; total: number; abiertas: number; cerradas: number }>();

    data.forEach((grupo) => {
      grupo.tickets.forEach((ticket) => {
        const nombreServicio = ticket.servicioNombre || 'Servicio desconocido';

        if (!servicioMap.has(nombreServicio)) {
          servicioMap.set(nombreServicio, { nombre: nombreServicio, total: 0, abiertas: 0, cerradas: 0 });
        }

        const entry = servicioMap.get(nombreServicio)!;
        entry.total += 1;

        if (String(ticket.status).toLowerCase() === 'cerrado') {
          entry.cerradas += 1;
        } else {
          entry.abiertas += 1;
        }
      });
    });

    // Truncar nombres largos y ordenar por incidencia (top 10, igual que la vista por proveedor)
    return Array.from(servicioMap.values())
      .map((v) => ({
        nombre: v.nombre.length > 25 ? `${v.nombre.substring(0, 25)}...` : v.nombre,
        total: v.total,
        abiertas: v.abiertas,
        cerradas: v.cerradas,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [data]);

  const tipoServicioChartData = useMemo<TipoServicioChartData[]>(() => {
    return data.map(item => ({ name: item.tipoServicio, value: item.totalIncidencias }));
  }, [data]);

   // ✅ NUEVO: Totales para la vista por proveedor
  const totalesPorProveedor = useMemo<IncidenciaTotales>(() => {
    if (!filters.proveedor) return { total: 0, abiertas: 0, cerradas: 0, servicios: 0 };
    
    const serviciosUnicos = new Set(dataPorProveedor.map(item => item.servicioNombre));
    
    return {
      total: dataPorProveedor.length,
      abiertas: dataPorProveedor.filter(item => item.status.toLowerCase() !== 'cerrado').length,
      cerradas: dataPorProveedor.filter(item => item.status.toLowerCase() === 'cerrado').length,
      servicios: serviciosUnicos.size,
    };
  }, [dataPorProveedor, filters.proveedor]);

  const tipoServicioChartDataPorProveedor = useMemo<TipoServicioChartData[]>(() => {
    if (!filters.proveedor) return [];
    const tipoMap = new Map<string, number>();
    dataPorProveedor.forEach((item) => {
      tipoMap.set(item.tipoServicio, (tipoMap.get(item.tipoServicio) || 0) + 1);
    });
    return Array.from(tipoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dataPorProveedor, filters.proveedor]);
  const servicioChartDataPorProveedor = useMemo<ServicioChartData[]>(() => {
    if (!filters.proveedor) return [];
    const servicioMap = new Map<string, { nombre: string; total: number; abiertas: number; cerradas: number }>();
    
    dataPorProveedor.forEach((item) => {
      if (!servicioMap.has(item.servicioNombre)) {
        servicioMap.set(item.servicioNombre, { nombre: item.servicioNombre, total: 0, abiertas: 0, cerradas: 0 });
      }
      const entry = servicioMap.get(item.servicioNombre)!;
      entry.total += 1;
      if (item.status.toLowerCase() === 'cerrado') {
        entry.cerradas += 1;
      } else {
        entry.abiertas += 1;
      }
    });

    return Array.from(servicioMap.values())
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
    dataPorProveedor, // ✅ NUEVO
    servicioChartData,
    tipoServicioChartData,
    totales,
    loading,
    error,
    loadData,
    clearError,
    proveedores, // ✅ NUEVO
    servicioChartDataPorProveedor,
    tipoServicioChartDataPorProveedor,
    totalesPorProveedor,
  };
};