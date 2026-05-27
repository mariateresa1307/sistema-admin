'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ContainerBox } from "../components/containerBox";
import { DataGrid, GridColDef, GridCellParams, DataGridProps } from "@mui/x-data-grid";
import { Chip, Box, Paper, Typography, Modal, IconButton, Divider } from "@mui/material";
import Grid from '@mui/material/Grid'; // Corregido a Grid v2 para que funcione la propiedad 'size'
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TicketModal from '../home/ticketModal'; 
import EditSquareIcon from '@mui/icons-material/EditSquare';
// ==========================================
// TYPES Y MOCK DATA
// ==========================================
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

// ==========================================
// COMPONENTE COMPARTIDO INTEGRADO (CustomDataGrid)
// ==========================================
interface CustomDataGridProps extends DataGridProps {}

function CustomDataGridInternal({ sx, rows, columns, loading, ...restProps }: CustomDataGridProps) {
  return (
    <Box sx={{ height: 500, width: '100%', ...sx }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
        pageSizeOptions={[5, 10, 20]}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700 },
          '& .MuiDataGrid-cell': { color: '#334155', borderColor: '#f1f5f9' },
        }}
        {...restProps} // Mapea nativamente el onCellClick recibido sin perderlo en componentes intermedios
      />
    </Box>
  );
}

