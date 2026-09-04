'use client';
import React from 'react';
import { Paper, Typography, Box, alpha } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import {
  BarChart as ChartIcon,
  TrendingUp,
  CheckCircle,
  Warning,
  Build,
  Category,
  AccessTime,
  Star
} from '@mui/icons-material';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

// ✅ Mapeo de estilo según el tipo de KPI
const getCardStyle = (title: string) => {
  const t = (title || '').toLowerCase();
  
  if (t.includes('plataforma')) return { color: '#1976d2', icon: <ChartIcon /> };
  if (t.includes('servicio')) return { color: '#7b1fa2', icon: <TrendingUp /> };
  if (t.includes('resuelta') || t.includes('soporte')) return { color: '#388e3c', icon: <CheckCircle /> };
  if (t.includes('puntual')) return { color: '#2e7d32', icon: <CheckCircle /> };
  
  // ✅ Agregado 'incidentes mayores' para que coincida con el Grupo D
  if (t.includes('masiva') || t.includes('incidentes mayores')) return { color: '#c62828', icon: <Warning /> };
  
  if (t.includes('mantenimiento')) return { color: '#ef6c00', icon: <Build /> };
  if (t.includes('total')) return { color: '#f57c00', icon: <Category /> };
  
  // ✅ NUEVOS CASOS ESPECÍFICOS PARA GRUPO D
  if (t.includes('escalamiento')) return { color: '#f57c00', icon: <AccessTime /> };
  if (t.includes('documentado')) return { color: '#388e3c', icon: <CheckCircle /> };
  if (t.includes('demandante')) return { color: '#1976d2', icon: <Star /> };
  
  // Default
  return { color: '#080769', icon: <ChartIcon /> };
};

const KpiItem = ({ title, value, subtitle }: KpiCardProps) => {
  const { color, icon } = getCardStyle(title);

  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: '24px',
          borderRadius: '10px',
          bgcolor: '#ffffff',
          border: `1px solid ${alpha(color, 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          height: '100%',
          '&:hover': {
            boxShadow: `0 12px 24px -8px ${alpha(color, 0.3)}`,
            borderColor: alpha(color, 0.4),
          },
        }}
      >
        {/* Background accent circle */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(color, 0.06),
            transition: '0.3s',
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#64748b',
              backgroundColor: alpha(color, 0.1),
              px: 2,
              py: 1,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              color,
              display: 'flex',
              alignItems: 'center',
              '& svg': { fontSize: '1.2rem' },
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
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

export const KpiCard = (props: KpiCardProps) => (
  <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
    <KpiItem {...props} />
  </Grid>
);