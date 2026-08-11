'use client';
import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ProtectedRoute from '../components/protectedRoute';
import { ContainerBox } from '../components/containerBox';
import { DashboardOperaciones } from './components/dashboardOperaciones';
import { IncidenciasPorServicio } from './components/incidencias/incidenciasPorServicio';

function ReportesContent() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <ContainerBox title="Reportes" subtitle="Análisis y monitoreo de operaciones">
      {/* ✅ Tabs dentro de la card, mismo patrón que Gestión de Servicios */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_event, newValue) => setTabValue(newValue)}
          aria-label="reportes tabs"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem' } }}
        >
          <Tab label="Dashboard de Operaciones" />
          <Tab label="Incidencias por Servicio" />
        </Tabs>
      </Box>

      {tabValue === 0 && <DashboardOperaciones />}
      {tabValue === 1 && <IncidenciasPorServicio />}
    </ContainerBox>
  );
}

export default function ReportesPage() {
  return (
    <ProtectedRoute module="reportes">
      <ReportesContent />
    </ProtectedRoute>
  );
}