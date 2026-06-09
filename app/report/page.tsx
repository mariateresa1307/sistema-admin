"use client";

import React, { useState } from "react";
import { Box, Typography, Card, CardContent, TextField, MenuItem,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Paper
} from "@mui/material";
import Grid from "@mui/material/Grid"; 
import { Download, BarChart as ChartIcon } from "@mui/icons-material";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const data = [{ name: 'CORE', fallas: 40 }, { name: 'IT', fallas: 30 }, { name: 'Acceso', fallas: 20 }];

// Datos para la torta
const pieData = [
  { name: 'Crítico', value: 15 },
  { name: 'Alto', value: 35 },
  { name: 'Medio', value: 50 },
];
const COLORS = ['#dc2626', '#d97706', '#2563eb'];

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
    grupo: "A", plataforma: "TODAS", servicio: "TODOS", fechaInicio: "", fechaFin: ""
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

      {/* --- SECCION DE FILTROS --- */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Grupo KPI" select size="medium" value={filters.grupo} onChange={(e) => setFilters({ ...filters, grupo: e.target.value })}>
              <MenuItem value="A">A - Gestión de fallas</MenuItem>
              <MenuItem value="B">B - Por servicio</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Plataforma" select size="medium" value={filters.plataforma} onChange={(e) => setFilters({ ...filters, plataforma: e.target.value })}>
              <MenuItem value="TODAS">Todas</MenuItem>
              <MenuItem value="CORE">CORE</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Servicio" select size="medium" value={filters.servicio} onChange={(e) => setFilters({ ...filters, servicio: e.target.value })}>
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="FTTH">FTTH</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth type="datetime-local" label="Fecha Inicio" value={filters.fechaInicio} onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })} InputLabelProps={{ shrink: true }} size="medium" />
              <TextField fullWidth type="datetime-local" label="Fecha Fin" value={filters.fechaFin} onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })} InputLabelProps={{ shrink: true }} size="medium" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* --- KPI CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <KpiCard title="MTTR Plataforma" value="1.8h" color="#2563eb" subtitle="Promedio mensual" />
        <KpiCard title="Tasa Rotación" value="94%" color="#059669" subtitle="Turno diurno" />
        <KpiCard title="Incidentes Mayores" value="12" color="#dc2626" subtitle="Impacto directo" />
        <KpiCard title="Eficiencia Cierre" value="88%" color="#d97706" subtitle="Promedio operativo" />
      </Grid>

      {/* --- GRÁFICOS --- */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} /> Análisis de Tendencias
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
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
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Distribución de Severidad</Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* --- MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Exportar Reporte Filtrado</DialogTitle>
        <DialogContent dividers>
          <Typography>Se exportarán los datos actuales aplicando los filtros seleccionados.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => alert("Generando...")}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}