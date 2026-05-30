'use client';
import React, { useState, useEffect } from 'react';
import { ContainerBox } from "../components/containerBox";
import { CustomDataGrid } from "../components/customDataGrid";
import { MetricsCarousel } from "../components/metricsCarousel";
import { TicketDetailModal } from "../components/cardDetailModal";
import { GridColDef, GridCellParams } from "@mui/x-data-grid";
import { Chip, Box } from "@mui/material";
import TicketModal from '../home/ticketModal'; 

type Tickets = {
  id: string; 
  _id: string;
  username: string;
  email: string; 
  asuntoCaso: string;
  ticketCodigo: string; 
  primerNombre: string;
  primerApellido: string;
  estado: 'PRELIMINAR' | 'ACTIVO' | 'CERRADO'; 
};

const mockTickets: Tickets[] = [
  { id: "1", _id: "64a7b1e8f", username: "op_zero", email: "ACCE-458129", asuntoCaso: "FALLA EN EQUIPO ONT - CLIENTE CARRIER", ticketCodigo: "INC-1544322", primerNombre: "Zero", primerApellido: "Soporte", estado: "ACTIVO" },
  { id: "2", _id: "64a7b1e9a", username: "analista_noc1", email: "CORE-938201", asuntoCaso: "INCIDENCIA EN LLAMADAS SALIENTES - SIP TRUNK", ticketCodigo: "INC-1544323", primerNombre: "Carlos", primerApellido: "Mendoza", estado: "PRELIMINAR" },
  { id: "3", _id: "64a7b1e9b", username: "analista_noc2", email: "TRAN-301928", asuntoCaso: "PIXELACIÓN DE IMAGEN - PLATAFORMA OTT", ticketCodigo: "INC-1544324", primerNombre: "María", primerApellido: "Rodríguez", estado: "CERRADO" }
];

export default function HomePage() {
  const [tickets, setTickets] = useState<Tickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Tickets | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const metrics = {
    total: tickets.length,
    preliminar: tickets.filter(t => t.estado === 'PRELIMINAR').length,
    activo: tickets.filter(t => t.estado === 'ACTIVO').length,
    cerrado: tickets.filter(t => t.estado === 'CERRADO').length,
  };

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
      estado: nuevoTicketData.estatus 
    };
    setTickets(prev => [nuevoRegistro, ...prev]);
  };

  const handleCellClick = (params: GridCellParams) => {
    if (params.row) {
      setSelectedTicket(params.row as Tickets);
      setIsDetailOpen(true);
    }
  };

  const columns: GridColDef[] = [
    { field: "ticketCodigo", headerName: "Tickets", flex: 1, minWidth: 120 },
    { field: "asuntoCaso", headerName: "Asunto de Caso", flex: 2, minWidth: 250 },
    {
      field: "primerNombre",
      headerName: "Responsable",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) => `${row?.primerNombre || ""} ${row?.primerApellido || ""}`.trim(),
    },
    { field: "email", headerName: "Número de Caso", flex: 1.5, minWidth: 180 },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const valor = params.value;
        let labelText = valor;
        let bgcolor = '#f5f5f5';
        let color = '#616161';

        if (valor === "PRELIMINAR") { labelText = "Preliminar"; bgcolor = '#fff9c4'; color = '#f57f17'; }
        else if (valor === "ACTIVO") { labelText = "Activo"; bgcolor = '#e8f5e9'; color = '#2e7d32'; }
        else if (valor === "CERRADO") { labelText = "Cerrado"; bgcolor = '#ffebee'; color = '#c62828'; }

        return <Chip label={labelText} size="small" sx={{ bgcolor, color, fontWeight: 'bold', borderRadius: '6px', px: 0.5 }} />;
      },
    },
  ];

  return (
    <ContainerBox title="Administración de Incidencias y actividades" subtitle="">
      
      <MetricsCarousel metrics={metrics} />

      <Box sx={{ 
        '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color 0.15s ease' },
        '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' } 
      }}>
        <CustomDataGrid 
          rows={tickets} // Tu buscador interno ahora filtra reactivamente este prop
          columns={columns} 
          loading={loading}
          onCellClick={handleCellClick}
        />
      </Box>

      <TicketModal open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSaveTicket} />

      <TicketDetailModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} ticket={selectedTicket} />

    </ContainerBox>
  );
}