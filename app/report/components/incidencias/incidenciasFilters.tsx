'use client';
import React from 'react';
import { Paper, Typography, Stack, TextField, MenuItem, Button, Grid, CircularProgress } from '@mui/material';
import { FilterList as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { TIPO_SERVICIO } from 'app/utils/constants';

interface Props {
  tipoServicio: string;
  mes: Dayjs;
  loading: boolean;
  onTipoServicioChange: (value: string) => void;
  onMesChange: (value: Dayjs) => void;
  onRefresh: () => void;
}

export const IncidenciasFilters = ({
  tipoServicio,
  mes,
  loading,
  onTipoServicioChange,
  onMesChange,
  onRefresh,
}: Props) => {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
        <FilterIcon sx={{ color: '#080769' }} fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#080769' }}>
          Filtros
        </Typography>
      </Stack>

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            label="Tipo de Servicio"
            size="small"
            value={tipoServicio}
            onChange={(e) => onTipoServicioChange(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.values(TIPO_SERVICIO).map((tipo) => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Mes"
              value={mes}
              onChange={(newValue) => newValue && onMesChange(newValue)}
              views={['year', 'month']}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            onClick={onRefresh}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SearchIcon />}
            sx={{
              bgcolor: '#080769',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              height: 40,
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};