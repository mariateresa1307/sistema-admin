"use client";

import React, { useMemo } from "react";
import { Box, Typography, Card } from "@mui/material";
import Grid from "@mui/material/Grid";
import { BarChart as ChartIcon, Warning } from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ReportePreview } from "app/utils/types";
import { parseMttrToMinutes } from 'app/utils/auxiliares';

interface Props {
  reportPreview: ReportePreview;
}

const minutesToHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;
const formatHours = (hours: number) =>
  `${hours.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} h`;

export function GrupoA({ reportPreview }: Props) {
  console.log('📊 [GrupoA] === DIAGNÓSTICO FRONTEND ===');
  console.log('📊 [GrupoA] reportPreview completo:', reportPreview);
  console.log('📊 [GrupoA] cards array:', reportPreview?.cards);
  
  const cards = reportPreview?.cards || [];
  
  const getCardValue = (title: string) => {
    const card = cards.find(c => c.title === title);
    console.log(`🔍 [GrupoA] Buscando card "${title}":`, card);
    return card?.value || '0';
  };

  const incidenciasPuntuales = getCardValue('Incidencias Puntuales');
  const incidenciasMasivas = getCardValue('Incidencias Masivas');
  const ventanaMantenimiento = getCardValue('Ventana de Mantenimiento');

  const totalPuntuales = parseInt(incidenciasPuntuales) || 0;
  const totalMasivas = parseInt(incidenciasMasivas) || 0;
  const totalMantenimiento = parseInt(ventanaMantenimiento) || 0;

  console.log(' [GrupoA] Valores extraídos:', {
    totalPuntuales,
    totalMasivas,
    totalMantenimiento,
    total: totalPuntuales + totalMasivas + totalMantenimiento
  });

  const mttrPlataformaData = reportPreview?.mttrPlataforma || [];
  const mttrServicioData = reportPreview?.mttrServicio || [];
  
  const mttrPlataformaHours = mttrPlataformaData
    .filter(item => item.value > 0)
    .map(({ title, value }) => ({
      title,
      value: minutesToHours(value),
    }));

  const mttrServicioHours = mttrServicioData
    .filter(item => item.value > 0)
    .map(({ title, value }) => ({
      title,
      value: minutesToHours(value),
    }));

  const tipoIncidenciaData = useMemo(() => {
    const data = [
      { name: 'Puntuales', value: totalPuntuales, color: '#42f5a8' },
      { name: 'Masivas', value: totalMasivas, color: '#f54242' },
      { name: 'Mantenimiento', value: totalMantenimiento, color: '#f5a842' },
    ];
    console.log('🥧 [GrupoA] Datos para gráfica de torta:', data);
    return data;
  }, [totalPuntuales, totalMasivas, totalMantenimiento]);

  console.log(' [GrupoA] === FIN DIAGNÓSTICO ===');

  if (cards.length === 0 && mttrPlataformaData.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay datos disponibles para el período seleccionado
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* === GRÁFICO DE TORTA === */}
      <Grid size={{ xs: 12, lg: 12 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Warning sx={{ mr: 1, color: '#f5a842' }} /> Distribución por Tipo de Incidencia
          </Typography>
          
          {totalPuntuales === 0 && totalMasivas === 0 && totalMantenimiento === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay incidencias clasificadas para el período seleccionado
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Verifica que los tickets tengan el campo "tipoIncidencia" con valores: PUNTUAL, MASIVA o MANTENIMIENTO
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tipoIncidenciaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tipoIncidenciaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} incidentes`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#2e7d32' }}>Incidencias Puntuales</Typography>
                      <Typography variant="caption" color="text.secondary">Fallas individuales</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#2e7d32' }}>{totalPuntuales}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#c62828' }}>Incidencias Masivas</Typography>
                      <Typography variant="caption" color="text.secondary">Afectación múltiple</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#c62828' }}>{totalMasivas}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#ef6c00' }}>Ventana de Mantenimiento</Typography>
                      <Typography variant="caption" color="text.secondary">Mantenimientos programados</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef6c00' }}>{totalMantenimiento}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </Card>
      </Grid>

      {/* === GRÁFICOS MTTR === */}
      {mttrPlataformaHours.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} /> MTTR por Plataforma
            </Typography>
            <Typography sx={{ mb: 3, fontSize: '12px' }}>Tiempo medio de reparación por categoría (en horas)</Typography>
            <Box sx={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mttrPlataformaHours} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="title" interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatHours} />
                  <Tooltip formatter={(value) => formatHours(Number(value))} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      ) : (
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No hay datos de MTTR por plataforma disponibles
            </Typography>
          </Card>
        </Grid>
      )}

      {mttrServicioHours.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} /> MTTR por Servicio
            </Typography>
            <Typography sx={{ mb: 3, fontSize: '12px' }}>Tiempo medio de reparación por tipo de cliente (en horas)</Typography>
            <Box sx={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mttrServicioHours} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="title" interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatHours} />
                  <Tooltip formatter={(value) => formatHours(Number(value))} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      ) : (
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No hay datos de MTTR por servicio disponibles
            </Typography>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}