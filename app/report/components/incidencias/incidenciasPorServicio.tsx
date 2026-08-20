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
import { generarGraficaBarras, generarGraficaTorta } from '../../../utils/generarGraficas';

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
  const [exportando, setExportando] = useState(false);

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

  const handleExport = useCallback(async () => {
    setExportando(true);
    try {
      const barData = filters.proveedor ? servicioChartDataPorProveedor : servicioChartData;
      const pieData = filters.proveedor ? tipoServicioChartDataPorProveedor : tipoServicioChartData;

      const barras = generarGraficaBarras(barData as any);
      const torta = generarGraficaTorta(pieData as any);

      console.log('📊 Gráficas generadas:', {
        barras: barras ? `${barras.length} chars` : 'undefined',
        torta: torta ? `${torta.length} chars` : 'undefined',
      });

      if (filters.proveedor) {
        await exportIncidenciasPorProveedorCsv(dataPorProveedor, filters.mes, {
          barras, 
          torta, 
          serviciosAfectados: barData.length,
        });
      } else {
        await exportIncidenciasCsv(data, filters.mes, {
          barras, 
          torta, 
          serviciosAfectados: barData.length,
        });
      }
    } catch (err) {
      console.error('❌ Error exportando:', err);
    } finally {
      setExportando(false);
    }
  }, [data, dataPorProveedor, filters.mes, filters.proveedor,
      servicioChartData, servicioChartDataPorProveedor,
      tipoServicioChartData, tipoServicioChartDataPorProveedor]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#080769' }}>
          {filters.proveedor ? `Incidencias por Proveedor` : 'Incidencias por Servicio'}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || exportando || (filters.proveedor ? dataPorProveedor.length === 0 : data.length === 0)}
          sx={{ 
            bgcolor: '#080769', 
            borderRadius: '8px', 
            textTransform: 'none', 
            fontWeight: 600, 
            '&:hover': { bgcolor: '#060550' } 
          }}
        >
          {exportando ? 'Generando Excel...' : 'Exportar Reporte'}
        </Button>
      </Box>

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

      <IncidenciasKpiCards totales={filters.proveedor ? totalesPorProveedor : totales} />

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