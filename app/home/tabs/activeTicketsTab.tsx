"use client";
import React, { useState, useEffect, useCallback } from "react";
import CustomDataGrid, { SearchParams } from "../../components/customDataGrid";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box } from "@mui/material";
import { getTickets } from "@/lib/api";
import { Pagination, Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";

const corporateFont = 'Calibri, Arial, sans-serif';

// ✅ PALETA ARMONIZADA - Fondos suaves con texto oscuro (menos agresivo visualmente)
const getColorByTipoIncidencia = (tipoIncidencia: string): { bgcolor: string; color: string } => {
  const tipoUpper = (tipoIncidencia || '').toUpperCase();
  
  // FALLA MASIVA: Rojo suave pero que siga destacando (es crítica)
  if (tipoUpper.includes('MASIVA')) {
    return { bgcolor: '#fee2e2', color: '#991b1b' }; // Rojo pastel con texto rojo oscuro
  }
  // MANTENIMIENTO / VENTANA DE MANTENIMIENTO
  if (tipoUpper.includes('MANTENIMIENTO') || tipoUpper.includes('VENTANA')) {
    return { bgcolor: '#dbeafe', color: '#1e40af' }; // Azul pastel con texto azul oscuro
  }
  // FALLA PUNTUAL (la más común, debe ser la más suave)
  if (tipoUpper.includes('PUNTUAL')) {
    return { bgcolor: '#f1f5f9', color: '#475569' }; // Gris azulado muy suave
  }
  // Por defecto
  return { bgcolor: '#f8fafc', color: '#64748b' };
};

// ✅ PALETA ARMONIZADA PARA TIPO DE CLIENTE
const getColorByTipoCliente = (tipoCliente: string): { bgcolor: string; color: string } => {
  const tipoUpper = (tipoCliente || '').toUpperCase();
  
  // RESIDENCIAL
  if (tipoUpper.includes('RESIDENCIAL')) {
    return { bgcolor: '#dcfce7', color: '#166534' }; // Verde pastel suave
  }
  // CARRIER
  if (tipoUpper.includes('CARRIER')) {
    return { bgcolor: '#ffedd5', color: '#9a3412' }; // Naranja pastel suave
  }
  // BANCA
  if (tipoUpper.includes('BANCA')) {
    return { bgcolor: '#f3e8ff', color: '#6b21a8' }; // Morado/lavanda pastel
  }
  // CORPORATIVO
  if (tipoUpper.includes('CORPORATIVO')) {
    return { bgcolor: '#e0f2fe', color: '#075985' }; // Azul cielo pastel
  }
  // Sin especificar
  return { bgcolor: '#f1f5f9', color: '#64748b' }; // Gris suave
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

// ✅ FUNCIÓN DE ORDENAMIENTO PERSONALIZADO - CORREGIDA
const getTicketPriority = (ticket: any): number => {
  const status = ticket.status;
  const incidentType = (ticket.incidentType || '').toUpperCase();
  const tipoClienteValor = getTipoClienteValor(ticket.tipoCliente).toUpperCase();

  // 1. EN GESTIÓN - Siempre primero, sin importar el tipo
  if (status === TICKET_STATUS.EN_GESTION) return 1;
  
  // 2. FALLA MASIVA (aunque estén ACTIVOS)
  if (incidentType.includes('MASIVA')) return 2;
  
  // 3. CARRIER
  if (tipoClienteValor.includes('CARRIER')) return 3;
  
  // 4. CORPORATIVO
  if (tipoClienteValor.includes('CORPORATIVO')) return 4;
  
  // 5. RESIDENCIAL (y cualquier otro)
  return 5;
};

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
  
  const fetchTickets = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {
        page: page.page + 1,
        limit: page.pageSize,
        excludeStatus: TICKET_STATUS.CERRADO,
      };

      if (searchParams.value) {
        params[searchParams.field] = searchParams.value;
      }

      const response = await getTickets(params);
      let filteredData = response.data?.data || [];
      const currentTotal = response.data?.total || 0;

      filteredData = filteredData.filter((t: any) => t.status !== TICKET_STATUS.CERRADO);

      // ✅ APLICAR EL ORDENAMIENTO CORREGIDO
      filteredData.sort((a: any, b: any) => {
        const priorityA = getTicketPriority(a);
        const priorityB = getTicketPriority(b);
        if (priorityA === priorityB) return 0;
        return priorityA - priorityB;
      });

      setTickets({ ...response.data, data: filteredData, total: currentTotal });
      onCountChange(currentTotal);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
    }
  }, [page.page, page.pageSize, searchParams.field, searchParams.value, onCountChange]);

  useEffect(() => { 
    fetchTickets(); 
  }, [fetchTickets]);

  const handleSearch = useCallback((params: SearchParams) => {
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
      />
    </Box>
  );
}