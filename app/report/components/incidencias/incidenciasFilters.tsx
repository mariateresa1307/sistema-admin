'use client';
import React from 'react';
import { 
  Paper, Typography, Stack, TextField, MenuItem, Button, Grid, CircularProgress, Box 
} from '@mui/material';
import { FilterList as FilterIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { TIPO_SERVICIO } from 'app/utils/constants';

interface Props {
  filtroPrincipal: string; 
  tipoServicio: string;
  proveedor: string;
  mes: Dayjs;
  loading: boolean;
  proveedoresList?: any[];
  onFiltroPrincipalChange: (value: string) => void;
  onTipoServicioChange: (value: string) => void;
  onProveedorChange: (value: string) => void;
  onMesChange: (value: Dayjs) => void;
  onRefresh: () => void;
  onClear?: () => void;
}

export const IncidenciasFilters = ({
  filtroPrincipal,
  tipoServicio,
  proveedor,
  mes,
  loading,
  proveedoresList = [],
  onFiltroPrincipalChange,
  onTipoServicioChange,
  onProveedorChange,
  onMesChange,
  onRefresh,
  onClear,
}: Props) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 3,
        bgcolor: '#fafbfc',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
        <Box sx={{ 
          bgcolor: '#080769', 
          color: 'white', 
          p: 0.75, 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FilterIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '0.3px' }}>
          Filtros de Búsqueda
        </Typography>
      </Stack>

      <Grid container spacing={2.5} alignItems="stretch">
        
        {/* 1. Selector Principal: Tipo de Filtro */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <TextField
            select
            fullWidth
            label="Filtrar por"
            size="small"
            value={filtroPrincipal}
            onChange={(e) => onFiltroPrincipalChange(e.target.value)}
            SelectProps={{
              MenuProps: { PaperProps: { sx: { maxHeight: 300 } } }
            }}
            sx={{ bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="">
              <em>Seleccionar tipo de filtro</em>
            </MenuItem>
            <MenuItem value="tipoServicio">Tipo de Servicio</MenuItem>
            <MenuItem value="proveedor">Proveedor</MenuItem>
          </TextField>
        </Grid>

        {/* 2. Tipo de Servicio (SOLO se muestra si filtroPrincipal === 'tipoServicio') */}
        {filtroPrincipal === 'tipoServicio' && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              select
              fullWidth
              label="Tipo de Servicio"
              size="small"
              value={tipoServicio}
              onChange={(e) => onTipoServicioChange(e.target.value)}
              SelectProps={{
                MenuProps: { PaperProps: { sx: { maxHeight: 300 } } }
              }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.values(TIPO_SERVICIO).map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* 3. Proveedor (SOLO se muestra si filtroPrincipal === 'proveedor') */}
        {filtroPrincipal === 'proveedor' && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <TextField
              select
              fullWidth
              label="Proveedor"
              size="small"
              value={proveedor}
              onChange={(e) => onProveedorChange(e.target.value)}
              SelectProps={{
                MenuProps: { PaperProps: { sx: { maxHeight: 300 } } }
              }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">
                <em>Todos los proveedores</em>
              </MenuItem>
              {proveedoresList.map((prov: any) => (
                <MenuItem key={prov._id} value={prov._id}>
                  {prov.valor}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* 4. Mes */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Mes de Incidencias"
              value={mes}
              onChange={(newValue) => newValue && onMesChange(newValue)}
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

        {/* 5. Botones de Acción (AJUSTADO PARA MEJOR ESPACIO) */}
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, // Apilados en móvil/tablet, lado a lado en desktop
            gap: 1.5, 
            width: '100%',
            justifyContent: { md: 'flex-end' } // Alineados a la derecha en desktop
          }}>
            <Button
              variant="contained"
              onClick={onRefresh}
              disabled={loading || !filtroPrincipal}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              sx={{
                flex: { md: 1.8 }, // Ocupa espacio equitativo en desktop
                width: { xs: '100%', md: 'auto' }, // 100% en móvil, automático en desktop
                bgcolor: '#080769',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                height: 40,
                whiteSpace: 'nowrap', // ✅ Evita que el texto se parta en dos líneas
                boxShadow: '0px 4px 12px rgba(8, 7, 105, 0.15)',
                '&:hover': { bgcolor: '#060550', boxShadow: '0px 6px 16px rgba(8, 7, 105, 0.25)' },
                '&:disabled': { bgcolor: '#94a3b8', color: 'white' }
              }}
            >
              {loading ? 'Consultando...' : 'Aplicar Filtros'}
            </Button>

            {onClear && (filtroPrincipal || tipoServicio || proveedor) && (
              <Button
                variant="outlined"
                onClick={onClear}
                startIcon={<ClearIcon />}
                sx={{
                  flex: { md: 1 }, // Ocupa espacio equitativo en desktop
                  width: { xs: '100%', md: 'auto' },
                  color: '#64748b',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: 40,
                  whiteSpace: 'nowrap', // ✅ Evita que el texto se parta
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8', color: '#0f172a' }
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