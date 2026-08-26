'use client';
import React, { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, IconButton, CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Download, Search } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { KpiCard } from './kpiCards';
import { getReportPreview } from '@/lib/api';
import { GrupoA } from '../grupos/grupoA';
import { GrupoB } from '../grupos/grupoB';
import { GrupoC } from '../grupos/grupoC';
import { GrupoD } from '../grupos/grupoD';
import { CATEGORIA_RED, TIPO_CLIENTE } from 'app/utils/constants';
import { ReportePreview } from 'app/utils/types';
import { exportReporteGrupoAExcel } from '../../utils/exportGrupoA';

// Cards que solo se muestran en la gráfica de torta (no como KPIs)
const CARDS_SOLO_GRAFICA = [
  'Incidencias Puntuales',
  'Incidencias Masivas',
  'Ventana de Mantenimiento',
];

export const DashboardOperaciones = () => {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    grupo: 'A',
    plataforma: 'TODAS',
    cliente: 'TODOS',
    mes: dayjs(),
  });
  const [reportPreview, setReportPreview] = useState<ReportePreview>({});

  const handleSearchFilter = async () => {
    const mesString = dayjs(filters.mes).format('YYYY-MM');
    setLoading(true);
    try {
      const resultReport = await getReportPreview({ ...filters, mes: mesString });
      setReportPreview(resultReport.data);
    } finally {
      setLoading(false);
    }
  };

const handleExportReport = () => {
  const mesString = dayjs(filters.mes).format('YYYY-MM');
  
  console.log('📥 [Frontend] Iniciando exportación con filtros:', {
    grupo: filters.grupo,
    plataforma: filters.plataforma,
    cliente: filters.cliente,
    mes: mesString
  });
  
  // Construir URL con query params
  const params = new URLSearchParams({
    grupo: filters.grupo,
    plataforma: filters.plataforma,
    cliente: filters.cliente,
    mes: mesString,
  });

  const exportUrl = `/api/reports/export?${params.toString()}`;
  console.log('📥 [Frontend] URL de exportación:', exportUrl);
  
  // Crear link temporal para forzar la descarga
  const link = document.createElement('a');
  link.href = exportUrl;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setOpenModal(false);
};

  const handleMesChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setFilters({ ...filters, mes: newValue });
    }
  };

  // ✅ Export usa los tickets que ya vienen en reportPreview.ticketsDetalle
  const handleExportar = async () => {
    try {
      const ticketsDetalle = (reportPreview as any).ticketsDetalle || [];

      if (ticketsDetalle.length === 0) {
        window.dispatchEvent(new CustomEvent('app-notification', {
          detail: { message: 'No hay tickets para exportar en este período', severity: 'warning' },
        }));
        return;
      }

      await exportReporteGrupoAExcel({
        reportPreview,
        mes: filters.mes,
        tickets: ticketsDetalle,
      });

      setOpenModal(false);
      window.dispatchEvent(new CustomEvent('app-notification', {
        detail: { message: 'Reporte exportado correctamente', severity: 'success' },
      }));
    } catch (err: any) {
      console.error('Error exportando:', err);
      window.dispatchEvent(new CustomEvent('app-notification', {
        detail: { message: err?.message || 'Error al exportar el reporte', severity: 'error' },
      }));
    }
  };

  const Grupos = {
    A: <GrupoA reportPreview={reportPreview ?? {}} />,
    B: <GrupoB reportPreview={reportPreview ?? {}} />,
    C: <GrupoC reportPreview={reportPreview ?? {}} />,
    D: <GrupoD reportPreview={reportPreview ?? {}} />,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#080769' }}>
            Dashboard de Operaciones
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Monitoreo de KPIs por grupo y servicio
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#080769', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Exportar Reporte
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 12, lg: 3 }}>
            <TextField
              fullWidth
              label="Grupo KPI"
              select
              size="medium"
              value={filters.grupo}
              onChange={(e) => setFilters({ ...filters, grupo: e.target.value })}
            >
              <MenuItem value="A">A - Gestión de fallas</MenuItem>
              <MenuItem value="B">B - Por servicio</MenuItem>
              <MenuItem value="C">C - Operativos 7x24</MenuItem>
              <MenuItem value="D">D - Calidad y mejora</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <TextField
              fullWidth
              label="Plataforma"
              select
              size="medium"
              value={filters.plataforma}
              onChange={(e) => setFilters({ ...filters, plataforma: e.target.value })}
            >
              <MenuItem value="TODAS">Todas</MenuItem>
              {CATEGORIA_RED.map((name) => <MenuItem value={name} key={name}>{name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <TextField
              fullWidth
              label="Tipo cliente"
              select
              size="medium"
              value={filters.cliente}
              onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              {(Object.keys(TIPO_CLIENTE) as Array<keyof typeof TIPO_CLIENTE>).map((key) => (
                <MenuItem key={key} value={TIPO_CLIENTE[key]}>{TIPO_CLIENTE[key]}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Mes de Incidencias"
                value={filters.mes}
                onChange={handleMesChange}
                views={['year', 'month']}
                format="MMMM YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { bgcolor: 'white', borderRadius: 2 }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

           <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearchFilter}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
              sx={{
                height: 56,
                bgcolor: '#080769',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 14px rgba(8, 7, 105, 0.35)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: '#0a0980',
                  boxShadow: '0 6px 20px rgba(8, 7, 105, 0.5)',
                  transform: 'translateY(-2px)',
                },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              {loading ? 'Consultando…' : 'Buscar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {reportPreview.cards
          ?.filter((card) => !CARDS_SOLO_GRAFICA.includes(card.title))
          .map((card, key) => <KpiCard {...card} key={key} />)}
      </Grid>

      {reportPreview.mttrPlataforma && Grupos[filters.grupo as keyof typeof Grupos]}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Exportar Reporte Filtrado</DialogTitle>
        <DialogContent dividers>
          <Typography>Se exportarán los datos del mes seleccionado aplicando los filtros.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleExportar}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};