'use client';
import React from 'react';
import { 
  Paper, Typography, Box, alpha
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
  Assessment
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ReportePreview } from 'app/utils/types';

// ==========================================
// COMPONENTE KPI CARD (Manteniendo el buen diseño)
// ==========================================
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const getCardStyle = (title: string) => {
  const t = (title || '').toLowerCase();
  if (t.includes('plataforma') || t.includes('tiempo')) return { color: '#1976d2', icon: <ChartIcon /> };
  if (t.includes('servicio')) return { color: '#7b1fa2', icon: <TrendingUp /> };
  if (t.includes('resuelta') || t.includes('soporte')) return { color: '#388e3c', icon: <CheckCircle /> };
  if (t.includes('puntual')) return { color: '#2e7d32', icon: <Warning /> };
  if (t.includes('masiva')) return { color: '#c62828', icon: <Warning /> };
  if (t.includes('mantenimiento')) return { color: '#ef6c00', icon: <Build /> };
  if (t.includes('total') || t.includes('recurrente') || t.includes('falla')) return { color: '#f57c00', icon: <Assessment /> };
  if (t.includes('tasa')) return { color: '#0288d1', icon: <TrendingUp /> };
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
          borderRadius: '16px',
          bgcolor: '#ffffff',
          border: `1px solid ${alpha(color, 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          height: '100%',
          '&:hover': {
            boxShadow: `0 12px 24px -8px ${alpha(color, 0.2)}`,
            borderColor: alpha(color, 0.3),
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
// COMPONENTE PRINCIPAL GRUPO B
// ==========================================
interface TiempoPorServicioRow {
  title: string;
  value: number;
}

interface FallaRecurrenteRow {
  servicio: string;
  causaRaiz: string;
  cantidad: number;
}

interface GrupoBReportPreview extends ReportePreview {
  fallasRecurrentes?: FallaRecurrenteRow[];
  tiempoPorServicio?: TiempoPorServicioRow[];
}

interface Props { 
  reportPreview: ReportePreview; 
}

const formatTiempo = (minutos: number): string => {
  if (!minutos || minutos <= 0) return '0h 0m';
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  return `${horas}h ${mins}m`;
};

const COLORES_BARRA = [
  '#1976d2', '#c62828', '#2e7d32', '#ef6c00', '#7b1fa2',
  '#0288d1', '#388e3c', '#f57c00', '#d32f2f', '#0277bd'
];

export const GrupoB = ({ reportPreview }: Props) => {
  const { fallasRecurrentes = [], tiempoPorServicio = [] } = reportPreview as GrupoBReportPreview;

  const chartData = fallasRecurrentes.map((falla, index) => ({
    name: falla.servicio,
    causaRaiz: falla.causaRaiz,
    cantidad: falla.cantidad,
    color: COLORES_BARRA[index % COLORES_BARRA.length],
  }));

  const tiempoChartData = tiempoPorServicio
    .map((row, index) => ({
      name: row.title,
      horas: Math.round((row.value / 60) * 10) / 10,
      minutos: row.value,
      color: COLORES_BARRA[index % COLORES_BARRA.length],
    }))
    .sort((a, b) => b.horas - a.horas);

  const calcularTiempoPromedio = () => {
    if (tiempoPorServicio.length === 0) return '0h 0m';
    const totalTiempo = tiempoPorServicio.reduce((sum, t) => sum + t.value, 0);
    const promedioMinutos = totalTiempo / tiempoPorServicio.length;
    return formatTiempo(promedioMinutos);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      {/* ==========================================
          SECCIÓN 1: KPIs PRINCIPALES
      ========================================== */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <KpiCardGrid title="Tiempo Promedio por Servicio" value={calcularTiempoPromedio()} subtitle="Promedio MTTR global" />
        <KpiCardGrid title="Fallas Recurrentes" value={fallasRecurrentes.length} subtitle="Últimos 30 días" />
        <KpiCardGrid title="Tasa de Recurrencia" value={reportPreview.cards?.find(c => c.title === 'Tasa de recurrencia')?.value || '0%'} subtitle="Misma causa raíz" />
      </Grid>

      {/* ==========================================
          SECCIÓN 2: TIEMPO PROMEDIO DE AFECTACIÓN
      ========================================== */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#1976d2', 0.1), display: 'flex' }}>
            <ChartIcon sx={{ color: '#1976d2', fontSize: '1.2rem' }} />
          </Box>
          Tiempo Promedio de Afectación por Servicio
        </Typography>
        
        <Grid container spacing={3}>
          {/* Lista de tiempos - Diseño limpio tipo tarjeta */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%' }}>
              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Detalle por Servicio
                </Typography>
              </Box>
              <Box>
                {tiempoPorServicio.map((row: TiempoPorServicioRow, i: number) => {
                  const horas = Math.floor(row.value / 60);
                  const mins = Math.round(row.value % 60);
                  return (
                    <Box
                      key={i}
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: i < tiempoPorServicio.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {row.value} minutos totales
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: alpha('#1976d2', 0.08),
                          border: `1px solid ${alpha('#1976d2', 0.15)}`,
                          textAlign: 'center',
                          minWidth: 80
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, color: '#1976d2', fontSize: '1rem', lineHeight: 1.2 }}>
                          {horas}h {mins}m
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                {tiempoPorServicio.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Sin datos disponibles</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Gráfica de tiempo por servicio */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%', minHeight: 380 }}>
              <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                Distribución de tiempo de resolución
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tiempoChartData} layout="vertical" margin={{ top: 10, right: 40, left: 110, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} interval={0} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: alpha('#1976d2', 0.05) }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '10px 14px' }}
                      formatter={(
                        value: number | string | readonly (number | string)[] | undefined,
                        name: string | number | undefined,
                      ): [string, string] => {
                        const numericValue = Number(Array.isArray(value) ? value[0] : value ?? 0);
                        const label = String(name ?? '');
                        return [label === 'horas' ? `${numericValue} horas` : `${numericValue} minutos`, 'Tiempo'];
                      }}
                    />
                    <Bar dataKey="horas" radius={[0, 6, 6, 0]} barSize={28}>
                      {tiempoChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ==========================================
          SECCIÓN 3: FALLAS RECURRENTES
      ========================================== */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#c62828', 0.1), display: 'flex' }}>
            <Warning sx={{ color: '#c62828', fontSize: '1.2rem' }} />
          </Box>
          Fallas Recurrentes (Últimos 30 días)
        </Typography>
        
        {fallasRecurrentes.length > 0 ? (
          <Grid container spacing={3}>
            {/* Gráfica de Barras */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%', minHeight: 400 }}>
                <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  Volumen de Incidentes
                </Typography>
                <Box sx={{ height: 340 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 40, left: 110, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} interval={0} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: alpha('#c62828', 0.05) }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '10px 14px' }}
                        formatter={(value, name, props: any) => {
                          const amount = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                          const label = props?.payload?.name ?? String(name ?? '');
                          return [`${amount} incidentes`, label];
                        }}
                      />
                      <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={28}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Lista Detallada - Diseño limpio tipo tarjeta */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Detalle de Fallas
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {fallasRecurrentes.map((row: FallaRecurrenteRow, i: number) => (
                    <Box
                      key={i}
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: i < fallasRecurrentes.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    >
                      <Box sx={{ flex: 1, pr: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                          {row.servicio}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          {row.causaRaiz}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 40, height: 40, borderRadius: '50%',
                          fontWeight: 800, fontSize: '1rem',
                          bgcolor: row.cantidad > 2 ? alpha('#c62828', 0.1) : alpha('#ef6c00', 0.1),
                          color: row.cantidad > 2 ? '#c62828' : '#ef6c00',
                          border: `1px solid ${row.cantidad > 2 ? alpha('#c62828', 0.2) : alpha('#ef6c00', 0.2)}`
                        }}
                      >
                        {row.cantidad}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#f8fafc', display: 'inline-flex', mb: 2 }}>
              <Warning sx={{ color: '#94a3b8', fontSize: 40 }} />
            </Box>
            <Typography color="text.secondary" variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Sin fallas recurrentes</Typography>
            <Typography color="text.secondary" variant="body2">No se registraron fallas con la misma causa raíz en los últimos 30 días.</Typography>
          </Paper>
        )}
      </Box>

      {/* ==========================================
          SECCIÓN 4: TASA DE INCIDENTES RECURRENTES
      ========================================== */}
       
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#0288d1', 0.1), display: 'flex' }}>
            <TrendingUp sx={{ color: '#0288d1', fontSize: '1.2rem' }} />
          </Box>
          Tasa de Incidentes Recurrentes
        </Typography>
        
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Typography variant="body2" sx={{ mb: 4, color: '#64748b', fontStyle: 'italic', bgcolor: '#f8fafc', p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <b>Fórmula:</b> (N° de incidentes repetidos por misma falla / Total incidentes) × 100
          </Typography>
          

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3.5, bgcolor: alpha('#c62828', 0.04), borderRadius: 3, border: `1px solid ${alpha('#c62828', 0.15)}`, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total incidentes recurrentes
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#c62828', fontSize: '3rem', lineHeight: 1 }}>
                  {fallasRecurrentes.reduce((sum, r) => sum + r.cantidad, 0)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3.5, bgcolor: alpha('#1976d2', 0.04), borderRadius: 3, border: `1px solid ${alpha('#1976d2', 0.15)}`, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total tickets
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#1976d2', fontSize: '3rem', lineHeight: 1 }}>
                  {/* ✅ Usamos 'as any' para evitar bloqueos de TypeScript si la interfaz no se actualizó */}
                  {(reportPreview as any).totalTickets || 0}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center', p: 3.5, bgcolor: alpha('#0288d1', 0.04), borderRadius: 3, border: `1px solid ${alpha('#0288d1', 0.15)}`, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tasa de recurrencia
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#0288d1', fontSize: '3rem', lineHeight: 1 }}>
                  {(reportPreview as any).cards?.find((c: any) => c.title === 'Tasa de recurrencia')?.value || '0%'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};