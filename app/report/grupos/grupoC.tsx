'use client';
import React from 'react';
import { 
  Paper, Typography, Box, alpha, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import {
  BarChart as ChartIcon,
  TrendingUp,
  CheckCircle,
  Warning,
  Build,
  Category,
  Assessment,
  People
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReportePreview } from 'app/utils/types';

// ==========================================
// COMPONENTE KPI CARD (Mismo estilo que Grupo B)
// ==========================================
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const getCardStyle = (title: string) => {
  const t = (title || '').toLowerCase();
  if (t.includes('rotación') || t.includes('diurna')) return { color: '#1976d2', icon: <TrendingUp /> };
  if (t.includes('nocturna')) return { color: '#7b1fa2', icon: <TrendingUp /> };
  if (t.includes('eficiencia') || t.includes('cierre')) return { color: '#ef6c00', icon: <Assessment /> };
  if (t.includes('operador')) return { color: '#0288d1', icon: <People /> };
  return { color: '#080769', icon: <ChartIcon /> };
};

const KpiItem = ({ title, value, subtitle }: KpiCardProps) => {
  const { color, icon } = getCardStyle(title);

  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', height: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: '24px',
          borderRadius: '12px',
          bgcolor: '#ffffff',
          border: `1px solid ${alpha(color, 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          height: '100%',
          '&:hover': {
            boxShadow: `0 12px 24px -8px ${alpha(color, 0.25)}`,
            borderColor: alpha(color, 0.4),
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(color, 0.06) }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', backgroundColor: alpha(color, 0.1), px: 2, py: 1, borderRadius: '9999px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Box sx={{ color, display: 'flex', alignItems: 'center', '& svg': { fontSize: '1.2rem' } }}>
            {icon}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontSize: '2rem' }}>
            {value}
          </Typography>
        </Box>

        {subtitle && (
          <Typography variant="caption" sx={{ color: '#8fa6c7', fontWeight: 500, mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
};

const KpiCardGrid = (props: KpiCardProps) => (
  <Grid size={{ xs: 12, sm: 12, md: 4 }}>
    <KpiItem {...props} />
  </Grid>
);

// ==========================================
// COMPONENTE PRINCIPAL GRUPO C
// ==========================================
interface TicketPorOperador {
  name: string;
  cantidad: number;
}

interface GrupoCReportPreview extends ReportePreview {
  ticketsPorOperador?: TicketPorOperador[];
  promedioPorOperador?: number;
  cantidadOperadores?: number;
}

interface Props { 
  reportPreview: ReportePreview; 
}

const COLORES_BARRA = [
  '#1976d2', '#7b1fa2', '#388e3c', '#ef6c00', '#c62828',
  '#0288d1', '#0277bd', '#f57c00', '#d32f2f', '#5e35b1'
];

export const GrupoC = ({ reportPreview }: Props) => {
  const { 
    ticketsPorOperador = [], 
    promedioPorOperador = 0, 
    cantidadOperadores = 0 
  } = reportPreview as GrupoCReportPreview;

  // Extraer KPIs de las cards - ✅ ELIMINADA % Detección Proactiva
  const tasaRotacionDiurna = reportPreview.cards?.find(c => c.title === 'Tasa rotación diurna')?.value || '0%';
  const tasaRotacionNocturna = reportPreview.cards?.find(c => c.title === 'Tasa rotación nocturna')?.value || '0%';
  const eficienciaCierre = reportPreview.cards?.find(c => c.title === 'Eficiencia de cierre')?.value || '0%';

  // Preparar datos para la gráfica de operadores
  const chartData = ticketsPorOperador
    .map((op, index) => ({
      name: op.name,
      cantidad: op.cantidad,
      color: COLORES_BARRA[index % COLORES_BARRA.length],
    }))
    .sort((a, b) => b.cantidad - a.cantidad); // Ordenar de mayor a menor

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      {/* ==========================================
          SECCIÓN 1: KPIs PRINCIPALES (Solo 3 cards)
      ========================================== */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <KpiCardGrid title="Tasa Rotación Diurna" value={tasaRotacionDiurna} subtitle="Turno 7am-7pm" />
        <KpiCardGrid title="Tasa Rotación Nocturna" value={tasaRotacionNocturna} subtitle="Turno 7pm-7am" />
        <KpiCardGrid title="Eficiencia de Cierre" value={eficienciaCierre} subtitle="Tickets cerrados/recibidos" />
      </Grid>

      {/* ==========================================
          SECCIÓN 2: TICKETS POR OPERADOR
      ========================================== */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#0288d1', 0.1), display: 'flex' }}>
            <People sx={{ color: '#0288d1', fontSize: '1.2rem' }} />
          </Box>
          Tickets por Operador
        </Typography>
        
        <Grid container spacing={3}>
          {/* Gráfica de barras */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%', minHeight: 450 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center', color: '#334155' }}>
                Actividades Atendidas por Operador
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} 
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: alpha('#0288d1', 0.05) }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                        padding: '10px 14px' 
                      }}
                      formatter={(value) => [`${value ?? 0} tickets`, 'Cantidad']}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Tabla de operadores */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ranking de Operadores
                </Typography>
              </Box>
              <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
                {ticketsPorOperador.map((op, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: i < ticketsPorOperador.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: alpha(COLORES_BARRA[i % COLORES_BARRA.length], 0.15),
                          color: COLORES_BARRA[i % COLORES_BARRA.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {op.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: alpha('#0288d1', 0.08),
                        border: `1px solid ${alpha('#0288d1', 0.15)}`,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: '#0288d1', fontSize: '0.95rem' }}>
                        {op.cantidad}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {ticketsPorOperador.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Sin datos de operadores</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ==========================================
          SECCIÓN 3: MÉTRICAS ADICIONALES
      ========================================== */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7b1fa2', 0.1), display: 'flex' }}>
            <Assessment sx={{ color: '#7b1fa2', fontSize: '1.2rem' }} />
          </Box>
          Métricas de Operadores
        </Typography>
        
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3.5, bgcolor: alpha('#0288d1', 0.04), borderRadius: 3, border: `1px solid ${alpha('#0288d1', 0.15)}`, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Operadores
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#0288d1', fontSize: '3rem', lineHeight: 1 }}>
                  {cantidadOperadores}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3.5, bgcolor: alpha('#7b1fa2', 0.04), borderRadius: 3, border: `1px solid ${alpha('#7b1fa2', 0.15)}`, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Promedio por Operador
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#7b1fa2', fontSize: '3rem', lineHeight: 1 }}>
                  {promedioPorOperador}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3.5, bgcolor: alpha('#ef6c00', 0.04), borderRadius: 3, border: `1px solid ${alpha('#ef6c00', 0.15)}`, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Tickets Cerrados
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ef6c00', fontSize: '3rem', lineHeight: 1 }}>
                  {ticketsPorOperador.reduce((sum, op) => sum + op.cantidad, 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};