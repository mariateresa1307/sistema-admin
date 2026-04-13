"use client";
import React from "react";
import { 
  Box, Typography, Card, CardContent,  Grid, 
  TextField, MenuItem, Button, Stack, InputAdornment, Divider 
} from "@mui/material";
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  RestartAlt as ResetIcon,
  CalendarMonth as CalendarIcon 
} from "@mui/icons-material";
// Importaciones para manejo de fechas (requiere @mui/x-date-pickers)
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export default function FiltrosSuperiores() {
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(null);
  const [toDate, setToDate] = React.useState<Dayjs | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        
        {/* CARD 1: FORMULARIO DE FILTROS */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                <FilterIcon sx={{ color: '#080769' }} fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#080769' }}>
                  Filtros de Auditoría
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                {/* Búsqueda por Usuario */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Usuario"
                    placeholder="Nombre de usuario..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Selección de Acción */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField select fullWidth size="small" label="Acción Realizada" defaultValue="">
                    <MenuItem value="PUT">Edición (PUT)</MenuItem>
                    <MenuItem value="POST">Creación (POST)</MenuItem>
                    <MenuItem value="DELETE">Eliminación (DELETE)</MenuItem>
                    <MenuItem value="LOGIN">Inicio de Sesión</MenuItem>
                  </TextField>
                </Grid>

                {/* Selección de Servicio */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField select fullWidth size="small" label="Tipo de Servicio" defaultValue="">
                    <MenuItem value="CSS">CSS</MenuItem>
                    <MenuItem value="GPON">GPON</MenuItem>
                    <MenuItem value="DEDICADO">Dedicado</MenuItem>
                  </TextField>
                </Grid>

                {/* Fecha Desde */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Desde"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                {/* Fecha Hasta */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Hasta"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                {/* Botones de Control */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      sx={{ 
                        bgcolor: '#080769', 
                        borderRadius: '8px', 
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Filtrar
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      sx={{ borderRadius: '8px', minWidth: '45px' }}
                    >
                      <ResetIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 2: RESUMEN DE SELECCIÓN (ESTILO CORPORATIVO) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ 
            borderRadius: '16px', 
            height: '100%', 
            background: 'linear-gradient(135deg, #080769 0%, #1a1a4d 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(8, 7, 105, 0.2)'
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 700 }}>
                Resultados
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
                150
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Registros encontrados bajo los filtros actuales.
              </Typography>
              
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
              
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon fontSize="inherit" sx={{ opacity: 0.7 }} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Última actualización: Hoy
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </LocalizationProvider>
  );
}