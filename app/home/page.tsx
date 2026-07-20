"use client";
import React, { useState, useCallback, useMemo } from "react";
import { ContainerBox } from "../components/containerBox";
import { MetricsCarousel } from "./metricsCarousel";
import { TicketDetailModal } from "./cardDetailModal";
import { Tabs, Tab, Box, Typography, Chip } from "@mui/material";
import TicketModal from "../home/ticketModal";
import { Tickets } from "app/utils/types";
import { TICKET_STATUS } from "app/utils/constants";
import { useHomeRefresh } from "../context/homeRefreshContext";
import ActiveTicketsTab from "./tabs/activeTicketsTab";
import AssignedTicketsTab from "./tabs/assignedTicketsTab";
import ClosedTicketsTab from "./tabs/closedTicketsTab";

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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabCounts, setTabCounts] = useState<number[]>([0, 0, 0]);
  const { refreshHomeData } = useHomeRefresh();

  // ✅ CORRECCIÓN 1: Usar el tipo Tickets en lugar de any o TicketRecord
  const [selectedTicket, setSelectedTicket] = useState<Tickets | null>(null);
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

  const handleSaveTicket = useCallback((data?: any) => {
    setIsDialogOpen(false);
    setTicketToEdit(null);
    refreshHomeData();
  }, [refreshHomeData]);

  // ✅ CORRECCIÓN 2: El parámetro debe ser del tipo Tickets
  const handleTransitionToEdit = useCallback((ticket: Tickets) => {
    setIsDetailOpen(false);
    setTicketToEdit(ticket);
    setIsDialogOpen(true);
  }, []);

  // ✅ CORRECCIÓN 3: El parámetro debe ser del tipo Tickets
  const handleCellClick = useCallback((params: any) => {
    if (params.row) {
      setSelectedTicket(params.row as Tickets);
      setIsDetailOpen(true);
    }
  }, []);

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
        onClose={() => setIsDetailOpen(false)} 
        ticket={selectedTicket as React.ComponentProps<typeof TicketDetailModal>["ticket"]} 
        onEditClick={() => selectedTicket && handleTransitionToEdit(selectedTicket)} 
      />
    </ContainerBox>
  );
}