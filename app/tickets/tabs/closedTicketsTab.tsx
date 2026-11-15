"use client";
import React, { useState, useEffect, useCallback } from "react";
import CustomDataGrid, { SearchParams } from "../../components/customDataGrid";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { getTickets, getUsers, getMiscellaneous } from "@/lib/api"; // ✅ IMPORT CORREGIDO
import { Pagination, Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";

const corporateFont = 'Calibri, Arial, sans-serif';

const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

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
  if (Array.isArray(value)) {
    const nombres = value.map((v: any) => (typeof v === 'object' ? (v.valor || v.name || '') : '')).filter(Boolean);
    return nombres.length > 0 ? nombres.join(', ') : 'Sin especificar';
  }
  if (typeof value === 'object' && value !== null) return value.valor || value.name || value.nombre || 'Sin especificar';
  if (typeof value === 'string') return (value.length === 24 && /^[a-f0-9]+$/i.test(value)) ? 'Sin especificar' : value;
  return 'Sin especificar';
};

const getTicketPriority = (ticket: any): number => {
  const incidentType = (ticket.incidentType || '').toUpperCase();
  const tipoClienteValor = getTipoClienteValor(ticket.tipoCliente).toUpperCase();
  if (incidentType.includes('MASIVA')) return 1;
  if (tipoClienteValor.includes('CARRIER')) return 2;
  if (tipoClienteValor.includes('BANCA')) return 3;
  if (tipoClienteValor.includes('CORPORATIVO')) return 4;
  return 5;
};

const resolveResponsable = (ticket: any, usersMap: Record<string, string>): string => {
  const raw = ticket?.operatorResponsable || ticket?.operatorAsignado || ticket?.operador;
  if (!raw) return 'Sin asignar';
  if (typeof raw === 'object') return `${raw.primerNombre || ''} ${raw.primerApellido || ''}`.trim() || raw.username || 'Sin asignar';
  return usersMap[String(raw)] || 'Sin asignar';
};

