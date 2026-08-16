'use client';
import React, { useState } from 'react';
import { Paper, Typography, Grid, Box, IconButton, Tooltip } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { ServicioChartData, TipoServicioChartData } from '../../hooks/useIncidenciasData';

interface Props {
  barData: ServicioChartData[];
  pieData: TipoServicioChartData[];
}

const CHART_COLORS = [
  '#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
];

const ITEMS_PER_PAGE = 10;

export const IncidenciasChart = ({ barData, pieData }: Props) => {
  const [barPage, setBarPage] = useState(0);

  const paginatedBarData = barData.slice(
    barPage * ITEMS_PER_PAGE,
    (barPage + 1) * ITEMS_PER_PAGE
  );

  const totalBarPages = Math.ceil(barData.length / ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    setBarPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setBarPage((prev) => Math.min(totalBarPages - 1, prev + 1));
  };

  if (barData.length === 0 && pieData.length === 0) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* ✅ Gráfico de Barras: Top Servicios (por nombre) */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#080769' }}>
              Top Servicios con Más Incidencias
            </Typography>
            {totalBarPages > 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Página anterior">
                  <span>
                    <IconButton
                      onClick={handlePrevPage}
                      disabled={barPage === 0}
                      size="small"
                      sx={{ color: '#080769' }}
                    >
                      <ChevronLeft />
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  {barPage + 1} / {totalBarPages}
                </Typography>
                <Tooltip title="Página siguiente">
                  <span>
                    <IconButton
                      onClick={handleNextPage}
                      disabled={barPage === totalBarPages - 1}
                      size="small"
                      sx={{ color: '#080769' }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>

          {paginatedBarData.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <Typography color="text.secondary">No hay datos para mostrar</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={paginatedBarData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="nombre"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="abiertas" fill="#f5576c" name="Abiertas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cerradas" fill="#00f2fe" name="Cerradas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#080769', mb: 2 }}>
            Distribución por Tipo de Servicio
          </Typography>

          {pieData.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <Typography color="text.secondary">No hay datos para mostrar</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="42%"
                  cy="58%"
                  labelLine={false}
                  label={({ name, percent }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};