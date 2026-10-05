"use client";
import React, { useState, useEffect, useCallback } from "react";
import CustomDataGrid, { SearchParams } from "../../components/customDataGrid";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box } from "@mui/material";
import { getTickets, getUsers } from "@/lib/api";
import { Pagination, Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";

// ... (Mantén tus funciones de color y prioridad igual que antes) ...
const getColorByTipoIncidencia = (tipoIncidencia: string): { bgcolor: string; color: string } => {
  const tipoUpper = (tipoIncidencia || '').toUpperCase();
  if (tipoUpper.includes('MASIVA')) return { bgcolor: '#fee2e2', color: '#991b1b' };
  if (tipoUpper.includes('MANTENIMIENTO') || tipoUpper.includes('VENTANA')) return { bgcolor: '#dbeafe', color: '#1e40af' };
  if (tipoUpper.includes('PUNTUAL')) return { bgcolor: '#f1f5f9', color: '#475569' };
  return { bgcolor: '#f8fafc', color: '#64748b' };
};

const getColorByTipoCliente = (tipoCliente: string): { bgcolor: string; color: string } => {
  const tipoUpper = (tipoCliente || '').toUpperCase();
  if (tipoUpper.includes('RESIDENCIAL')) return { bgcolor: '#dcfce7', color: '#166534' };
  if (tipoUpper.includes('CARRIER')) return { bgcolor: '#ffedd5', color: '#9a3412' };
  if (tipoUpper.includes('BANCA')) return { bgcolor: '#f3e8ff', color: '#6b21a8' };
  if (tipoUpper.includes('CORPORATIVO')) return { bgcolor: '#e0f2fe', color: '#075985' };
  return { bgcolor: '#f1f5f9', color: '#64748b' };
};

const getTipoClienteValor = (value: any): string => {
  if (!value) return 'Sin especificar';
  if (typeof value === 'object' && value !== null) return value.valor || value.name || value.nombre || 'Sin especificar';
  if (typeof value === 'string') {
    if (value.length === 24 && /^[a-f0-9]+$/i.test(value)) return 'Sin especificar';
    return value;
  }
  return 'Sin especificar';
};

const getTicketPriority = (ticket: any): number => {
  const status = ticket.status;
  const incidentType = (ticket.incidentType || '').toUpperCase();
  const tipoClienteValor = getTipoClienteValor(ticket.tipoCliente).toUpperCase();
  if (status === TICKET_STATUS.EN_GESTION) return 1;
  if (incidentType.includes('MASIVA')) return 2;
  if (tipoClienteValor.includes('CARRIER')) return 3;
  if (tipoClienteValor.includes('CORPORATIVO')) return 4;
  return 5;
};

// ... (Mantén tu array `columns` igual que antes) ...
const columns: GridColDef[] = [
  {
    field: 'tipoCliente',
    headerName: 'Tipo de Cliente',
    width: 160,
    renderCell: (params: any) => {
      const tipoClienteValor = getTipoClienteValor(params.value);
      const incidentType = params.row.incidentType || '';
      const incidentUpper = incidentType.toUpperCase();
      const esCategoriaCritica = incidentUpper.includes('MASIVA') || incidentUpper.includes('MANTENIMIENTO') || incidentUpper.includes('VENTANA');

      if (esCategoriaCritica) {
        const colors = getColorByTipoIncidencia(incidentType);
        return <Chip label={incidentType} size="small" sx={{ bgcolor: colors.bgcolor, color: colors.color, fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', height: '26px', border: `1px solid ${colors.bgcolor}`, boxShadow: 'none' }} />;
      }
      if (tipoClienteValor !== 'Sin especificar') {
        const colors = getColorByTipoCliente(tipoClienteValor);
        return <Chip label={tipoClienteValor} size="small" sx={{ bgcolor: colors.bgcolor, color: colors.color, fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', height: '26px', border: `1px solid ${colors.bgcolor}`, boxShadow: 'none' }} />;
      }
      return <Chip label="Sin especificar" size="small" sx={{ bgcolor: '#f1f5f9', color: '#94a3b8', fontWeight: 500, borderRadius: '6px', fontSize: '0.72rem', height: '26px', border: '1px solid #e2e8f0', boxShadow: 'none' }} />;
    },
  },
  { field: "caseNumber", headerName: "Tickets", flex: 1, minWidth: 120 },
  { field: "subject", headerName: "Asunto de Caso", flex: 2, minWidth: 250 },
  {
    field: "operatorResponsable",
    headerName: "Responsable", 
    flex: 1.5,
    minWidth: 200,
    renderCell: (params: any) => {
      const resp = params.value;
      if (!resp) return <span style={{ color: '#94a3b8' }}>Sin asignar</span>;
      if (typeof resp === 'object' && resp !== null) {
        const nombre = `${resp.primerNombre || ''} ${resp.primerApellido || ''}`.trim();
        return nombre || resp.username || resp.email || 'Sin asignar';
      }
      return String(resp);
    },
  },
  {
    field: "status",
    headerName: "Estado",
    flex: 1,
    minWidth: 140,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const valor = params.value;
      const Translations: Record<string, any> = {
        [TICKET_STATUS.EN_GESTION]: { labelText: "EN GESTIÓN", bgcolor: "#fffbeb", color: "#92400e", border: "#fde68a" },
        [TICKET_STATUS.ACTIVO]: { labelText: "ACTIVO", bgcolor: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
        [TICKET_STATUS.CERRADO]: { labelText: "CERRADO", bgcolor: "#fef2f2", color: "#991b1b", border: "#fecaca" },
        ["default"]: { labelText: valor, bgcolor: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
      };
      const config = Translations[valor] || Translations["default"];
      return <Chip label={config.labelText} size="small" sx={{ bgcolor: config.bgcolor, color: config.color, border: `1px solid ${config.border}`, fontWeight: "bold", borderRadius: "6px", px: 0.5, boxShadow: 'none' }} />;
    },
  },
];

export default function ActiveTicketsTab({
  onCellClick,
  onCountChange
}: {
  onCellClick: (params: GridCellParams) => void;
  onCountChange: (count: number) => void;
}) {
  const [tickets, setTickets] = useState<Pagination<Tickets[]> | null>(null);
  const [page, setPage] = useState({ page: 0, pageSize: 10 });
  const [searchParams, setSearchParams] = useState<SearchParams>({ field: "caseNumber", value: "" });
  const [operatorOptions, setOperatorOptions] = useState<{ value: string; label: string }[]>([]);
  const [tipoClienteOptions, setTipoClienteOptions] = useState<{ value: string; label: string }[]>([]);

  // Cargar operadores
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await getUsers({ isActive: true, limit: 1000 });
        const users = response.data?.data || [];
        const options = users
          .map((user: any) => ({
            value: user._id,
            label: `${user.primerNombre || ''} ${user.primerApellido || ''}`.trim() || user.username || user.email || 'Sin nombre'
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        setOperatorOptions(options);
      } catch (error) {
        console.error('❌ Error fetching operators:', error);
      }
    };
    fetchOperators();
  }, []);

  // ✅ Cargar opciones de Tipo de Cliente para el dropdown
   useEffect(() => {
    const fetchTipoClientes = async () => {
      try {
        const response = await getTickets({ limit: 1000, status: `${TICKET_STATUS.ACTIVO},${TICKET_STATUS.EN_GESTION}` });
        const data = response.data?.data || [];
        const uniqueTypes = new Map<string, string>();
        
        // ✅ NORMALIZAR: Solo una opción para mantenimiento/ventana
        data.forEach((ticket: any) => {
          const incidentType = (ticket.incidentType || '').toUpperCase();
          const tc = ticket.tipoCliente;
          
          // Si es FALLA MASIVA, VENTANA o MANTENIMIENTO, usar incidentType
          if (incidentType.includes('MASIVA') || incidentType.includes('VENTANA') || incidentType.includes('MANTENIMIENTO')) {
            const normalizedKey = incidentType.includes('MASIVA') ? 'FALLA MASIVA' : 
                                 (incidentType.includes('VENTANA') || incidentType.includes('MANTENIMIENTO')) ? 'VENTANA DE MANTENIMIENTO' : incidentType;
            if (!uniqueTypes.has(normalizedKey)) {
              uniqueTypes.set(normalizedKey, normalizedKey);
            }
          } else if (tc && typeof tc === 'object') {
            const id = tc._id || tc.id;
            const name = tc.valor || tc.name || tc.nombre || 'Sin nombre';
            if (id && !uniqueTypes.has(id)) uniqueTypes.set(id, name);
          }
        });
        
        setTipoClienteOptions(
          Array.from(uniqueTypes.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      } catch (error) {
        console.error('❌ Error fetching tipo clientes:', error);
      }
    };
    fetchTipoClientes();
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const params: Record<string, any> = {
        page: page.page + 1,
        limit: page.pageSize,
        status: `${TICKET_STATUS.ACTIVO},${TICKET_STATUS.EN_GESTION}`,
      };

      if (searchParams.value) {
        console.log('🚀 [fetchTickets] Aplicando filtro:', searchParams.field, '=', searchParams.value);
        
        if (searchParams.field === 'operatorResponsable' || searchParams.field === 'operatorAsignado' || searchParams.field === 'operador') {
          params.operatorId = searchParams.value;
        } else if (searchParams.field === 'tipoCliente') {
          const isObjectId = /^[0-9a-fA-F]{24}$/.test(searchParams.value);
          if (isObjectId) {
            params.tipoCliente = searchParams.value;
          } else {
            const searchUpper = searchParams.value.toUpperCase();
            const esCategoriaCritica = searchUpper.includes('MASIVA') || searchUpper.includes('MANTENIMIENTO') || searchUpper.includes('VENTANA');
            if (esCategoriaCritica) {
              params.incidentType = searchParams.value;
            } else {
              params.tipoCliente = searchParams.value;
            }
          }
        } else {
          params[searchParams.field] = searchParams.value;
        }
      }

      console.log('📡 [fetchTickets] Enviando params al backend:', params);
      const response = await getTickets(params);
      const data = response.data?.data || [];
      
      const filteredData = data.filter((t: any) => 
        t.status === TICKET_STATUS.ACTIVO || t.status === TICKET_STATUS.EN_GESTION
      );

      filteredData.sort((a: any, b: any) => {
        const priorityA = getTicketPriority(a);
        const priorityB = getTicketPriority(b);
        if (priorityA === priorityB) return 0;
        return priorityA - priorityB;
      });

      const correctCount = response.data?.total || 0;
      setTickets({ ...response.data, data: filteredData, total: correctCount });
      onCountChange(correctCount);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      onCountChange(0);
    }
  }, [page.page, page.pageSize, searchParams.field, searchParams.value, onCountChange]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearch = useCallback((params: SearchParams) => {
    console.log('🔍 [handleSearch] Parámetros recibidos del DataGrid:', params);
    setSearchParams((prev) => {
      if (prev.field === params.field && prev.value === params.value) return prev;
      setPage({ page: 0, pageSize: 10 });
      return params;
    });
  }, []);

  const handlePagination = useCallback((model: { page: number; pageSize: number }) => {
    setPage(model);
  }, []);

  return (
    <Box sx={{ "& .MuiDataGrid-row": { cursor: "pointer", transition: "background-color 0.15s ease" }, "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" } }}>
      <CustomDataGrid
        rows={tickets?.data || []}
        columns={columns}
        onCellClick={onCellClick}
        paginationModel={page}
        onPaginationModelChange={handlePagination}
        pageSizeOptions={[10, 50, 100]}
        paginationMode="server"
        rowCount={tickets?.total || 0}
        onSearch={handleSearch}
        debounceMs={400}
        filterOptions={{
          operatorResponsable: operatorOptions,
          tipoCliente: tipoClienteOptions, // ✅ PASAMOS LAS OPCIONES EXPLÍCITAMENTE
        }}
      />
    </Box>
  );
}