export default function ClosedTicketsTab({ 
  onCellClick, onCountChange 
}: { 
  onCellClick: (params: GridCellParams) => void;
  onCountChange: (count: number) => void;
}) {
  const [tickets, setTickets] = useState<Pagination<Tickets[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ page: 0, pageSize: 10 });
  const [searchParams, setSearchParams] = useState<SearchParams>({ field: "caseNumber", value: "" });
  
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [operatorOptions, setOperatorOptions] = useState<{ value: string; label: string }[]>([]);
  const [tipoClienteOptions, setTipoClienteOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, tcRes] = await Promise.all([
          getUsers({ isActive: true }),
          getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 999 })
        ]);

        const userList = Array.isArray(usersRes.data?.data) ? usersRes.data.data : Array.isArray(usersRes.data) ? usersRes.data : [];
        const map: Record<string, string> = {};
        const ops: { value: string; label: string }[] = [];
        userList.forEach((u: any) => {
          const name = `${u.primerNombre || ''} ${u.primerApellido || ''}`.trim() || u.username || u._id;
          map[u._id] = name;
          ops.push({ value: u._id, label: name });
        });
        setUsersMap(map);
        setOperatorOptions(ops);

        const tcRaw = tcRes?.data;
        const tcList = Array.isArray(tcRaw?.data) ? tcRaw.data : Array.isArray(tcRaw) ? tcRaw : [];
        setTipoClienteOptions(tcList.filter((t: any) => t.activo !== false).map((t: any) => ({ value: t._id, label: t.valor })));
      } catch (error) {
        console.error('❌ Error cargando datos de filtro:', error);
      }
    };
    loadData();
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page.page + 1,
        limit: page.pageSize,
        status: TICKET_STATUS.CERRADO,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      // ✅ MAPEO CORRECTO: horaInicioFalla → fechaInicioFalla con formato ISO
      if (searchParams.value) {
        switch (searchParams.field) {
          case 'caseNumber':
            params.caseNumber = searchParams.value;
            break;
          case 'subject':
            params.subject = searchParams.value;
            break;
          case 'horaInicioFalla':
            // ✅ Convertir DD-MM-YYYY o DD/MM/YYYY a YYYY-MM-DD
            const fecha = searchParams.value;
            if (fecha) {
              // Si viene como "12-11-2026" (DD-MM-YYYY) o "12/11/2026" (DD/MM/YYYY)
              const partes = fecha.split(/[-\/]/);
              if (partes.length === 3) {
                if (partes[0].length === 4) {
                  // Ya es YYYY-MM-DD
                  params.fechaInicioFalla = fecha;
                } else {
                  // Es DD-MM-YYYY → convertir a YYYY-MM-DD
                  params.fechaInicioFalla = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                }
              } else {
                params.fechaInicioFalla = fecha;
              }
            }
            break;
          case 'tipoCliente':
            params.tipoCliente = searchParams.value;
            break;
          case 'operatorResponsable':
            params.operatorId = searchParams.value;
            break;
          case 'incidentType':
            params.incidentType = searchParams.value;
            break;
          default:
            params[searchParams.field] = searchParams.value;
        }
      }

      const response = await getTickets(params);
      let filteredData = response.data?.data || [];
      const currentTotal = response.data?.total || 0;

      filteredData.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.horaInicioFalla || 0).getTime();
        const dateB = new Date(b.createdAt || b.horaInicioFalla || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return getTicketPriority(a) - getTicketPriority(b);
      });
      
      setTickets(response.data);
      onCountChange(currentTotal);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [page.page, page.pageSize, searchParams, onCountChange]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSearch = useCallback((params: SearchParams) => {
    setSearchParams((prev) => {
      if (prev.field === params.field && prev.value === params.value) return prev;
      setPage({ page: 0, pageSize: 10 });
      return params;
    });
  }, []);

  const handlePagination = (model: { page: number; pageSize: number }) => setPage(model);

  const columns: GridColDef[] = [
    { field: "caseNumber", headerName: "Tickets", flex: 1, minWidth: 120 },
    { field: "subject", headerName: "Asunto de Caso", flex: 2, minWidth: 250 },
    {
      field: "horaInicioFalla",
      headerName: "Fecha Inicio Incidencia",
      flex: 1.2, minWidth: 170,
      valueGetter: (_value, row: any) => row?.horaInicioFalla || row?.createdAt || '',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: corporateFont, fontWeight: 500, color: params.value ? '#0f172a' : '#94a3b8' }}>
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'tipoCliente', headerName: 'Tipo de Cliente', width: 160,
      renderCell: (params: any) => {
        const tipoClienteValor = getTipoClienteValor(params.value);
        const incidentType = params.row.incidentType || '';
        if (tipoClienteValor !== 'Sin especificar') {
          const colors = getColorByTipoCliente(tipoClienteValor);
          return <Chip label={tipoClienteValor} size="small" sx={{ bgcolor: colors.bgcolor, color: colors.color, fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', height: '26px', border: `1px solid ${colors.bgcolor}`, boxShadow: 'none' }} />;
        }
        if (!incidentType.toUpperCase().includes('PUNTUAL')) {
          const colors = getColorByTipoIncidencia(incidentType);
          return <Chip label={incidentType} size="small" sx={{ bgcolor: colors.bgcolor, color: colors.color, fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', height: '26px', border: `1px solid ${colors.bgcolor}`, boxShadow: 'none' }} />;
        }
        return <Chip label="Sin especificar" size="small" sx={{ bgcolor: '#f1f5f9', color: '#94a3b8', fontWeight: 500, borderRadius: '6px', fontSize: '0.72rem', height: '26px', border: '1px solid #e2e8f0', boxShadow: 'none' }} />;
      },
    },
    {
      field: "operatorResponsable", headerName: "Responsable", flex: 1.5, minWidth: 200,
      valueGetter: (_value, row: any) => resolveResponsable(row, usersMap),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <PersonIcon sx={{ fontSize: '1rem', color: '#64748b' }} />
          <Typography variant="body2" sx={{ fontFamily: corporateFont, fontWeight: 600, color: '#0f172a' }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "status", headerName: "Estado", flex: 1, minWidth: 140, align: "center", headerAlign: "center",
      renderCell: () => (
        <Chip label="CERRADO" size="small" sx={{ bgcolor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontWeight: "bold", borderRadius: "6px", px: 0.5, fontFamily: corporateFont, boxShadow: 'none' }} />
      ),
    },
  ];

  return (
    <Box sx={{ "& .MuiDataGrid-row": { cursor: "pointer", transition: "background-color 0.15s ease" }, "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" } }}>
      <CustomDataGrid
        rows={tickets?.data || []} 
        columns={columns} 
        loading={loading} 
        onCellClick={onCellClick}
        paginationModel={page} 
        onPaginationModelChange={handlePagination} 
        pageSizeOptions={[10, 50, 100]}
        paginationMode="server" 
        rowCount={tickets?.total || 0} 
        onSearch={handleSearch} 
        debounceMs={400}
        excludeSearchFields={['status']}
        dateSearchFields={['horaInicioFalla']}
        filterOptions={{
          tipoCliente: tipoClienteOptions,
          operatorResponsable: operatorOptions,
        }}
      />
    </Box>
  );
}