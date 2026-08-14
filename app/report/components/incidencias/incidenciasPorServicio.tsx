'use client';
import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Button, Alert, Typography } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { 
  useIncidenciasData, 
  IncidenciaPorServicio as IncidenciaType 
} from '../../hooks/useIncidenciasData';
import { exportIncidenciasCsv } from '../../../utils/exportIncidenciasCsv';
import { exportIncidenciasPorProveedorCsv } from '../../../utils/exportIncidenciasPorProveedorCsv';
import { IncidenciasFilters } from './incidenciasFilters';
import { IncidenciasKpiCards } from './incidenciasKpiCards';
import { IncidenciasChart } from './incidenciasChart';
import { ReportTable } from '../reportTable';
import { IncidenciasDetailModal } from './incidenciasDetailModal';
import { ProveedorTable } from '../proveedorTable';

export const IncidenciasPorServicio = () => {
  const {
    filters, 
    setFilters, 
    data, 
    dataPorProveedor,
    servicioChartData, 
    tipoServicioChartData, 
    servicioChartDataPorProveedor,
    tipoServicioChartDataPorProveedor,
    totales, 
    totalesPorProveedor,
    loading, 
    error, 
    loadData, 
    clearError,
    proveedores,
  } = useIncidenciasData();

  const [selected, setSelected] = useState<IncidenciaType | null>(null);
  const [filtroPrincipal, setFiltroPrincipal] = useState<string>('');

  const handleFiltroPrincipalChange = useCallback(
    (value: string) => {
      setFiltroPrincipal(value);
      if (value === 'tipoServicio') {
        setFilters((prev) => ({ ...prev, proveedor: '' }));
      } else if (value === 'proveedor') {
        setFilters((prev) => ({ ...prev, tipoServicio: '' }));
      }
    },
    [setFilters],
  );

  const handleTipoServicioChange = useCallback(
    (value: string) => setFilters((prev) => ({ ...prev, tipoServicio: value })),
    [setFilters],
  );

  const handleProveedorChange = useCallback(
    (value: string) => setFilters((prev) => ({ ...prev, proveedor: value })),
    [setFilters],
  );

  const handleMesChange = useCallback(
    (value: any) => setFilters((prev) => ({ ...prev, mes: value })),
    [setFilters],
  );

  const handleClearFilters = useCallback(() => {
    setFiltroPrincipal('');
    setFilters({ tipoServicio: '', proveedor: '', mes: dayjs() });
  }, [setFilters]);

  const handleExport = useCallback(() => {
    if (filters.proveedor) {
      exportIncidenciasPorProveedorCsv(dataPorProveedor, filters.mes);
    } else {
      exportIncidenciasCsv(data, filters.mes);
    }
  }, [data, dataPorProveedor, filters.mes, filters.proveedor]);

  return (
    <Box>
      {/* 1. Header con título dinámico y botón de exportar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#080769' }}>
          {filters.proveedor ? `Incidencias por Proveedor` : 'Incidencias por Servicio'}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || (filters.proveedor ? dataPorProveedor.length === 0 : data.length === 0)}
          sx={{ 
            bgcolor: '#080769', 
            borderRadius: '8px', 
            textTransform: 'none', 
            fontWeight: 600, 
            '&:hover': { bgcolor: '#060550' } 
          }}
        >
          Exportar Reporte
        </Button>
      </Box>

      {/* 2. Filtros */}
      <IncidenciasFilters
        filtroPrincipal={filtroPrincipal}
        tipoServicio={filters.tipoServicio}
        proveedor={filters.proveedor}
        mes={filters.mes}
        loading={loading}
        proveedoresList={proveedores}
        onFiltroPrincipalChange={handleFiltroPrincipalChange}
        onTipoServicioChange={handleTipoServicioChange}
        onProveedorChange={handleProveedorChange}
        onMesChange={handleMesChange}
        onRefresh={loadData}
        onClear={handleClearFilters}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}
      <IncidenciasKpiCards 
          totales={filters.proveedor ? totalesPorProveedor : totales} 
        />


      {filters.proveedor ? (
        <ProveedorTable data={dataPorProveedor} loading={loading} />
      ) : (
        <ReportTable data={data} loading={loading} onRowClick={setSelected} />
      )}

   
      <Box sx={{ mt: 4 }}>
        
        
        <IncidenciasChart 
          barData={filters.proveedor ? servicioChartDataPorProveedor : servicioChartData} 
          pieData={filters.proveedor ? tipoServicioChartDataPorProveedor : tipoServicioChartData} 
        />
      </Box>

      {/* 5. Modal de detalle (solo para la vista agrupada) */}
      {!filters.proveedor && (
        <IncidenciasDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          incidencia={selected}
        />
      )}
    </Box>
  );
};