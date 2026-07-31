"use client";
import React, { useState, useEffect, useCallback } from "react";
import CustomDataGrid, { SearchParams } from "../../components/customDataGrid";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box } from "@mui/material";
import { getTickets } from "@/lib/api";
import { Pagination, Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";

const corporateFont = 'Calibri, Arial, sans-serif';

// ✅ PALETA ARMONIZADA - Fondos suaves con texto oscuro
const getColorByTipoIncidencia = (tipoIncidencia: string): { bgcolor: string; color: string } => {
  const tipoUpper = (tipoIncidencia || '').toUpperCase();
  
  if (tipoUpper.includes('MASIVA')) {
    return { bgcolor: '#fee2e2', color: '#991b1b' };
  }
  if (tipoUpper.includes('MANTENIMIENTO') || tipoUpper.includes('VENTANA')) {
    return { bgcolor: '#dbeafe', color: '#1e40af' };
  }
  if (tipoUpper.includes('PUNTUAL')) {
    return { bgcolor: '#f1f5f9', color: '#475569' };
  }
  return { bgcolor: '#f8fafc', color: '#64748b' };
};

// ✅ PALETA ARMONIZADA PARA TIPO DE CLIENTE
const getColorByTipoCliente = (tipoCliente: string): { bgcolor: string; color: string } => {
  const tipoUpper = (tipoCliente || '').toUpperCase();
  
  if (tipoUpper.includes('RESIDENCIAL')) {
    return { bgcolor: '#dcfce7', color: '#166534' };
  }
  if (tipoUpper.includes('CARRIER')) {
    return { bgcolor: '#ffedd5', color: '#9a3412' };
  }
  if (tipoUpper.includes('BANCA')) {
    return { bgcolor: '#f3e8ff', color: '#6b21a8' };
  }
  if (tipoUpper.includes('CORPORATIVO')) {
    return { bgcolor: '#e0f2fe', color: '#075985' };
  }
  return { bgcolor: '#f1f5f9', color: '#64748b' };
};

// ✅ Helper para extraer el valor de tipoCliente
const getTipoClienteValor = (value: any): string => {
  if (!value) return 'Sin especificar';
  if (typeof value === 'object' && value !== null) {
    return value.valor || value.name || value.nombre || 'Sin especificar';
  }
  if (typeof value === 'string') {
    if (value.length === 24 && /^[a-f0-9]+$/i.test(value)) {
      return 'Sin especificar';
    }
    return value;
  }
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

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page.page + 1,
        limit: page.pageSize,
        status: TICKET_STATUS.CERRADO,
      };
      if (searchParams.value) params[searchParams.field] = searchParams.value;

      const response = await getTickets(params);
      let filteredData = response.data?.data || [];
      const currentTotal = response.data?.total || 0;

       filteredData.sort((a: any, b: any) => {
        const priorityA = getTicketPriority(a);
        const priorityB = getTicketPriority(b);
        if (priorityA === priorityB) return 0;
        return priorityA - priorityB;
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
      setPage({ page: 0, pageSize: 5 });
      return params;
    });
  }, []);

  const handlePagination = (model: { page: number; pageSize: number }) => setPage(model);

  const columns: GridColDef[] = [
    {
      field: 'tipoCliente',
      headerName: 'Tipo de Cliente',
      width: 160,
      renderCell: (params: any) => {
        const tipoClienteValor = getTipoClienteValor(params.value);
        const incidentType = params.row.incidentType || '';

        // REGLA 1: Si el Tipo de Cliente tiene un valor válido → Mostrarlo.
        if (tipoClienteValor !== 'Sin especificar') {
          const colors = getColorByTipoCliente(tipoClienteValor);
          return (
            <Chip
              label={tipoClienteValor}
              size="small"
              sx={{
                bgcolor: colors.bgcolor,
                color: colors.color,
                fontWeight: 600,
                borderRadius: '6px',
                fontSize: '0.72rem',
                height: '26px',
                border: `1px solid ${colors.bgcolor}`,
                boxShadow: 'none',
              }}
            />
          );
        }

        // REGLA 2: Si el Tipo de Cliente es "Sin especificar" Y el Tipo de Incidencia es DIFERENTE a "FALLA PUNTUAL" → Mostrar Tipo de Incidencia.
        if (!incidentType.toUpperCase().includes('PUNTUAL')) {
          const colors = getColorByTipoIncidencia(incidentType);
          return (
            <Chip
              label={incidentType}
              size="small"
              sx={{
                bgcolor: colors.bgcolor,
                color: colors.color,
                fontWeight: 600,
                borderRadius: '6px',
                fontSize: '0.72rem',
                height: '26px',
                border: `1px solid ${colors.bgcolor}`,
                boxShadow: 'none',
              }}
            />
          );
        }

        // FALLBACK NATURAL: Si es FALLA PUNTUAL sin tipo de cliente, muestra "Sin especificar"
        return (
          <Chip
            label="Sin especificar"
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              color: '#94a3b8',
              fontWeight: 500,
              borderRadius: '6px',
              fontSize: '0.72rem',
              height: '26px',
              border: '1px solid #e2e8f0',
              boxShadow: 'none',
            }}
          />
        );
      },
    },
    { field: "caseNumber", headerName: "Tickets", flex: 1, minWidth: 120 },
    { field: "subject", headerName: "Asunto de Caso", flex: 2, minWidth: 250 },
    { field: "primerNombre", headerName: "Responsable", flex: 1.5, minWidth: 200, valueGetter: (value, row) => `${row?.primerNombre || ""} ${row?.primerApellido || ""}`.trim() },
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
          [TICKET_STATUS.CERRADO]: { labelText: "CERRADO", bgcolor: "#fef2f2", color: "#991b1b", border: "#fecaca" },
          ["default"]: { labelText: valor, bgcolor: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
        };
        const config = Translations[valor] || Translations["default"];
        return (
          <Chip 
            label={config.labelText} 
            size="small" 
            sx={{ 
              bgcolor: config.bgcolor, 
              color: config.color, 
              border: `1px solid ${config.border}`,
              fontWeight: "bold", 
              borderRadius: "6px", 
              px: 0.5, 
              fontFamily: corporateFont,
              boxShadow: 'none',
            }} 
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ "& .MuiDataGrid-row": { cursor: "pointer", transition: "background-color 0.15s ease" }, "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" } }}>
      <CustomDataGrid
        rows={tickets?.data || []} columns={columns} loading={loading} onCellClick={onCellClick}
        paginationModel={page} onPaginationModelChange={handlePagination} pageSizeOptions={[10, 50, 100]}
        paginationMode="server" rowCount={tickets?.total || 0} onSearch={handleSearch} debounceMs={400}
      />
    </Box>
  );
}