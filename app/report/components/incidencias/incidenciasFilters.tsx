'use client';
import React, { useState } from 'react';
import {
  Paper, Typography, Stack, TextField, MenuItem, Button, Grid, CircularProgress, Box, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { FilterList as FilterIcon, Search as SearchIcon, Clear as ClearIcon, CalendarMonth } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { TIPO_SERVICIO } from 'app/utils/constants';

interface Props {
  filtroPrincipal: string;
  tipoServicio: string;
  proveedor: string;
  mes: Dayjs | null;
  fechaInicio: Dayjs | null;
  fechaFin: Dayjs | null;
  loading: boolean;
  proveedoresList?: any[];
  onFiltroPrincipalChange: (value: string) => void;
  onTipoServicioChange: (value: string) => void;
  onProveedorChange: (value: string) => void;
  onFechaInicioChange?: (value: Dayjs | null) => void;
  onFechaFinChange?: (value: Dayjs | null) => void;
  onRefresh: () => void;
  onClear?: () => void;
}

export const IncidenciasFilters = ({
  filtroPrincipal,
  tipoServicio,
  proveedor,
  fechaInicio,
  fechaFin,
  loading,
  proveedoresList = [],
  onFiltroPrincipalChange,
  onTipoServicioChange,
  onProveedorChange,
  onFechaInicioChange,
  onFechaFinChange,
  onRefresh,
  onClear,
}: Props) => {
  const [fechaMode, setFechaMode] = useState<'mes' | 'rango'>('mes');

  return (
   <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: '#fafbfc' }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
        <Box sx={{ bgcolor: '#080769', color: 'white', p: 0.75, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FilterIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '0.3px' }}>
          Filtros de Búsqueda
        </Typography>
      </Stack>

      <Grid container spacing={2.5} alignItems="stretch">
        {/* 1. Selector Principal */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <TextField 
            select 
            fullWidth 
            label="Filtrar por" 
            size="small" 
            value={filtroPrincipal} 
            onChange={(e) => onFiltroPrincipalChange(e.target.value)} 
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value=""><em>Seleccionar tipo de filtro</em></MenuItem>
            <MenuItem value="tipoServicio">Tipo de Servicio</MenuItem>
            <MenuItem value="proveedor">Proveedor</MenuItem>
          </TextField>
        </Grid>

        {/* 2. Tipo de Servicio (Condicional) */}
        {filtroPrincipal === 'tipoServicio' && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <TextField 
              select 
              fullWidth 
              label="Tipo de Servicio" 
              size="small" 
              value={tipoServicio} 
              onChange={(e) => onTipoServicioChange(e.target.value)} 
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.values(TIPO_SERVICIO).map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* 3. Proveedor (Condicional) */}
        {filtroPrincipal === 'proveedor' && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <TextField 
              select 
              fullWidth 
              label="Proveedor" 
              size="small" 
              value={proveedor} 
              onChange={(e) => onProveedorChange(e.target.value)} 
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value=""><em>Todos los proveedores</em></MenuItem>
              {proveedoresList.map((prov: any) => (
                <MenuItem key={prov._id} value={prov._id}>{prov.valor}</MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* 4. Fecha Inicio */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha Inicio"
              value={fechaInicio}
              onChange={onFechaInicioChange}
              format="DD/MM/YYYY"
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

        {/* 5. Fecha Fin */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha Fin"
              value={fechaFin}
              onChange={onFechaFinChange}
              format="DD/MM/YYYY"
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

        {/* 6. Botones de Acción */}
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 2.4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, width: '100%', justifyContent: { md: 'flex-end' } }}>
            <Button
              variant="contained"
              onClick={onRefresh}
              disabled={loading || !filtroPrincipal}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              sx={{ 
                flex: { md: 1.8 }, 
                width: { xs: '100%', md: 'auto' }, 
                bgcolor: '#080769', 
                color: 'white', 
                borderRadius: '8px', 
                textTransform: 'none', 
                fontWeight: 700, 
                height: 40, 
                whiteSpace: 'nowrap', 
                boxShadow: '0px 4px 12px rgba(8, 7, 105, 0.15)', 
                '&:hover': { bgcolor: '#060550' } 
              }}
            >
              {loading ? 'Consultando...' : 'Aplicar'}
            </Button>

            {onClear && (filtroPrincipal || tipoServicio || proveedor || fechaInicio) && (
              <Button 
                variant="outlined" 
                onClick={onClear} 
                startIcon={<ClearIcon />} 
                sx={{ 
                  flex: { md: 1 }, 
                  width: { xs: '100%', md: 'auto' }, 
                  color: '#64748b', 
                  borderColor: '#cbd5e1', 
                  borderRadius: '8px', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  height: 40, 
                  whiteSpace: 'nowrap', 
                  '&:hover': { bgcolor: '#f1f5f9' } 
                }}
              >
                Limpiar
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};