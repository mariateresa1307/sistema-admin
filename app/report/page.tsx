"use client";

import React, { useState } from "react";
import { Box, Typography, Card, CardContent, TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Paper, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Download, BarChart as ChartIcon } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Divider from '@mui/material/Divider';
import ProtectedRoute from "../components/protectedRoute";
import { KpiCard } from "./components/kpiCards";
import { Search } from "@mui/icons-material"
import { getReportPreview } from "@/lib/api";
import { GrupoA } from "./grupos/a";
import { CATEGORIA_RED, TIPO_CLIENTE } from "app/utils/constants";
import { ReportePreview } from "app/utils/types";






// ✅ Componente interno con el contenido real
function ReportesContent() {
  const [openModal, setOpenModal] = useState(false);
  const [filters, setFilters] = useState({
    grupo: "A", plataforma: "TODAS", cliente: "TODOS", fechaInicio: "", fechaFin: ""
  });

  const [reportPreview, setReportPreview] = useState<ReportePreview>({})

  const handlearchFilter = () => {
    getReportPreview(filters).then((resultReport) => {
      setReportPreview(resultReport.data);
    })
  }

  const Grupos = {
    "A": <GrupoA reportPreview={reportPreview ?? {}}/>
  }

  return (
    <Box sx={{ p: 1, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box >
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#080769' }}>Dashboard de Operaciones</Typography>
          <Typography color="text.secondary">Monitoreo de KPIs por grupo y servicio</Typography>
        </Box>

        <Button variant="contained" startIcon={<Download />} onClick={() => setOpenModal(true)}>
          Exportar Reporte
        </Button>
      </Box>
      <Divider sx={{ mb: 1 }} />

      {/* --- SECCION DE FILTROS --- */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12, lg: 3 }}>
            <TextField fullWidth label="Grupo KPI" select size="medium" value={filters.grupo} onChange={(e) => setFilters({ ...filters, grupo: e.target.value })}>
              <MenuItem value="A">A - Gestión de fallas</MenuItem>
              <MenuItem value="B">B - Por servicio</MenuItem>
              <MenuItem value="C">C - Operativos 7x24</MenuItem>
              <MenuItem value="D">D - Calidad y mejora</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <TextField fullWidth label="Plataforma" select size="medium" value={filters.plataforma} onChange={(e) => setFilters({ ...filters, plataforma: e.target.value })}>
              <MenuItem value="TODAS">Todas</MenuItem>
              {CATEGORIA_RED.map(name =>  <MenuItem value={name} key={name}>{name}</MenuItem>) }
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 2 }}>
            <TextField fullWidth label="Tipo cliente" select size="medium" value={filters.cliente} onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}>
              <MenuItem value="TODOS">Todos</MenuItem>
              { Object.keys(TIPO_CLIENTE).map((key) => <MenuItem key={key} value={TIPO_CLIENTE[key]}>{TIPO_CLIENTE[key]}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 4 }}>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth type="datetime-local" label="Fecha Inicio" value={filters.fechaInicio} onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })} InputLabelProps={{ shrink: true }} size="medium" />
              <TextField fullWidth type="datetime-local" label="Fecha Fin" value={filters.fechaFin} onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })} InputLabelProps={{ shrink: true }} size="medium" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 1 }} justifyItems={"center"}>
            <IconButton size="large" color="primary" onClick={handlearchFilter}>
              <Search />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* --- KPI CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {reportPreview.cards?.map((card, key) => {
          return <KpiCard {...card} key={key} />
        })}
      </Grid>


      {reportPreview.mttrPlataforma && Grupos[filters.grupo]}
    

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

// ✅ Exportar la página protegida
export default function ReportesPage() {
  return (
    <ProtectedRoute module="reportes">
      <ReportesContent />
    </ProtectedRoute>
  );
}