"use client";
import React, { useState, useEffect, useCallback } from "react";
import CustomDataGrid, { SearchParams } from "../../components/customDataGrid";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box } from "@mui/material";
import { getTickets } from "@/lib/api";
import { Pagination, Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";

const corporateFont = 'Calibri, Arial, sans-serif';

export default function AssignedTicketsTab({ 
  currentUserId, onCellClick, onCountChange 
}: { 
  currentUserId: string | null;
  onCellClick: (params: GridCellParams) => void;
  onCountChange: (count: number) => void;
}) {
  const [tickets, setTickets] = useState<Pagination<Tickets[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ page: 0, pageSize: 10 });
  const [searchParams, setSearchParams] = useState<SearchParams>({ field: "caseNumber", value: "" });

  const fetchTickets = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page.page + 1,
        limit: page.pageSize,
        status: TICKET_STATUS.ACTIVO,
        operatorId: currentUserId,
      };
      if (searchParams.value) params[searchParams.field] = searchParams.value;

      const response = await getTickets(params);
      const currentTotal = response.data?.total || 0;
      
      setTickets(response.data);
      onCountChange(currentTotal);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [page.page, page.pageSize, searchParams, currentUserId, onCountChange]);

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
    { field: "primerNombre", headerName: "Responsable", flex: 1.5, minWidth: 200, valueGetter: (value, row) => `${row?.primerNombre || ""} ${row?.primerApellido || ""}`.trim() },
    {
      field: "status", headerName: "Estado", flex: 1, minWidth: 140, align: "center", headerAlign: "center",
      renderCell: (params) => {
        const valor = params.value;
        const Translations: Record<string, any> = {
          [TICKET_STATUS.ACTIVO]: { labelText: "ACTIVO", bgcolor: "#e8f5e9", color: "#2e7d32" },
          ["default"]: { labelText: valor, bgcolor: "#f5f5f5", color: "#616161" },
        };
        const { labelText, ...otherProps } = Translations[valor] || Translations["default"];
        return <Chip label={labelText} size="small" sx={{ ...otherProps, fontWeight: "bold", borderRadius: "6px", px: 0.5, fontFamily: corporateFont }} />;
      },
    },
  ];

  if (!currentUserId) return null;

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