"use client";

import React, { useState } from "react";
import { 
  Box, Typography, Card, CardContent, TextField, MenuItem, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Paper
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Download, FilterList, BarChart as ChartIcon } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

const data = [{ name: 'CORE', fallas: 40 }, { name: 'IT', fallas: 30 }, { name: 'Acceso', fallas: 20 }];



// --- NUEVO DISEÑO DE TARJETAS (KPI Cards) ---
const KpiCard = ({ title, value, color, subtitle }: { title: string; value: string | number, color: string, subtitle?: string }) => (
  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
    <Card elevation={0} sx={{ 
      border: '1px solid', 
      borderColor: 'divider', 
      borderRadius: 3, 
      transition: '0.3s',
      '&:hover': { boxShadow: 2 }
    }}>
      <CardContent sx={{ pb: 2 }}>
        <Typography variant="overline" sx={{ color: color, fontWeight: 800, display: 'block' }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  </Grid>
);

export default function ReportesPage() {
  const [openModal, setOpenModal] = useState(false);
  const [filters, setFilters] = useState({   
    grupo: "A", 
    plataforma: "TODAS", 
    servicio: "TODOS",
    fechaInicio: dayjs().subtract(30, 'day'),
    fechaFin: dayjs()
  });


  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard de Operaciones</Typography>
          <Typography color="text.secondary">Monitoreo de KPIs por grupo y servicio</Typography>
        </Box>
        <Button variant="contained" startIcon={<Download />} onClick={() => setOpenModal(true)}>
          Exportar Reporte
        </Button>
      </Box>

      {/* --- SECCION DE FILTROS AJUSTADA A TUS KPIs --- */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Grupo KPI" select size="medium" value={filters.grupo} onChange={(e) => setFilters({...filters, grupo: e.target.value})}>
              <MenuItem value="A">A - Gestión de fallas</MenuItem>
              <MenuItem value="B">B - Por servicio</MenuItem>
              <MenuItem value="C">C - Operativos 7x24</MenuItem>
              <MenuItem value="D">D - Calidad y mejora</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Plataforma" select size="medium" value={filters.plataforma} onChange={(e) => setFilters({...filters, plataforma: e.target.value})}>
              <MenuItem value="TODAS">Todas</MenuItem>
              <MenuItem value="CORE">CORE</MenuItem>
              <MenuItem value="TRANSPORTE">Transporte</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Servicio" select size="medium" value={filters.servicio} onChange={(e) => setFilters({...filters, servicio: e.target.value})}>
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="FTTH">FTTH</MenuItem>
              <MenuItem value="FTTO">FTTO</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={2}>
              <DatePicker 
                label="Fecha Inicio" 
                value={filters.fechaInicio} 
                onChange={(newValue) => setFilters({...filters, fechaInicio: newValue})}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker 
                label="Fecha Fin" 
                value={filters.fechaFin} 
                onChange={(newValue) => setFilters({...filters, fechaFin: newValue})}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* --- KPI CARDS REPLANTEADAS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <KpiCard title="MTTR Plataforma" value="1.8h" color="#2563eb" subtitle="Promedio mensual" />
        <KpiCard title="Tasa Rotación" value="94%" color="#059669" subtitle="Turno diurno" />
        <KpiCard title="Incidentes Mayores" value="12" color="#dc2626" subtitle="Impacto directo" />
        <KpiCard title="Eficiencia Cierre" value="88%" color="#d97706" subtitle="Promedio operativo" />
      </Grid>

      {/* --- GRÁFICO DINÁMICO (Recharts) --- */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <ChartIcon sx={{ mr: 1 }} /> Análisis de Tendencias
        </Typography>
        <Box sx={{ height: 350, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fallas" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      {/* MODAL EXPORTAR */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Exportar Reporte Filtrado</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>Se exportarán los datos actuales aplicando los siguientes filtros:</Typography>
          <Stack spacing={1} sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography>Grupo: <b>{filters.grupo}</b></Typography>
            <Typography>Plataforma: <b>{filters.plataforma}</b></Typography>
            <Typography>Servicio: <b>{filters.servicio}</b></Typography>
            <Typography>Periodo: <b>{filters.periodo}</b></Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => alert("Generando archivo...")}>Confirmar y Descargar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}