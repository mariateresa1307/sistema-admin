'use client';
import React, { useCallback, useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useIncidenciasData, IncidenciaPorServicio as IncidenciaType } from '../../hooks/useIncidenciasData';
import { exportIncidenciasCsv } from '../../../utils/exportIncidenciasCsv';
import { IncidenciasFilters } from './incidenciasFilters';
import { IncidenciasKpiCards } from './incidenciasKpiCards';
import { IncidenciasChart } from './incidenciasChart';
import { ReportTable } from '../reportTable';  
import { IncidenciasDetailModal } from './incidenciasDetailModal';

export const IncidenciasPorServicio = () => {
  const {
    filters, setFilters, data, servicioChartData, tipoServicioChartData, totales, loading, error, loadData, clearError,
  } = useIncidenciasData();

  const [selected, setSelected] = useState<IncidenciaType | null>(null);

  const handleTipoServicioChange = useCallback(
    (value: string) => setFilters((prev) => ({ ...prev, tipoServicio: value })),
    [setFilters],
  );

  const handleMesChange = useCallback(
    (value: any) => setFilters((prev) => ({ ...prev, mes: value })),
    [setFilters],
  );

  const handleExport = useCallback(() => {
    exportIncidenciasCsv(data, filters.mes);
  }, [data, filters.mes]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || data.length === 0}
          sx={{ bgcolor: '#2e7d32', borderRadius: '8px', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1b5e20' } }}
        >
          Exportar Reporte
        </Button>
      </Box>

      <IncidenciasFilters
        tipoServicio={filters.tipoServicio}
        mes={filters.mes}
        loading={loading}
        onTipoServicioChange={handleTipoServicioChange}
        onMesChange={handleMesChange}
        onRefresh={loadData}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <IncidenciasKpiCards totales={totales} />
      <IncidenciasChart barData={servicioChartData} pieData={tipoServicioChartData} />
      <ReportTable data={data} loading={loading} onRowClick={setSelected} />  {/* ← ACTUALIZADO */}

      <IncidenciasDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        incidencia={selected}
      />
    </Box>
  );
};