// ==========================================
// VISTA PRINCIPAL (HomePage)
// ==========================================
export default function HomePage() {
  const [tickets, setTickets] = useState<Tickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estados para los Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Estado del modal de detalle
  const [selectedTicket, setSelectedTicket] = useState<Tickets | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setDragConstraints({ right: 0, left: offsetWidth - scrollWidth - 30 });
    }
  }, [tickets]);

  // --- CÓMPUTO EN TIEMPO REAL PARA LAS CARDS MÉTRICAS ---
  const totalTickets = tickets.length;
  const totalPreliminar = tickets.filter(t => t.estado === 'PRELIMINAR').length;
  const totalActivo = tickets.filter(t => t.estado === 'ACTIVO').length;
  const totalCerrado = tickets.filter(t => t.estado === 'CERRADO').length;

  // --- LÓGICA DE FILTRADO PARA LA TABLA ---
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.asuntoCaso.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketCodigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${ticket.primerNombre} ${ticket.primerApellido}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'TODOS' || ticket.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  // Disparador al hacer click en una celda
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

  const cardsData = [
    { title: "Total Incidencias", count: totalTickets, color: "#4f46e5", icon: <AssessmentIcon sx={{ fontSize: '1.4rem', color: '#4f46e5' }} /> },
    { title: "Preliminares", count: totalPreliminar, color: "#eab308", icon: <WarningAmberIcon sx={{ fontSize: '1.4rem', color: '#eab308' }} /> },
    { title: "Casos Activos", count: totalActivo, color: "#22c55e", icon: <AssignmentIcon sx={{ fontSize: '1.4rem', color: '#22c55e' }} /> },
    { title: "Casos Cerrados", count: totalCerrado, color: "#ef4444", icon: <CheckCircleOutlineIcon sx={{ fontSize: '1.4rem', color: '#ef4444' }} /> },
  ];

  return (
    <ContainerBox title="Administración de Incidencias y actividades" subtitle="">
      
      {/* CARRUSEL DE TARJETAS SUPERIORES */}
      <Box 
        ref={carouselRef}
        sx={{ 
          mb: 4, width: '100%', overflow: 'hidden', cursor: 'grab', py: 1, px: 0.5,
          '&:active': { cursor: 'grabbing' },
          '&::before, &::after': { content: '""', height: '100%', width: '40px', position: 'absolute', zIndex: 2, pointerEvents: 'none' },
          '&::before': { left: 0, top: 0, background: 'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0) 100%)' },
          '&::after': { right: 0, top: 0, background: 'linear-gradient(to left, #ffffff 0%, rgba(255,255,255,0) 100%)' }
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          drag="x" dragConstraints={dragConstraints} dragElastic={0.15}
          style={{ display: 'flex', gap: '20px', width: 'max-content' }}
        >
          {cardsData.map((card, index) => (
            <motion.div key={index} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Paper
                elevation={0}
                sx={{
                  width: '255px', p: '22px', borderRadius: '14px', bgcolor: '#ffffff', border: '1px solid #eaedf1',
                  boxShadow: '0px 2px 6px rgba(0, 0, 20, 0.02), 0px 8px 24px rgba(0, 0, 30, 0.04)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', userSelect: 'none',
                  '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${card.color} 0%, rgba(255,255,255,0) 100%)`, opacity: 0.85 }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: card.color, boxShadow: `0px 0px 6px ${card.color}` }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.68rem' }}>
                      {card.title}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: `${card.color}0a`, p: 0.8, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-1px', fontSize: '2.1rem' }}>{card.count}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>casos</Typography>
                </Box>
              </Paper>
            </motion.div>
          ))}
        </motion.div>
      </Box>

      {/* TABLA PRINCIPAL DE DATOS CON COMPONENTE INTEGRADO */}
      <Box sx={{ 
        '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color 0.15s ease' },
        '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' } 
      }}>
        <CustomDataGridInternal 
          rows={filteredTickets} 
          columns={columns} 
          loading={loading}
          onCellClick={handleCellClick}
        />
      </Box>

      {/* MODAL DE CREACIÓN DE TICKET */}
      <TicketModal open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSaveTicket} />

      {/* MODAL DE DETALLE */}
      <AnimatePresence>
        {isDetailOpen && selectedTicket && (
          <Modal 
            open={isDetailOpen} 
            onClose={() => setIsDetailOpen(false)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.35 }}
              style={{ width: '100%', maxWidth: '620px', outline: 'none' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4, borderRadius: '18px', border: '1px solid #eaedf1',
                  boxShadow: '0px 10px 40px rgba(0,0,0,0.06), 0px 20px 70px rgba(0,0,20,0.04)',
                  bgcolor: '#ffffff', position: 'relative', overflow: 'hidden'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
                  bgcolor: selectedTicket.estado === 'ACTIVO' ? '#22c55e' : selectedTicket.estado === 'PRELIMINAR' ? '#eab308' : '#ef4444'
                }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ConfirmationNumberIcon sx={{ color: '#64748b', fontSize: '1.3rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Ficha Técnica del Incidente   
                    </Typography>
                  </Box>
               
                  <IconButton onClick={() => setIsDetailOpen(false)} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 3.5, borderColor: '#f1f5f9' }} />

                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Asunto del Caso
                    </Typography>
                   
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.5, lineHeight: 1.4 }}>
                      {selectedTicket.asuntoCaso}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Código Ticket
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5', bgcolor: '#4f46e50d', px: 1, py: 0.4, borderRadius: '6px', display: 'inline-block' }}>
                        {selectedTicket.ticketCodigo}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Número de Caso
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                      {selectedTicket.email}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Estado Actual
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={selectedTicket.estado} 
                        size="small"
                        sx={{ 
                          fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 0.5,
                          bgcolor: selectedTicket.estado === 'ACTIVO' ? '#e8f5e9' : selectedTicket.estado === 'PRELIMINAR' ? '#fff9c4' : '#ffebee',
                          color: selectedTicket.estado === 'ACTIVO' ? '#2e7d32' : selectedTicket.estado === 'PRELIMINAR' ? '#f57f17' : '#c62828'
                        }} 
                      />
                    </Box>
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon sx={{ color: '#4f46e5', fontSize: '2rem', bgcolor: '#ffffff', p: 0.8, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} />
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                          Especialista Asignado / Responsable NOC
                        </Typography>
                        
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {`${selectedTicket.primerNombre} ${selectedTicket.primerApellido}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          ID Operador: @{selectedTicket.username}
                        </Typography>
                      </Box>
                          <EditSquareIcon style={{marginLeft: "auto", marginTop: "auto", color: "cornflowerblue"}} /> 
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

    </ContainerBox>
  );
}