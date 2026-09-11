'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Download, Search } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { KpiCard } from './kpiCards';
import { getReportPreview, getMiscellaneous } from '@/lib/api';
import { GrupoA } from '../grupos/grupoA';
import { GrupoB } from '../grupos/grupoB';
import { GrupoC } from '../grupos/grupoC';
import { GrupoD } from '../grupos/grupoD';
import { ReportePreview } from 'app/utils/types';
import { exportReporteGrupoAExcel } from '../../utils/exportGrupoA';
import { exportReporteGrupoBExcel } from '../../utils/exportGrupoB';
import { exportReporteGrupoCExcel } from '../../utils/exportGrupoC';
import { exportReporteGrupoDExcel } from '../../utils/exportGrupoD';

const CARDS_SOLO_GRAFICA = [
  'Incidencias Puntuales',
  'Incidencias Masivas',
  'Ventana de Mantenimiento',
];

export const DashboardOperaciones = () => {
  const [openModal, setOpenModal] = useState(false);
  const [filters, setFilters] = useState({
    grupo: 'A',
    plataforma: 'TODAS',
    cliente: 'TODOS',
    mes: dayjs(),
  });
  const [searchedGrupo, setSearchedGrupo] = useState<string | null>(null);
  const [reportPreview, setReportPreview] = useState<ReportePreview>({});
  
  // ✅ ESTADOS PARA DATOS DINÁMICOS
  const [categoriasRed, setCategoriasRed] = useState<{ _id: string; valor: string }[]>([]);
  const [tiposCliente, setTiposCliente] = useState<{ _id: string; valor: string }[]>([]);

  // ✅ CARGAR CATEGORÍAS Y TIPOS DE CLIENTE DESDE MISCELLANEOUS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, tiposRes] = await Promise.all([
          getMiscellaneous({ categoria: 'CATEGORIA_RED', limit: 9999 }),
          getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 9999 }),
        ]);

        // Procesar categorías de red
        const catRaw = categoriasRes?.data;
        const catData = Array.isArray(catRaw?.data) 
          ? catRaw.data 
          : (Array.isArray(catRaw) ? catRaw : []);
        setCategoriasRed(catData.filter((c: any) => c.activo !== false));

        // Procesar tipos de cliente
        const tipoRaw = tiposRes?.data;
        const tipoData = Array.isArray(tipoRaw?.data) 
          ? tipoRaw.data 
          : (Array.isArray(tipoRaw) ? tipoRaw : []);
        setTiposCliente(tipoData.filter((t: any) => t.activo !== false));
      } catch (error) {
        console.error("Error cargando datos dinámicos:", error);
      }
    };
    fetchData();
  }, []);

  const clearResults = () => {
    setReportPreview({});
    setSearchedGrupo(null);
  };

  const updateFilter = (partial: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    clearResults();
  };

  const handleSearchFilter = () => {
    const mesString = dayjs(filters.mes).format('YYYY-MM');
    setReportPreview({});
    setSearchedGrupo(filters.grupo);
    getReportPreview({ ...filters, mes: mesString }).then((resultReport) => {
      setReportPreview(resultReport.data || {});
    });
  };

  const handleMesChange = (newValue: Dayjs | null) => {
    if (newValue) {
      updateFilter({ mes: newValue });
    }
  };

  const handleExportar = async () => {
    try {
      if (filters.grupo === 'A') {
        const ticketsDetalle = (reportPreview as any).ticketsDetalle || [];
        if (ticketsDetalle.length === 0) {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { message: 'No hay tickets para exportar en este período', severity: 'warning' },
          }));
          return;
        }
        await exportReporteGrupoAExcel({ reportPreview, mes: filters.mes, tickets: ticketsDetalle });
      } else if (filters.grupo === 'B') {
        const tiempoPorServicio = (reportPreview as any).tiempoPorServicio || [];
        const fallasRecurrentes = (reportPreview as any).fallasRecurrentes || [];
        const ticketsDetalle = (reportPreview as any).ticketsDetalle || [];
        if (tiempoPorServicio.length === 0 && fallasRecurrentes.length === 0) {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { message: 'No hay datos de servicio para exportar en este período', severity: 'warning' },
          }));
          return;
        }
        await exportReporteGrupoBExcel({ reportPreview, mes: filters.mes, tiempoPorServicio, fallasRecurrentes, ticketsDetalle });
      } else if (filters.grupo === 'C') {
        const ticketsPorOperador = (reportPreview as any).ticketsPorOperador || [];
        const promedioPorOperador = (reportPreview as any).promedioPorOperador || 0;
        const cantidadOperadores = (reportPreview as any).cantidadOperadores || 0;
        const ticketsDetalle = (reportPreview as any).ticketsDetalle || [];
        if (ticketsPorOperador.length === 0 && ticketsDetalle.length === 0) {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { message: 'No hay datos de operadores para exportar en este período', severity: 'warning' },
          }));
          return;
        }
        await exportReporteGrupoCExcel({ reportPreview, mes: filters.mes, ticketsPorOperador, promedioPorOperador, cantidadOperadores });
      } else if (filters.grupo === 'D') {
        const incidentesMayoresPorMes = (reportPreview as any).incidentesMayoresPorMes || [];
        const rankingServicios = (reportPreview as any).rankingServicios || [];
        if (incidentesMayoresPorMes.length === 0 && rankingServicios.length === 0) {
          window.dispatchEvent(new CustomEvent('app-notification', {
            detail: { message: 'No hay datos de calidad y mejora para exportar en este período', severity: 'warning' },
          }));
          return;
        }
        await exportReporteGrupoDExcel({ reportPreview, mes: filters.mes });
      } else {
        window.dispatchEvent(new CustomEvent('app-notification', {
          detail: { message: `La exportación para el Grupo ${filters.grupo} aún no está disponible`, severity: 'info' },
        }));
        return;
      }

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
              onChange={(e) => updateFilter({ grupo: e.target.value })}
            >
              <MenuItem value="A">A - Gestión de fallas</MenuItem>
              <MenuItem value="B">B - Por servicio</MenuItem>
              <MenuItem value="C">C - Operativos 7x24</MenuItem>
              <MenuItem value="D">D - Calidad y mejora</MenuItem>
            </TextField>
          </Grid>

          {/* ✅ PLATAFORMA - Usa categorías dinámicas */}
          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <TextField
              fullWidth
              label="Plataforma"
              select
              size="medium"
              value={filters.plataforma}
              onChange={(e) => updateFilter({ plataforma: e.target.value })}
            >
              <MenuItem value="TODAS">Todas</MenuItem>
              {categoriasRed.map((cat) => (
                <MenuItem value={cat._id} key={cat._id }>
                  {cat.valor}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ✅ TIPO CLIENTE - Usa tipos dinámicos de Miscellaneous */}
          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <TextField
              fullWidth
              label="Tipo cliente"
              select
              size="medium"
              value={filters.cliente}
              onChange={(e) => updateFilter({ cliente: e.target.value })}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              {tiposCliente.map((tipo) => (
                <MenuItem value={tipo._id} key={tipo._id }>
                  {tipo.valor}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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

          <Grid size={{ xs: 12, md: 12, lg: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              size="large"
              color="primary"
              onClick={handleSearchFilter}
              sx={{
                bgcolor: '#080769',
                color: 'white',
                '&:hover': { bgcolor: '#060550' },
                width: 56,
                height: 56
              }}
            >
              <Search />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {searchedGrupo && (
        <>
          {!['B', 'C'].includes(searchedGrupo) && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {reportPreview.cards
                ?.filter((card) => !CARDS_SOLO_GRAFICA.includes(card.title))
                .map((card, key) => <KpiCard {...card} key={`${card.title}-${key}`} />)}
            </Grid>
          )}

          {Grupos[searchedGrupo as keyof typeof Grupos]}
        </>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Exportar Reporte Filtrado</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Se exportarán los datos del mes <b>{dayjs(filters.mes).format('MMMM YYYY')}</b> 
            aplicando los filtros seleccionados para el <b>Grupo {filters.grupo}</b>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleExportar}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};