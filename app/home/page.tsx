'use client';
import React, { useState, useEffect } from 'react';
import { ContainerBox } from "../components/containerBox";
import { CustomDataGrid } from "../components/customDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

// Definición del tipo estructurado
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

// --- DATOS SIMULADOS DEL NOC ---
const mockTickets: Tickets[] = [
  {
    id: "1",
    _id: "64a7b1e8f",
    username: "op_zero",
    email: "ACCE-458129", 
    asuntoCaso: "FALLA EN EQUIPO ONT - CLIENTE CARRIER",
    ticketCodigo: "INC-1544322",
    primerNombre: "Zero",
    primerApellido: "Soporte",
    estado: "ACTIVO",
  },
  {
    id: "2",
    _id: "64a7b1e9a",
    username: "analista_noc1",
    email: "CORE-938201",
    asuntoCaso: "INCIDENCIA EN LLAMADAS SALIENTES - SIP TRUNK",
    ticketCodigo: "INC-1544323",
    primerNombre: "Carlos",
    primerApellido: "Mendoza",
    estado: "PRELIMINAR",
  },
  {
    id: "3",
    _id: "64a7b1e9b",
    username: "analista_noc2",
    email: "TRAN-301928",
    asuntoCaso: "PIXELACIÓN DE IMAGEN - PLATAFORMA OTT",
    ticketCodigo: "INC-1544324",
    primerNombre: "María",
    primerApellido: "Rodríguez",
    estado: "ACTIVO",
  },
  {
    id: "4",
    _id: "64a7b1e9c",
    username: "op_zero",
    email: "ACCE-104928",
    asuntoCaso: "VENTANA DE MANTENIMIENTO - CORTE DE FIBRA PROGRAMADO",
    ticketCodigo: "INC-1544325",
    primerNombre: "Zero",
    primerApellido: "Soporte",
    estado: "CERRADO",
  }
];

export default function HomePage() {
  const [tickets, setTickets] = useState<Tickets[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const columns: GridColDef[] = [
    { 
      field: "ticketCodigo", 
      headerName: "Tickets", 
      flex: 1, 
      minWidth: 120,
      valueGetter: (params, row) => row?.ticketCodigo || "N/A" 
    },
    { 
      field: "asuntoCaso", 
      headerName: "Asunto de Caso", 
      flex: 2, 
      minWidth: 250,
      valueGetter: (params, row) => row?.asuntoCaso || "Sin asunto"
    },
    {
      field: "primerNombre",
      headerName: "Responsable",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (params, row) => {
        const r = row || params;
        return `${r.primerNombre || ""} ${r.primerApellido || ""}`.trim();
      },
    },
    {
      field: "email",
      headerName: "Número de Caso",
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      // Renderizado personalizado con Chips en tonos pasteles
      renderCell: (params) => {
        const valor = params.value;

        // Configuración por defecto de estilos
        let labelText = valor;
        let bgcolor = '#f5f5f5';
        let color = '#616161';

        if (valor === "PRELIMINAR") {
          labelText = "Preliminar";
          bgcolor = '#fff9c4'; // Amarillo pastel suave
          color = '#f57f17';   // Texto ocre/amarillo oscuro para contraste
        } else if (valor === "ACTIVO") {
          labelText = "Activo";
          bgcolor = '#e8f5e9'; // Verde pastel suave
          color = '#2e7d32';   // Texto verde oscuro
        } else if (valor === "CERRADO") {
          labelText = "Cerrado";
          bgcolor = '#ffebee'; // Rojo pastel suave
          color = '#c62828';   // Texto rojo oscuro
        }

        return (
          <Chip 
            label={labelText} 
            size="small"
            sx={{ 
              bgcolor: bgcolor, 
              color: color, 
              fontWeight: 'bold',
              borderRadius: '6px', // Bordes sutiles tipo tag moderno
              px: 0.5
            }} 
          />
        );
      },
    },
  ];

  return (
    <ContainerBox
      title="Gestión de Tickets"
      subtitle="Administración de Incidencias y actividades del NOC"
    >
      <CustomDataGrid 
        rows={tickets} 
        columns={columns} 
        loading={loading} 
      />
    </ContainerBox>
  );
}