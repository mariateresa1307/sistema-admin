"use client";
import React, { useState, useCallback, useMemo, useEffect, Suspense } from "react"; // ✅ useEffect debe estar aquí
import { useSearchParams,useRouter } from "next/navigation";
import { ContainerBox } from "../components/containerBox";
import { MetricsCarousel } from "./metricsCarousel";
import { TicketDetailModal } from "./cardDetailModal";
import { Tabs, Tab, Box, Typography, Chip } from "@mui/material";
import TicketModal from "../tickets/ticketModal";
import { Tickets } from "app/utils/types";
import { TicketRecord } from "app/utils/ticketHelpers";
import { TICKET_STATUS } from "app/utils/constants";
import { useHomeRefresh } from "../context/homeRefreshContext";
import ActiveTicketsTab from "./tabs/activeTicketsTab";
import AssignedTicketsTab from "./tabs/assignedTicketsTab";
import ClosedTicketsTab from "./tabs/closedTicketsTab";
import { getTickets } from "@/lib/api"; 

const corporateFont = 'Calibri, Arial, sans-serif';

interface TabDefinition {
  label: string;
  statusFilter?: string;
  operatorFilter?: boolean;
  icon?: string;
}

const TABS: TabDefinition[] = [
  { label: "Activos y En Gestión", statusFilter: undefined, icon: "📋" },
  { label: "Mis Tickets Asignados", operatorFilter: true, statusFilter: TICKET_STATUS.ACTIVO, icon: "👤" },
  { label: "Tickets Cerrados", statusFilter: TICKET_STATUS.CERRADO, icon: "✅" },
];

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openTicketNumber = searchParams.get("openTicket")

  const [activeTab, setActiveTab] = useState(0);
  const [tabCounts, setTabCounts] = useState<number[]>([0, 0, 0]);
  const { refreshHomeData } = useHomeRefresh();
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Tickets | null>(null);


  const currentUserId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return null;
      const user = JSON.parse(userData);
      return user._id || null;
    } catch (error) {
      console.error('Error parsing userData:', error);
      return null;
    }
  }, []);

  const updateTabCount = useCallback((tabIndex: number, count: number) => {
    setTabCounts(prev => {
      if (prev[tabIndex] === count) return prev;
      const newCounts = [...prev];
      newCounts[tabIndex] = count;
      return newCounts;
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDialogOpen(false);
    setTicketToEdit(null);
    refreshHomeData();
  }, [refreshHomeData]);

  const handleSaveTicket = useCallback((updatedTicketData?: any) => {
    setIsDialogOpen(false);
    setTicketToEdit(null);
    
    if (isDetailOpen && updatedTicketData) {
      setSelectedTicket(updatedTicketData as TicketRecord);
    }
    
    refreshHomeData();
  }, [refreshHomeData, isDetailOpen]);

  const handleTransitionToEdit = useCallback((ticket: Tickets) => {
    setIsDetailOpen(false);
    setTicketToEdit(ticket);
    setIsDialogOpen(true);
  }, []);

  const handleCellClick = useCallback((params: any) => {
    if (params.row) {
      setSelectedTicket(params.row as TicketRecord);
      setIsDetailOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!openTicketNumber) return;

    const autoOpenTicket = async () => {
      try {
        console.log(`🔔 [HomePage] Abriendo ticket desde notificación: ${openTicketNumber}`);
        
        // Buscar el ticket por su número de caso
        const response = await getTickets({ 
          page: 1, 
          limit: 1, 
          caseNumber: openTicketNumber 
        });
        
        const ticket = response.data?.data?.[0];

        if (ticket) {
          // ✅ Abrir el modal con ese ticket
          setSelectedTicket(ticket as TicketRecord);
          setIsDetailOpen(true);
          
          // ✅ Cambiar a la pestaña correcta según el estado del ticket
          if (ticket.status === TICKET_STATUS.CERRADO) {
            setActiveTab(2); // Pestaña "Tickets Cerrados"
          } else {
            setActiveTab(0); // Pestaña "Activos y En Gestión"
          }

          // ✅ Limpiar el query param para que no se reabra al recargar
          window.history.replaceState({}, "", "/tickets");
          console.log(`✅ [HomePage] Ticket ${openTicketNumber} abierto en modal`);
        } else {
          console.warn(`⚠️ [HomePage] Ticket ${openTicketNumber} no encontrado`);
        }
      } catch (error) {
        console.error("❌ [HomePage] Error al abrir ticket desde notificación:", error);
      }
    };

    autoOpenTicket();
  }, [openTicketNumber]);

  return (
    <ContainerBox title="Administración de Incidencias y actividades" subtitle="Monitorización en tiempo real de operaciones.">
      <MetricsCarousel />

      <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontFamily: corporateFont, fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', color: '#64748b', minHeight: '48px' },
            '& .MuiTab-root.Mui-selected': { color: '#121227', fontWeight: 700 },
            '& .MuiTabs-indicator': { backgroundColor: '#6BB1E2', height: '3px' },
          }}
        >
          {TABS.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>{tab.icon}</Typography>
                  <Typography>{tab.label}</Typography>
                  {tabCounts[index] >= 0 && (
                    <Chip
                      label={tabCounts[index]}
                      size="small"
                      sx={{
                        bgcolor: index === activeTab ? '#6BB1E2' : '#e2e8f0',
                        color: index === activeTab ? '#FFFFFF' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: '20px',
                        fontFamily: corporateFont,
                      }}
                    />
                )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {activeTab === 1 && !currentUserId && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffe69c' }}>
          <Typography sx={{ color: '#856404', fontFamily: corporateFont, fontSize: '0.9rem' }}>
            ⚠️ No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        {activeTab === 0 && <ActiveTicketsTab onCellClick={handleCellClick} onCountChange={(count) => updateTabCount(0, count)} />}
        {activeTab === 1 && <AssignedTicketsTab currentUserId={currentUserId} onCellClick={handleCellClick} onCountChange={(count) => updateTabCount(1, count)} />}
        {activeTab === 2 && <ClosedTicketsTab onCellClick={handleCellClick} onCountChange={(count) => updateTabCount(2, count)} />}
      </Box>

      <TicketModal 
        open={isDialogOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveTicket} 
        ticketToEdit={ticketToEdit} 
      />
      
      <TicketDetailModal 
        open={isDetailOpen} 
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTicket(null);
        }} 
        ticket={selectedTicket} 
        onEditClick={() => selectedTicket && handleTransitionToEdit(selectedTicket as Tickets)} 
      />
    </ContainerBox>
  );
}
export default function HomePage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant="body1" color="text.secondary">Cargando tickets...</Typography>
      </Box>
    }>
      <HomePageContent />
    </Suspense>
  );
}


