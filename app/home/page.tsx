"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ContainerBox } from "../components/containerBox";
import { CustomDataGrid } from "../components/customDataGrid";
import { MetricsCarousel } from "./metricsCarousel";
import { TicketDetailModal } from "./cardDetailModal";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box } from "@mui/material";
import TicketModal from "../home/ticketModal";
import { getTickets } from "@/lib/api";
import { Pagination, Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";

export default function HomePage() {
  const [tickets, setTickets] = useState<Pagination<Tickets[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState({page: 0, pageSize: 5 })

  const [selectedTicket, setSelectedTicket] = useState<Tickets | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    getTickets({ page: page.page + 1, limit: page.pageSize }).then((tickets) => {
      setTickets(tickets.data);
      setLoading(false);
    });
  }, [page.page, page.pageSize, setLoading, setLoading, getTickets]);


  const handleSaveTicket = (nuevoTicketData: any) => {
    const nuevoRegistro: Tickets = {
      id: String(tickets.length + 1),
      _id: Math.random().toString(36).substring(2, 11),
      username: "op_zero",
      email: nuevoTicketData.numeroTicket || "S/N",
      asuntoCaso: nuevoTicketData.asunto.toUpperCase(),
      ticketCodigo: `INC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      primerNombre: "Zero",
      primerApellido: "Soporte",
      responsable: "Zero Soporte",
      estado: nuevoTicketData.estatus,
    };
    setTickets((prev) => [nuevoRegistro, ...prev]);
  };

  const handleCellClick = (params: GridCellParams) => {
    if (params.row) {
      setSelectedTicket(params.row as Tickets);
      setIsDetailOpen(true);
    }
  };

  const columns: GridColDef[] = [
    { field: "caseNumber", headerName: "Tickets", flex: 1, minWidth: 120 },
    { field: "subject", headerName: "Asunto de Caso", flex: 2, minWidth: 250 },
    {
      field: "primerNombre",
      headerName: "Responsable",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row?.primerNombre || ""} ${row?.primerApellido || ""}`.trim(),
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

        const Translations = {
          [TICKET_STATUS.EN_GESTION]: {
            labelText: "EN GESTIÓN",
            bgcolor: "#fff9c4",
            color: "#f57f17",
          },
          ["ACTIVO"]: {
            labelText: "ACTIVO",
            bgcolor: "#e8f5e9",
            color: "#2e7d32",
          },
          ["CERRADO"]: {
            labelText: "CERRADO",
            bgcolor: "#ffebee",
            color: "#c62828",
          },
          ["default"]: {
            labelText: valor,
            bgcolor: "#f5f5f5",
            color: "#616161",
          },
        };

        const { labelText, ...otherProps } =
          Translations[valor] || Translations["default"];

        return (
          <Chip
            label={labelText}
            size="small"
            sx={{
              ...otherProps,
              fontWeight: "bold",
              borderRadius: "6px",
              px: 0.5,
            }}
          />
        );
      },
    },
  ];

  const handlePagination = (model) => {
      setPage(model);
  };


  return (
    <ContainerBox
      title="Administración de Incidencias y actividades"
      subtitle="Monitorización en tiempo real de operaciones."
    >
      <MetricsCarousel  />

      <Box
        sx={{
          "& .MuiDataGrid-row": {
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          },
          "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
        }}
      >
        <CustomDataGrid
          rows={tickets?.data || []}
          columns={columns}
          loading={loading}
          onCellClick={handleCellClick}
          paginationModel={{
            page: tickets?.page - 1 || 0,
            pageSize: tickets?.data.length || page.pageSize,
          }}
          onPaginationModelChange={handlePagination}
          pageSizeOptions={[2, 5, 10]}
          paginationMode="server"
          rowCount={tickets?.total || 0}

        />
      </Box>

      <TicketModal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTicket}
      />

      <TicketDetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ticket={selectedTicket}
      />
    </ContainerBox>
  );
}
